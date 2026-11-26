"use client";

import type { AssistantMode } from "@/core/domain/entities";
import { MODES, SUGGESTIONS } from "./types";

export function EmptyState({
  mode,
  onModeChange,
  onPick,
  disabled,
}: {
  mode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
  onPick: (question: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-10 text-center">
      <div className="relative mb-5 animate-pop-in" aria-hidden>
        <div className="absolute inset-0 animate-ping rounded-full bg-accent/20 [animation-duration:2.5s]" />
        <div className="relative grid size-16 place-items-center rounded-full bg-gradient-to-br from-accent to-turf text-3xl shadow-[0_0_40px_-6px_#a3e635]">
          <span className="animate-ball">⚽</span>
        </div>
      </div>
      <h1 className="animate-fade-up font-display text-4xl font-extrabold uppercase italic tracking-tight sm:text-5xl">
        ¿Qué armamos hoy en la <span className="text-gradient">pizarra</span>?
      </h1>
      <p className="mt-2 animate-fade-up text-sm text-chalk-muted" style={{ animationDelay: "80ms" }}>
        Elige un modo y haz tu pregunta.
      </p>

      <div className="mt-7 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4" role="radiogroup" aria-label="Modo del asistente">
        {MODES.map((m, i) => {
          const selected = mode === m.value;
          return (
            <button
              key={m.value}
              role="radio"
              aria-checked={selected}
              data-active={selected}
              onClick={() => onModeChange(m.value)}
              style={{ animationDelay: `${120 + i * 60}ms` }}
              className={`glow-border lift group animate-fade-up rounded-2xl border px-3 py-3.5 text-left ${
                selected ? "border-accent/40 bg-accent/10" : "border-chalk/10 bg-pitch-800/60 hover:bg-pitch-800"
              }`}
            >
              <span
                className={`grid size-9 place-items-center rounded-xl text-lg transition duration-300 group-hover:scale-110 group-hover:-rotate-6 ${
                  selected ? "bg-accent/20" : "bg-pitch-700/70"
                }`}
              >
                {m.icon}
              </span>
              <p className={`mt-2 font-display text-lg font-bold uppercase tracking-wide ${selected ? "text-accent" : ""}`}>
                {m.label}
              </p>
              <p className="text-xs text-chalk-muted">{m.description}</p>
            </button>
          );
        })}
      </div>

      {/* key={mode}: al cambiar de modo las sugerencias vuelven a entrar en cascada */}
      <div key={mode} className="mt-6 flex w-full flex-col gap-2">
        {SUGGESTIONS[mode].map((q, i) => (
          <button
            key={q}
            disabled={disabled}
            onClick={() => onPick(q)}
            style={{ animationDelay: `${i * 70}ms` }}
            className="group flex animate-slide-in items-center gap-3 rounded-xl border border-chalk/10 bg-pitch-950/40 px-4 py-3 text-left text-sm text-chalk-muted backdrop-blur transition hover:border-accent/50 hover:bg-accent/5 hover:text-chalk disabled:opacity-50"
          >
            <span className="flex-1">{q}</span>
            <svg
              viewBox="0 0 24 24"
              className="size-4 shrink-0 -translate-x-1 text-accent opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
