import "server-only";
import type { Message, MessageRole } from "@/core/domain/entities";
import type { MessageRepository } from "@/core/domain/ports/repositories";
import { prisma } from "../prisma";

export class PrismaMessageRepository implements MessageRepository {
  create(data: {
    conversationId: string;
    role: MessageRole;
    content: string;
    model?: string | null;
    tokens?: number | null;
    latencyMs?: number | null;
  }): Promise<Message> {
    return prisma.message.create({ data });
  }

  listByConversation(conversationId: string): Promise<Message[]> {
    return prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" } });
  }

  async lastN(conversationId: string, n: number): Promise<Message[]> {
    const rows = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: n,
    });
    return rows.reverse(); // orden cronológico para el modelo
  }
}
