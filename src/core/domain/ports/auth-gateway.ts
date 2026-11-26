export interface AuthIdentity {
  id: string;
  email: string;
  name?: string | null;
}

/** Puerto hacia el proveedor de identidad (Supabase Auth). */
export interface AuthGateway {
  signUp(input: { email: string; password: string; name: string }): Promise<AuthIdentity>;
  signIn(input: { email: string; password: string }): Promise<AuthIdentity>;
  signOut(): Promise<void>;
  /** Identidad de la sesión actual verificada (JWT validado) o null. */
  current(): Promise<AuthIdentity | null>;
}
