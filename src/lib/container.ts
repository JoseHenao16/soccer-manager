import "server-only";
import { createAIProvider } from "@/infrastructure/ai";
import { SupabaseAuthGateway } from "@/infrastructure/auth/supabase-auth-gateway";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";
import { PrismaAssistantConfigRepository } from "@/infrastructure/db/repositories/prisma-assistant-config-repository";
import { PrismaConversationRepository } from "@/infrastructure/db/repositories/prisma-conversation-repository";
import { PrismaMessageRepository } from "@/infrastructure/db/repositories/prisma-message-repository";
import { PrismaUserRepository } from "@/infrastructure/db/repositories/prisma-user-repository";

/**
 * Composition root: el único lugar que conoce las implementaciones concretas.
 * Los casos de uso reciben estas dependencias por parámetro.
 */
export const repositories = {
  users: new PrismaUserRepository(),
  conversations: new PrismaConversationRepository(),
  messages: new PrismaMessageRepository(),
  config: new PrismaAssistantConfigRepository(),
};

let aiProvider: ReturnType<typeof createAIProvider> | undefined;
export function getAIProvider() {
  return (aiProvider ??= createAIProvider());
}

/** El gateway de auth depende de las cookies de la request, por eso se crea por request. */
export async function makeAuthGateway() {
  return new SupabaseAuthGateway(await createSupabaseServerClient());
}
