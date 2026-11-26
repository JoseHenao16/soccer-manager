"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Estadísticas" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/assistant", label: "Asistente" },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-chalk/10" aria-label="Secciones de administración">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition ${
              active ? "border-accent text-chalk" : "border-transparent text-chalk-muted hover:text-chalk"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
