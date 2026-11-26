import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5 font-semibold tracking-tight">
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-turf text-pitch-950 shadow-[0_0_20px_-4px_#a3e635] transition duration-500 group-hover:rotate-[360deg]"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M12 5v14" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      </span>
      <span className="whitespace-nowrap font-display text-base font-bold uppercase italic leading-none tracking-wide sm:text-lg">
        The Pizarra <span className="text-accent">Futnorte</span> IA
      </span>
    </Link>
  );
}
