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
}

export interface CompletionResult {
  content: string;
  model: string;
  tokens: number | null;
}

/** Puerto hacia cualquier proveedor de LLM (Mock, Groq, …). */
export interface AIProvider {
  readonly name: string;
  complete(request: CompletionRequest): Promise<CompletionResult>;
}
