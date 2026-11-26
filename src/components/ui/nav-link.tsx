"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Enlace de navegación con estado activo (resaltado tipo "píldora"). */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-1.5 transition ${
        active ? "bg-accent/15 text-accent" : "text-chalk-muted hover:bg-pitch-700/60 hover:text-chalk"
      }`}
    >
      {children}
    </Link>
  );
}
