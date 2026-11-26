import "server-only";
import type { Stats, StatsRepository } from "@/core/domain/ports/repositories";
import { prisma } from "../prisma";

export class PrismaStatsRepository implements StatsRepository {
  async overview(days: number): Promise<Stats> {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const [users, admins, conversations, messages, latency, perDay] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { role: "ADMIN" } }),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.message.aggregate({ _avg: { latencyMs: true }, where: { role: "assistant" } }),
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC') AS day, COUNT(*) AS count
        FROM "messages"
        WHERE "createdAt" >= ${since} AND "role" = 'user'
        GROUP BY 1 ORDER BY 1`,
    ]);

    // Rellena los días sin actividad con 0 para que el eje sea continuo.
    const counts = new Map(perDay.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]));
    const messagesPerDay = Array.from({ length: days }, (_, i) => {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      const day = d.toISOString().slice(0, 10);
      return { day, count: counts.get(day) ?? 0 };
    });

    return {
      users,
      admins,
      conversations,
      messages,
      avgLatencyMs: latency._avg.latencyMs != null ? Math.round(latency._avg.latencyMs) : null,
      messagesPerDay,
    };
  }
}
