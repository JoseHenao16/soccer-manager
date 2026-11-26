import { GUARDRAIL_REMINDER, MODE_INSTRUCTIONS } from "@/core/domain/assistant";
import type { AssistantConfig, Conversation, Message, User } from "@/core/domain/entities";
import { AIProviderError } from "@/core/domain/errors";
import type {
  AIProvider,
  ChatMessage,
  CompletionResult,
  FinishReason,
} from "@/core/domain/ports/ai-provider";
import type {
  AssistantConfigRepository,
  ConversationRepository,
  MessageRepository,
} from "@/core/domain/ports/repositories";
import { getOwnedConversation } from "./conversations";

export interface SendMessageDeps {
  conversations: ConversationRepository;
  messages: MessageRepository;
  config: AssistantConfigRepository;
  ai: AIProvider;
}

export interface Exchange {
  conversation: Conversation;
  userMessage: Message;
  assistantMessage: Message;
}

export const DEFAULT_TITLE = "Nueva conversación";
export const TRUNCATED_NOTE = "\n\n_(Respuesta recortada por el límite de longitud configurado.)_";

function buildTitle(content: string): string {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? `${clean.slice(0, 48).trimEnd()}…` : clean;
}

// ── Pasos compartidos ─────────────────────────────────────────────

interface Prepared {
  conversation: Conversation;
  config: AssistantConfig;
  prompt: ChatMessage[];
}

/**
 * 1) valida dueño  2) arma: System Prompt + modo → historial (contexto) → recordatorio de
 *    límites → nueva pregunta.
 */
async function prepare(deps: SendMessageDeps, user: User, conversationId: string, content: string): Promise<Prepared> {
  const conversation = await getOwnedConversation(deps.conversations, user, conversationId);
  const config = await deps.config.get();
  const history = await deps.messages.lastN(conversationId, Math.max(config.historyLimit - 1, 0));
  const modeInstruction = MODE_INSTRUCTIONS[conversation.mode];

  const prompt: ChatMessage[] = [
    {
      role: "system",
      content: modeInstruction ? `${config.systemPrompt}\n\n${modeInstruction}` : config.systemPrompt,
    },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "system", content: GUARDRAIL_REMINDER },
    { role: "user", content },
  ];
  return { conversation, config, prompt };
}

function finalContent(raw: string, finishReason?: FinishReason): string {
  const content = raw.trim();
  if (!content) {
    throw new AIProviderError("El asistente devolvió una respuesta vacía. Inténtalo de nuevo.", true);
  }
  return finishReason === "length" ? content + TRUNCATED_NOTE : content;
}

/** Guarda pregunta + respuesta solo cuando hay respuesta válida (sin huérfanos ni duplicados). */
async function persist(
  deps: SendMessageDeps,
  conversation: Conversation,
  content: string,
  result: CompletionResult,
  latencyMs: number,
): Promise<Exchange> {
  const userMessage = await deps.messages.create({ conversationId: conversation.id, role: "user", content });
  const assistantMessage = await deps.messages.create({
    conversationId: conversation.id,
    role: "assistant",
    content: result.content,
    model: result.model,
    tokens: result.tokens,
    latencyMs,
  });

  let updated = conversation;
  if (conversation.title === DEFAULT_TITLE) {
    updated = await deps.conversations.update(conversation.id, { title: buildTitle(content) });
  } else {
    await deps.conversations.touch(conversation.id);
  }
  return { conversation: updated, userMessage, assistantMessage };
}

function wrapUnknown(error: unknown): AIProviderError {
  if (error instanceof AIProviderError) return error;
  console.error("[sendMessage] Error del proveedor de IA:", error);
  return new AIProviderError("El asistente no está disponible en este momento. Inténtalo de nuevo.", true);
}

// ── Casos de uso ──────────────────────────────────────────────────

/** Variante sin streaming: devuelve la respuesta completa. */
export async function sendMessage(
  deps: SendMessageDeps,
  user: User,
  conversationId: string,
  content: string,
): Promise<Exchange> {
  const { conversation, config, prompt } = await prepare(deps, user, conversationId, content);
  const started = Date.now();
  let result: CompletionResult;
  try {
    result = await deps.ai.complete({
      messages: prompt,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });
  } catch (error) {
    throw wrapUnknown(error);
  }
  const text = finalContent(result.content, result.finishReason);
  return persist(deps, conversation, content, { ...result, content: text }, Date.now() - started);
}

export type MessageStreamEvent =
  | { type: "delta"; text: string }
  | ({ type: "done" } & Exchange)
  | { type: "error"; code: string; message: string; retryable: boolean };

/**
 * Variante con streaming. La validación (dueño, config, prompt) ocurre ANTES de devolver
 * el iterador, así esos errores se responden como JSON normal. Los errores durante la
 * generación se emiten como evento "error" y no se guarda nada.
 */
export async function streamMessage(
  deps: SendMessageDeps,
  user: User,
  conversationId: string,
  content: string,
  signal?: AbortSignal,
): Promise<AsyncIterable<MessageStreamEvent>> {
  const { conversation, config, prompt } = await prepare(deps, user, conversationId, content);

  return (async function* () {
    const started = Date.now();
    let text = "";
    try {
      let end: { model: string; tokens: number | null; finishReason: FinishReason } | null = null;
      for await (const chunk of deps.ai.stream({
        messages: prompt,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        signal,
      })) {
        if (chunk.type === "delta") {
          text += chunk.text;
          yield { type: "delta", text: chunk.text };
        } else {
          end = chunk;
        }
      }
      const finalText = finalContent(text, end?.finishReason);
      if (finalText !== text.trim()) yield { type: "delta", text: TRUNCATED_NOTE };
      const exchange = await persist(
        deps,
        conversation,
        content,
        { content: finalText, model: end?.model ?? config.model, tokens: end?.tokens ?? null },
        Date.now() - started,
      );
      yield { type: "done", ...exchange };
    } catch (error) {
      if (signal?.aborted) return; // el cliente se fue: no hay a quién avisar
      const e = wrapUnknown(error);
      yield { type: "error", code: e.code, message: e.message, retryable: e.retryable };
    }
  })();
}
