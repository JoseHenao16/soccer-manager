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
      <h1 className="text-2xl font-bold sm:text-3xl">
        ¿Qué armamos hoy en la <span className="text-accent">pizarra</span>?
      </h1>
      <p className="mt-2 text-sm text-chalk-muted">Elige un modo y haz tu pregunta.</p>

      <div className="mt-6 grid w-full grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Modo del asistente">
        {MODES.map((m) => (
          <button
            key={m.value}
            role="radio"
            aria-checked={mode === m.value}
            onClick={() => onModeChange(m.value)}
            className={`rounded-xl border px-3 py-3 text-left transition ${
              mode === m.value
                ? "border-accent bg-accent/10"
                : "border-chalk/10 bg-pitch-800/60 hover:border-chalk/30"
            }`}
          >
            <span className="text-lg">{m.icon}</span>
            <p className="mt-1 text-sm font-semibold">{m.label}</p>
            <p className="text-xs text-chalk-muted">{m.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex w-full flex-col gap-2">
        {SUGGESTIONS[mode].map((q) => (
          <button
            key={q}
            disabled={disabled}
            onClick={() => onPick(q)}
            className="rounded-xl border border-chalk/10 bg-pitch-950/40 px-4 py-3 text-left text-sm text-chalk-muted transition hover:border-accent/50 hover:text-chalk disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
