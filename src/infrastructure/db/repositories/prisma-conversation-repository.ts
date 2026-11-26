import "server-only";
import type { AssistantMode, Conversation } from "@/core/domain/entities";
import type { ConversationRepository } from "@/core/domain/ports/repositories";
import { prisma } from "../prisma";

export class PrismaConversationRepository implements ConversationRepository {
  create(data: { userId: string; title?: string; mode?: AssistantMode }): Promise<Conversation> {
    return prisma.conversation.create({ data });
  }

  findById(id: string): Promise<Conversation | null> {
    return prisma.conversation.findUnique({ where: { id } });
  }

  listByUser(userId: string): Promise<Conversation[]> {
    return prisma.conversation.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  }

  update(id: string, data: { title?: string; mode?: AssistantMode }): Promise<Conversation> {
    return prisma.conversation.update({ where: { id }, data });
  }

  async touch(id: string): Promise<void> {
    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
  }

  async delete(id: string): Promise<void> {
    // Los mensajes se eliminan en cascada (onDelete: Cascade).
    await prisma.conversation.delete({ where: { id } });
  }
}
