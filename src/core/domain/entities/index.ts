// Entidades del dominio: tipos puros, sin dependencias de frameworks.

export type Role = "ADMIN" | "USER";
export type MessageRole = "user" | "assistant";
export type AssistantMode = "GENERAL" | "ENTRENADOR" | "ARBITRO" | "ANALISTA";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  mode: AssistantMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  model: string | null;
  tokens: number | null;
  latencyMs: number | null;
  createdAt: Date;
}

export interface AssistantConfig {
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  historyLimit: number;
  updatedAt: Date;
}
