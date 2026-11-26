"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Estadísticas", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { href: "/admin/users", label: "Usuarios", icon: "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { href: "/admin/assistant", label: "Asistente", icon: "M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav
      className="glass inline-flex max-w-full gap-1 overflow-x-auto rounded-xl p-1"
      aria-label="Secciones de administración"
    >
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm transition duration-300 ${
              active
                ? "bg-gradient-to-r from-accent to-turf font-semibold text-pitch-950 shadow-[0_6px_20px_-8px_#a3e635]"
                : "text-chalk-muted hover:bg-pitch-700/60 hover:text-chalk"
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d={t.icon} />
            </svg>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
