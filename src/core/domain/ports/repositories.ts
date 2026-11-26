import type {
  AssistantConfig,
  AssistantMode,
  Conversation,
  Message,
  MessageRole,
  Role,
  User,
} from "../entities";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: { id: string; email: string; name?: string | null; role?: Role }): Promise<User>;
  list(): Promise<User[]>;
  updateRole(id: string, role: Role): Promise<User>;
  countByRole(role: Role): Promise<number>;
}

export interface ConversationRepository {
  create(data: { userId: string; title?: string; mode?: AssistantMode }): Promise<Conversation>;
  findById(id: string): Promise<Conversation | null>;
  listByUser(userId: string): Promise<Conversation[]>;
  update(id: string, data: { title?: string; mode?: AssistantMode }): Promise<Conversation>;
  touch(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface MessageRepository {
  create(data: {
    conversationId: string;
    role: MessageRole;
    content: string;
    model?: string | null;
    tokens?: number | null;
    latencyMs?: number | null;
  }): Promise<Message>;
  listByConversation(conversationId: string): Promise<Message[]>;
  lastN(conversationId: string, n: number): Promise<Message[]>;
}

export interface AssistantConfigRepository {
  get(): Promise<AssistantConfig>;
  update(
    data: Partial<Omit<AssistantConfig, "updatedAt">>,
    updatedBy: string,
  ): Promise<AssistantConfig>;
}

export interface Stats {
  users: number;
  admins: number;
  conversations: number;
  messages: number;
  avgLatencyMs: number | null;
  messagesPerDay: { day: string; count: number }[];
}

export interface StatsRepository {
  overview(days: number): Promise<Stats>;
}
