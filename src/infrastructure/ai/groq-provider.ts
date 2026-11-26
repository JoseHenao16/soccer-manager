import "server-only";
import Groq from "groq-sdk";
import { AIProviderError } from "@/core/domain/errors";
import type {
  AIProvider,
  CompletionRequest,
  CompletionResult,
  FinishReason,
  StreamChunk,
} from "@/core/domain/ports/ai-provider";

/**
 * Perfil por modelo (plan gratuito de Groq, medido en pruebas reales):
 * - gpt-oss-120b: mejor calidad. Razona ("medium" corrigió errores de reglamento que "low"
 *   cometía); el razonamiento consume tokens de salida, por eso se suma un margen.
 * - qwen3.8-27b: respeta muy bien los límites del asistente, pero su cupo de SALIDA es de
 *   1.000 tokens/min y Groq rechaza peticiones que reserven más → sin razonamiento y tope 950.
 * - gpt-oss-20b: NO se usa como respaldo: en las pruebas respondió temas fuera del dominio
 *   e inventó una estadística (ver docs/PRUEBAS-IA.md).
 * Groq descuenta del cupo por minuto los tokens RESERVADOS (max_tokens), no solo los usados.
 */
interface ModelProfile {
  reasoning: "none" | "low" | "medium";
  /** Margen extra para el razonamiento (no se muestra al usuario). */
  headroom: number;
  /** Tope absoluto de tokens de salida por petición (cupo del plan gratuito). */
  maxOutput?: number;
}

const PROFILES: Record<string, ModelProfile> = {
  "openai/gpt-oss-120b": { reasoning: "medium", headroom: 1024 },
  "openai/gpt-oss-20b": { reasoning: "medium", headroom: 1024 },
  "qwen/qwen3.8-27b": { reasoning: "none", headroom: 0, maxOutput: 950 },
};
const DEFAULT_PROFILE: ModelProfile = { reasoning: "none", headroom: 0 };

/**
 * Respaldo cuando el modelo configurado no está disponible (cada modelo tiene su propio cupo).
 * Si también falla, se reintenta el modelo configurado respetando el retry-after de Groq.
 */
export const FALLBACK_CHAIN = ["qwen/qwen3.8-27b"];

const mapFinish = (reason: string | null | undefined): FinishReason =>
  reason === "stop" ? "stop" : reason === "length" ? "length" : "other";

/** Errores ante los que conviene probar el siguiente modelo en vez de esperar. */
const shouldFallback = (error: unknown) =>
  error instanceof Groq.RateLimitError ||
  error instanceof Groq.InternalServerError ||
  error instanceof Groq.APIConnectionError; // incluye timeout

/** Traduce los errores del SDK de Groq a errores de dominio con mensajes para el usuario. */
function toDomainError(error: unknown): AIProviderError {
  if (error instanceof AIProviderError) return error;
  if (error instanceof Groq.RateLimitError) {
    return new AIProviderError(
      "El asistente está recibiendo muchas consultas. Espera unos segundos e inténtalo de nuevo.",
      true,
      "RATE_LIMIT",
    );
  }
  if (error instanceof Groq.APIConnectionTimeoutError) {
    return new AIProviderError("El asistente tardó demasiado en responder. Inténtalo de nuevo.", true, "TIMEOUT");
  }
  if (
    error instanceof Groq.AuthenticationError ||
    error instanceof Groq.PermissionDeniedError ||
    error instanceof Groq.NotFoundError
  ) {
    console.error("[GroqProvider] Error de configuración (API key o modelo):", error.message);
    return new AIProviderError("El asistente no está bien configurado. Avísale al administrador.", false, "CONFIG");
  }
  if (error instanceof Groq.BadRequestError) {
    console.error("[GroqProvider] Petición rechazada:", error.message);
    return new AIProviderError(
      "La consulta no pudo procesarse (quizá la conversación es muy larga). Prueba en una conversación nueva.",
      false,
    );
  }
  console.error("[GroqProvider] Error inesperado:", error);
  return new AIProviderError("El asistente no está disponible en este momento. Inténtalo de nuevo.", true);
}

export class GroqProvider implements AIProvider {
  readonly name = "groq";
  /** Sin reintentos internos: ante un 429 se pasa al siguiente modelo de inmediato. */
  private readonly fast: Groq;
  /** Último intento (modelo configurado): reintenta 429/5xx esperando el retry-after. */
  private readonly patient: Groq;

  constructor(
    apiKey: string,
    private readonly fallbacks: string[] = FALLBACK_CHAIN,
  ) {
    this.fast = new Groq({ apiKey, timeout: 30_000, maxRetries: 0 });
    this.patient = new Groq({ apiKey, timeout: 25_000, maxRetries: 1 });
  }

  private params(req: CompletionRequest) {
    const profile = PROFILES[req.model] ?? DEFAULT_PROFILE;
    let maxTokens = req.maxTokens + profile.headroom;
    if (profile.maxOutput) maxTokens = Math.min(maxTokens, profile.maxOutput);
    return {
      model: req.model,
      messages: req.messages,
      temperature: req.temperature,
      max_completion_tokens: maxTokens,
      ...(profile.reasoning !== "none"
        ? { reasoning_effort: profile.reasoning, include_reasoning: false }
        : req.model.startsWith("qwen/")
          ? { reasoning_effort: "none" as const }
          : {}),
    };
  }

  /**
   * Cadena: modelo configurado → respaldos → modelo configurado otra vez (esperando el cupo).
   * El modelo que finalmente respondió queda registrado en el mensaje (campo `model`).
   */
  private async withFallback<T>(req: CompletionRequest, call: (client: Groq, req: CompletionRequest) => Promise<T>) {
    const chain = [req.model, ...this.fallbacks.filter((m) => m !== req.model), req.model];
    let lastError: unknown;
    for (const [i, model] of chain.entries()) {
      const isLast = i === chain.length - 1;
      try {
        return await call(isLast ? this.patient : this.fast, { ...req, model });
      } catch (error) {
        lastError = error;
        if (isLast || !shouldFallback(error) || req.signal?.aborted) throw error;
        const reason = error instanceof Groq.APIError ? `${error.constructor.name} ${error.status ?? ""}`.trim() : String(error);
        console.warn(`[GroqProvider] ${model} no disponible (${reason}); probando ${chain[i + 1]}`);
      }
    }
    throw lastError;
  }

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    try {
      const res = await this.withFallback(req, (client, r) =>
        client.chat.completions.create({ ...this.params(r), stream: false }, { signal: r.signal }),
      );
      const choice = res.choices[0];
      return {
        content: choice?.message?.content ?? "",
        model: res.model,
        tokens: res.usage?.total_tokens ?? null,
        finishReason: mapFinish(choice?.finish_reason),
      };
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async *stream(req: CompletionRequest): AsyncIterable<StreamChunk> {
    let stream;
    let model = req.model;
    try {
      // El respaldo solo aplica al abrir el stream; si falla a mitad, se informa el error.
      stream = await this.withFallback(req, (client, r) => {
        model = r.model;
        return client.chat.completions.create({ ...this.params(r), stream: true }, { signal: r.signal });
      });
    } catch (error) {
      throw toDomainError(error);
    }

    let tokens: number | null = null;
    let finishReason: FinishReason = "other";
    try {
      for await (const chunk of stream) {
        model = chunk.model ?? model;
        const choice = chunk.choices[0];
        const text = choice?.delta?.content;
        if (text) yield { type: "delta", text };
        if (choice?.finish_reason) finishReason = mapFinish(choice.finish_reason);
        const usage = chunk.x_groq?.usage;
        if (usage?.total_tokens) tokens = usage.total_tokens;
      }
    } catch (error) {
      throw toDomainError(error);
    }
    yield { type: "end", model, tokens, finishReason };
  }
}
