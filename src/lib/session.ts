import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  assertAdmin,
  assertAuthenticated,
  getCurrentUser,
} from "@/core/application/use-cases/auth";
import type { User } from "@/core/domain/entities";
import { makeAuthGateway, repositories } from "./container";

/** Usuario de la sesión actual (memoizado por request). */
export const getSessionUser = cache(async (): Promise<User | null> => {
  return getCurrentUser({ auth: await makeAuthGateway(), users: repositories.users });
});

/** Para API Routes: lanza UnauthorizedError si no hay sesión. */
export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  assertAuthenticated(user);
  return user;
}

/**
 * Para páginas (Server Components): redirige si no es ADMIN.
 * Cada página de admin debe llamarlo ANTES de renderizar su contenido: con cacheComponents
 * el guard del layout se renderiza en paralelo con la página, así que no basta por sí solo.
 */
export async function requireAdminPage(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/chat");
  return user;
}

/** Para API Routes: lanza ForbiddenError si no es ADMIN. */
export async function requireAdmin(): Promise<User> {
  const user = await getSessionUser();
  assertAdmin(user);
  return user;
}
