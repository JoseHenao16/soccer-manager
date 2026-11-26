import type { MessageRole } from "../entities";

export interface ChatMessage {
  role: MessageRole | "system";
  content: string;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  model: string;
  temperature: number;
  maxTokens: number;
  /** Permite cancelar la petición (p. ej. si el cliente se desconecta). */
  signal?: AbortSignal;
}

export type FinishReason = "stop" | "length" | "other";

export interface CompletionResult {
  content: string;
  model: string;
  tokens: number | null;
  finishReason?: FinishReason;
}

/** Eventos de una respuesta en streaming. */
export type StreamChunk =
  | { type: "delta"; text: string }
  | { type: "end"; model: string; tokens: number | null; finishReason: FinishReason };

/** Puerto hacia cualquier proveedor de LLM (Mock, Groq, …). */
export interface AIProvider {
  readonly name: string;
  complete(request: CompletionRequest): Promise<CompletionResult>;
  stream(request: CompletionRequest): AsyncIterable<StreamChunk>;
}
