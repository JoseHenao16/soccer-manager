import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DomainError, UnauthorizedError, ValidationError } from "@/core/domain/errors";
import type { AuthGateway, AuthIdentity } from "@/core/domain/ports/auth-gateway";

/** Traduce los errores de Supabase Auth a errores de dominio en español. */
function mapAuthError(error: { message: string; code?: string; status?: number }): DomainError {
  const code = error.code ?? "";
  if (code === "invalid_credentials") return new UnauthorizedError("Correo o contraseña incorrectos");
  if (code === "user_already_exists" || code === "email_exists")
    return new ValidationError("Ya existe una cuenta con ese correo");
  if (code === "weak_password") return new ValidationError("La contraseña es muy débil");
  if (code === "email_not_confirmed")
    return new UnauthorizedError("Debes confirmar tu correo antes de iniciar sesión");
  if (code === "over_request_rate_limit" || error.status === 429)
    return new DomainError("Demasiados intentos, espera un momento", "RATE_LIMIT");
  return new DomainError(error.message || "Error de autenticación", "AUTH");
}

export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly supabase: SupabaseClient) {}

  async signUp({ email, password, name }: { email: string; password: string; name: string }) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw mapAuthError(error);
    // Con "Confirm email" activo y correo repetido, Supabase devuelve un usuario sin identidades.
    if (!data.user || data.user.identities?.length === 0)
      throw new ValidationError("Ya existe una cuenta con ese correo");
    if (!data.session)
      throw new ValidationError(
        "Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión",
      );
    return { id: data.user.id, email: data.user.email ?? email, name };
  }

  async signIn({ email, password }: { email: string; password: string }) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw mapAuthError(error);
    return {
      id: data.user.id,
      email: data.user.email ?? email,
      name: (data.user.user_metadata?.name as string | undefined) ?? null,
    };
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  async current(): Promise<AuthIdentity | null> {
    // getClaims valida la firma del JWT (no confía ciegamente en la cookie).
    const { data, error } = await this.supabase.auth.getClaims();
    if (error || !data?.claims?.sub) return null;
    const claims = data.claims;
    return {
      id: claims.sub,
      email: (claims.email as string | undefined) ?? "",
      name: (claims.user_metadata?.name as string | undefined) ?? null,
    };
  }
}
