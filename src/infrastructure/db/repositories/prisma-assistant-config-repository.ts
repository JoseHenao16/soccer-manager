import "server-only";
import { DEFAULT_SYSTEM_PROMPT } from "@/core/domain/assistant";
import type { AssistantConfig } from "@/core/domain/entities";
import type { AssistantConfigRepository } from "@/core/domain/ports/repositories";
import { prisma } from "../prisma";

const select = {
  systemPrompt: true,
  model: true,
  temperature: true,
  maxTokens: true,
  historyLimit: true,
  updatedAt: true,
} as const;

/** Configuración singleton (id = 1). Se crea con valores por defecto si no existe. */
export class PrismaAssistantConfigRepository implements AssistantConfigRepository {
  get(): Promise<AssistantConfig> {
    return prisma.assistantConfig.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, systemPrompt: DEFAULT_SYSTEM_PROMPT },
      select,
    });
  }

  update(data: Partial<Omit<AssistantConfig, "updatedAt">>, updatedBy: string): Promise<AssistantConfig> {
    return prisma.assistantConfig.upsert({
      where: { id: 1 },
      update: { ...data, updatedBy },
      create: { id: 1, systemPrompt: DEFAULT_SYSTEM_PROMPT, ...data, updatedBy },
      select,
    });
  }
}
