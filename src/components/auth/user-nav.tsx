import Link from "next/link";
import { LogoutButton } from "@/components/ui/logout-button";
import { NavLink } from "@/components/ui/nav-link";
import { getSessionUser } from "@/lib/session";

/** Navegación de la zona privada (lee la sesión: usar dentro de <Suspense>). */
export async function UserNav() {
  const user = await getSessionUser();
  if (!user) return null;
  const display = user.name ?? user.email;

  return (
    <nav className="flex animate-fade-in items-center gap-1 text-sm sm:gap-2">
      <NavLink href="/chat">Chat</NavLink>
      {user.role === "ADMIN" && <NavLink href="/admin">Admin</NavLink>}
      <span className="mx-1 hidden h-6 w-px bg-chalk/10 md:block" aria-hidden />
      <span className="hidden items-center gap-2 md:flex" title={user.email}>
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-accent to-turf text-xs font-bold uppercase text-pitch-950"
        >
          {display.charAt(0)}
        </span>
        <span className="max-w-40 truncate text-chalk-muted">{display}</span>
        {user.role === "ADMIN" && (
          <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-accent">ADMIN</span>
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
    <Link href="/chat" className="btn-shine rounded-xl bg-accent px-4 py-2 font-semibold text-pitch-950 transition hover:bg-accent-strong">
      Abrir chat
    </Link>
  ) : (
    <GuestNav />
  );
}

export function GuestNav() {
  return (
    <>
      <Link href="/login" className="hidden rounded-lg px-3 py-2 text-chalk-muted transition hover:text-chalk sm:inline-block">
        Iniciar sesión
      </Link>
      <Link href="/register" className="btn-shine rounded-xl bg-accent px-4 py-2 font-semibold text-pitch-950 transition hover:bg-accent-strong">
        Registrarse
      </Link>
    </>
  );
}
