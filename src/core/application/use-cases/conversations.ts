import type { AssistantMode, Conversation, Message, User } from "@/core/domain/entities";
import { NotFoundError } from "@/core/domain/errors";
import type { ConversationRepository, MessageRepository } from "@/core/domain/ports/repositories";

export interface ConversationDeps {
  conversations: ConversationRepository;
  messages: MessageRepository;
}

/**
 * Regla de autorización: un usuario solo accede a SUS conversaciones.
 * Si no es el dueño respondemos 404 (no 403) para no revelar que el id existe.
 */
export async function getOwnedConversation(
  conversations: ConversationRepository,
  user: User,
  id: string,
): Promise<Conversation> {
  const conversation = await conversations.findById(id);
  if (!conversation || conversation.userId !== user.id) {
    throw new NotFoundError("Conversación no encontrada");
  }
  return conversation;
}

export function createConversation(
  { conversations }: Pick<ConversationDeps, "conversations">,
  user: User,
  input: { title?: string; mode?: AssistantMode },
): Promise<Conversation> {
  return conversations.create({ userId: user.id, ...input });
}

export function listConversations(
  { conversations }: Pick<ConversationDeps, "conversations">,
  user: User,
): Promise<Conversation[]> {
  return conversations.listByUser(user.id);
}

export async function getConversationWithMessages(
  { conversations, messages }: ConversationDeps,
  user: User,
  id: string,
): Promise<{ conversation: Conversation; messages: Message[] }> {
  const conversation = await getOwnedConversation(conversations, user, id);
  return { conversation, messages: await messages.listByConversation(id) };
}

export async function updateConversation(
  { conversations }: Pick<ConversationDeps, "conversations">,
  user: User,
  id: string,
  input: { title?: string; mode?: AssistantMode },
): Promise<Conversation> {
  await getOwnedConversation(conversations, user, id);
  return conversations.update(id, input);
}

export async function deleteConversation(
  { conversations }: Pick<ConversationDeps, "conversations">,
  user: User,
  id: string,
): Promise<void> {
  await getOwnedConversation(conversations, user, id);
  await conversations.delete(id);
}
