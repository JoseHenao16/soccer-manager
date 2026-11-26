"use client";

import { useEffect, useRef, useState } from "react";

const MAX = 4000;

export function Composer({
  onSend,
  disabled,
  initialValue = "",
}: {
  onSend: (content: string) => void;
  disabled: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Autoajuste de altura del textarea.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  function submit() {
    const content = value.trim();
    if (!content || disabled || content.length > MAX) return;
    onSend(content);
    setValue("");
  }

  const tooLong = value.length > MAX;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="mx-auto w-full max-w-3xl px-4 pb-4"
    >
      <div className="glass glow-border flex items-end gap-2 rounded-2xl p-2 shadow-xl shadow-black/30 transition focus-within:shadow-[0_10px_40px_-15px_#a3e635]">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Pregunta sobre táctica, entrenamiento o reglamento…"
          aria-label="Escribe tu pregunta"
          className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-chalk outline-none placeholder:text-chalk-muted/60"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim() || tooLong}
          aria-label="Enviar"
          className="group grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-turf text-pitch-950 shadow-[0_6px_20px_-8px_#a3e635] transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
        >
          <svg viewBox="0 0 24 24" className="size-5 transition group-enabled:group-hover:-rotate-45" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <div className="mt-1.5 flex justify-between px-1 text-[11px] text-chalk-muted/60">
        <span>Enter para enviar · Shift+Enter para salto de línea</span>
        {value.length > MAX * 0.8 && (
          <span className={tooLong ? "text-danger" : ""}>
            {value.length}/{MAX}
          </span>
        )}
      </div>
    </form>
  );
}
