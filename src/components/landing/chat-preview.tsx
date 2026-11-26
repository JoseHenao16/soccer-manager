"use client";

import { useEffect, useState } from "react";

/** Ejemplos decorativos para la landing (no llaman a la IA). */
const DEMO = [
  {
    q: "¿Cómo presiono alto a una salida de tres centrales?",
    a: "Empareja a tus 3 delanteros con sus centrales y salta con el interior al pivote…",
  },
  {
    q: "Dame un rondo 4v2 para sub-15",
    a: "Espacio 12×12 m, 2 toques máximo, series de 90 s con cambio al robar…",
  },
  {
    q: "¿Es fuera de juego desde un saque de banda?",
    a: "No. Según la Regla 11 no hay fuera de juego al recibir de un saque de banda…",
  },
];

type Phase = "typing" | "thinking" | "answer";

export function ChatPreview() {
  const [index, setIndex] = useState(0);
  const [chars, setChars] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const item = DEMO[index];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (reduce || chars >= item.q.length) t = setTimeout(() => setPhase("thinking"), reduce ? 0 : 350);
      else t = setTimeout(() => setChars((c) => c + 1), 32);
    } else if (phase === "thinking") {
      t = setTimeout(() => setPhase("answer"), 1100);
    } else {
      t = setTimeout(() => {
        setIndex((i) => (i + 1) % DEMO.length);
        setChars(0);
        setPhase("typing");
      }, 3800);
    }
    return () => clearTimeout(t);
  }, [phase, chars, item.q.length]);

  return (
    <div className="glass w-full rounded-2xl p-4 shadow-2xl shadow-black/40" aria-hidden>
      <div className="mb-3 flex items-center gap-2 text-[11px] text-chalk-muted">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-accent" />
        </span>
        The Pizarra Futnorte IA
      </div>

      <div className="flex min-h-[132px] flex-col gap-2.5 text-[13px]">
        <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-accent px-3 py-2 text-pitch-950">
          {item.q.slice(0, chars)}
          {phase === "typing" && <span className="ml-px inline-block h-3.5 w-px animate-pulse bg-pitch-950 align-middle" />}
        </div>

        {phase === "thinking" && (
          <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-md bg-pitch-700/80 px-3 py-2.5">
            {[0, 150, 300].map((d) => (
              <span key={d} className="size-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
        {phase === "answer" && (
          <div key={index} className="max-w-[92%] animate-fade-up rounded-2xl rounded-tl-md border border-chalk/10 bg-pitch-700/80 px-3 py-2 text-chalk">
            {item.a}
          </div>
        )}
      </div>
    </div>
  );
}
