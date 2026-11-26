import Link from "next/link";
import { LogoutButton } from "@/components/ui/logout-button";
import { getSessionUser } from "@/lib/session";

/** Navegación de la zona privada (lee la sesión: usar dentro de <Suspense>). */
export async function UserNav() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <nav className="flex items-center gap-2 text-sm sm:gap-4">
      <Link href="/chat" className="text-chalk-muted hover:text-chalk">
        Chat
      </Link>
      {user.role === "ADMIN" && (
        <Link href="/admin" className="text-chalk-muted hover:text-chalk">
          Admin
        </Link>
      )}
      <span className="hidden max-w-48 truncate text-chalk-muted md:inline" title={user.email}>
        {user.name ?? user.email}
        {user.role === "ADMIN" && (
          <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 text-xs text-accent">ADMIN</span>
        )}
      </span>
      <LogoutButton />
    </nav>
  );
}

/** Acciones del header público según haya sesión o no. */
export async function PublicNav() {
  const user = await getSessionUser();
  return user ? (
    <Link href="/chat" className="rounded-lg bg-accent px-4 py-2 font-semibold text-pitch-950 hover:bg-accent-strong">
      Abrir chat
    </Link>
  ) : (
    <GuestNav />
  );
}

export function GuestNav() {
  return (
    <>
      <Link href="/login" className="text-chalk-muted hover:text-chalk">
        Iniciar sesión
      </Link>
      <Link href="/register" className="rounded-lg bg-accent px-4 py-2 font-semibold text-pitch-950 hover:bg-accent-strong">
        Registrarse
      </Link>
    </>
  );
}
