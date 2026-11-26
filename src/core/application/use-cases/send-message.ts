import { MODE_INSTRUCTIONS } from "@/core/domain/assistant";
import type { Conversation, Message, User } from "@/core/domain/entities";
import { AIProviderError } from "@/core/domain/errors";
import type { AIProvider, ChatMessage, CompletionResult } from "@/core/domain/ports/ai-provider";
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

export const DEFAULT_TITLE = "Nueva conversación";

function buildTitle(content: string): string {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? `${clean.slice(0, 48).trimEnd()}…` : clean;
}

/**
 * Flujo principal del chat:
 * 1) valida dueño  2) arma System Prompt + modo + historial + nueva pregunta
 * 3) llama al proveedor de IA  4) solo si hay respuesta válida, guarda pregunta y respuesta.
 * Así un fallo de la IA no deja preguntas huérfanas y el reintento no duplica mensajes.
 */
export async function sendMessage(
  deps: SendMessageDeps,
  user: User,
  conversationId: string,
  content: string,
): Promise<{ conversation: Conversation; userMessage: Message; assistantMessage: Message }> {
  let conversation = await getOwnedConversation(deps.conversations, user, conversationId);

  const config = await deps.config.get();
  const history = await deps.messages.lastN(conversationId, Math.max(config.historyLimit - 1, 0));
  const modeInstruction = MODE_INSTRUCTIONS[conversation.mode];

  const prompt: ChatMessage[] = [
    {
      role: "system",
      content: modeInstruction ? `${config.systemPrompt}\n\n${modeInstruction}` : config.systemPrompt,
    },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content },
  ];

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
    if (error instanceof AIProviderError) throw error;
    console.error("[sendMessage] Error del proveedor de IA:", error);
    throw new AIProviderError("El asistente no está disponible en este momento. Inténtalo de nuevo.", true);
  }
  const latencyMs = Date.now() - started;

  if (!result.content.trim()) {
    throw new AIProviderError("El asistente devolvió una respuesta vacía. Inténtalo de nuevo.", true);
  }

  const userMessage = await deps.messages.create({ conversationId, role: "user", content });
  const assistantMessage = await deps.messages.create({
    conversationId,
    role: "assistant",
    content: result.content,
    model: result.model,
    tokens: result.tokens,
    latencyMs,
  });

  // Título automático con la primera pregunta; si no, solo actualiza updatedAt.
  if (conversation.title === DEFAULT_TITLE) {
    conversation = await deps.conversations.update(conversationId, { title: buildTitle(content) });
  } else {
    await deps.conversations.touch(conversationId);
  }

  return { conversation, userMessage, assistantMessage };
}
