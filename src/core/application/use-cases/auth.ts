import type { User } from "@/core/domain/entities";
import { ForbiddenError, UnauthorizedError } from "@/core/domain/errors";
import type { AuthGateway, AuthIdentity } from "@/core/domain/ports/auth-gateway";
import type { UserRepository } from "@/core/domain/ports/repositories";

interface Deps {
  auth: AuthGateway;
  users: UserRepository;
}

/** Garantiza que exista el Profile de la app para una identidad de Supabase. */
async function ensureProfile(users: UserRepository, identity: AuthIdentity): Promise<User> {
  const existing = await users.findById(identity.id);
  if (existing) return existing;
  return users.create({ id: identity.id, email: identity.email, name: identity.name, role: "USER" });
}

export async function registerUser(
  { auth, users }: Deps,
  input: { email: string; password: string; name: string },
): Promise<User> {
  const identity = await auth.signUp(input);
  return ensureProfile(users, { ...identity, name: input.name });
}

export async function loginUser(
  { auth, users }: Deps,
  input: { email: string; password: string },
): Promise<User> {
  const identity = await auth.signIn(input);
  return ensureProfile(users, identity);
}

export async function logoutUser({ auth }: Pick<Deps, "auth">): Promise<void> {
  await auth.signOut();
}

export async function getCurrentUser({ auth, users }: Deps): Promise<User | null> {
  const identity = await auth.current();
  if (!identity) return null;
  return ensureProfile(users, identity);
}

// ── Reglas de autorización reutilizables ─────────────────────────
export function assertAuthenticated(user: User | null): asserts user is User {
  if (!user) throw new UnauthorizedError();
}

export function assertAdmin(user: User | null): asserts user is User {
  assertAuthenticated(user);
  if (user.role !== "ADMIN") throw new ForbiddenError("Solo un administrador puede hacer esto");
}
