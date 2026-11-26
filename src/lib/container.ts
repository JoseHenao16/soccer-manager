import "server-only";
import { SupabaseAuthGateway } from "@/infrastructure/auth/supabase-auth-gateway";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";
import { PrismaUserRepository } from "@/infrastructure/db/repositories/prisma-user-repository";

/**
 * Composition root: el único lugar que conoce las implementaciones concretas.
 * Los casos de uso reciben estas dependencias por parámetro.
 */
export const repositories = {
  users: new PrismaUserRepository(),
};

/** El gateway de auth depende de las cookies de la request, por eso se crea por request. */
export async function makeAuthGateway() {
  return new SupabaseAuthGateway(await createSupabaseServerClient());
}
