"use client";

import { useState } from "react";

/**
 * Barras de una sola serie (preguntas por día). Sin leyenda: el título nombra la serie.
 * Color de barra #65a30d validado (banda de luminosidad y contraste ≥3:1 sobre #12291f);
 * el hover resalta con el acento. Incluye tooltip por barra y vista de tabla.
 */
export function ActivityChart({ data }: { data: { day: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const niceMax = max <= 5 ? 5 : Math.ceil(max / 5) * 5;
  const total = data.reduce((s, d) => s + d.count, 0);

  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-CO", { timeZone: "UTC", ...opts });

  return (
    <figure className="rounded-xl border border-chalk/10 bg-pitch-800 p-5">
      <figcaption className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold">Preguntas por día</span>
        <span className="text-xs text-chalk-muted">
          Últimos {data.length} días · {total} en total
        </span>
      </figcaption>

      <div className="relative flex h-48 gap-2">
        {/* Eje Y recesivo */}
        <div className="flex w-6 flex-col justify-between text-right text-[10px] text-chalk-muted/70" aria-hidden>
          <span>{niceMax}</span>
          <span>{niceMax / 2}</span>
          <span>0</span>
        </div>

        <div className="relative flex-1">
          {/* Grid recesivo */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="border-t border-chalk/[0.07]" />
            ))}
          </div>

          <div className="relative flex h-full items-end gap-[2px]" role="list" aria-label="Preguntas por día">
            {data.map((d, i) => {
              const pct = (d.count / niceMax) * 100;
              return (
                <div
                  key={d.day}
                  role="listitem"
                  aria-label={`${fmt(d.day, { day: "numeric", month: "short" })}: ${d.count} preguntas`}
                  className="group relative flex h-full flex-1 cursor-default items-end"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div
                    className="w-full rounded-t-[4px] transition-colors"
                    style={{
                      height: d.count ? `${Math.max(pct, 2)}%` : "2px",
                      background: d.count ? (hover === i ? "#a3e635" : "#65a30d") : "rgb(238 243 238 / 0.12)",
                    }}
                  />
                  {hover === i && (
                    <div
                      className={`pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg border border-chalk/15 bg-pitch-950 px-3 py-2 text-xs shadow-xl ${
                        i > data.length / 2 ? "right-0" : "left-0"
                      }`}
                    >
                      <p className="text-chalk-muted">{fmt(d.day, { weekday: "long", day: "numeric", month: "long" })}</p>
                      <p className="mt-0.5 font-semibold text-chalk">
                        {d.count} {d.count === 1 ? "pregunta" : "preguntas"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Eje X: solo algunas etiquetas para no saturar */}
      <div className="ml-8 mt-2 flex gap-[2px] text-[10px] text-chalk-muted/70" aria-hidden>
        {data.map((d, i) => (
          <span key={d.day} className="flex-1 text-center">
            {i % Math.ceil(data.length / 7) === 0 || i === data.length - 1 ? fmt(d.day, { day: "numeric", month: "short" }) : ""}
          </span>
        ))}
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-xs text-chalk-muted hover:text-chalk">Ver como tabla</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="text-chalk-muted">
            <tr>
              <th className="py-1 font-medium">Día</th>
              <th className="py-1 text-right font-medium">Preguntas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.day} className="border-t border-chalk/10">
                <td className="py-1">{fmt(d.day, { weekday: "short", day: "numeric", month: "short" })}</td>
                <td className="py-1 text-right tabular-nums">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
