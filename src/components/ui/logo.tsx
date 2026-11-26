import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg border border-chalk/30 bg-pitch-700 text-accent"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M12 5v14" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      </span>
      <span>
        The Pizarra <span className="text-accent">Futnorte</span> IA
      </span>
    </Link>
  );
}
