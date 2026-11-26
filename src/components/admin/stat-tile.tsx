"use client";

import { useEffect, useState } from "react";

/** Número que "cuenta" hasta su valor al montar (respeta prefers-reduced-motion). */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - p, 3))); // ease-out cúbico
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function StatTile({
  label,
  value,
  decimals = 0,
  suffix = "",
  hint,
  icon,
  index = 0,
}: {
  label: string;
  /** null = sin datos ("—"). */
  value: number | null;
  decimals?: number;
  suffix?: string;
  hint?: string;
  /** Path SVG (viewBox 24). */
  icon: string;
  index?: number;
}) {
  const shown = useCountUp(value ?? 0);
  return (
    <div
      className="glass glow-border lift group relative animate-fade-up overflow-hidden rounded-2xl p-4"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-6 size-20 rounded-full bg-accent/10 blur-2xl transition duration-500 group-hover:bg-accent/25"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-chalk-muted">{label}</p>
        <svg viewBox="0 0 24 24" className="size-4 text-accent/80" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d={icon} />
        </svg>
      </div>
      <p className="mt-2 font-display text-4xl font-bold tabular-nums tracking-tight">
        {value == null ? "—" : `${shown.toFixed(decimals)}${suffix}`}
      </p>
      {hint && <p className="mt-0.5 text-xs text-chalk-muted">{hint}</p>}
    </div>
  );
}
