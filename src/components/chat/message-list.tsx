"use client";

import { useEffect, useRef, useState } from "react";
import { Markdown } from "./markdown";
import type { MessageDTO } from "./types";

export function MessageList({
  messages,
  thinking,
  streamingText = null,
}: {
  messages: MessageDTO[];
  thinking: boolean;
  /** Respuesta parcial que va llegando por streaming. */
  streamingText?: string | null;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: streamingText ? "auto" : "smooth", block: "end" });
  }, [messages.length, thinking, streamingText]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      {messages.map((m) => (m.role === "user" ? <UserBubble key={m.id} message={m} /> : <AssistantBubble key={m.id} message={m} />))}
      {thinking && streamingText === null && <ThinkingBubble />}
      {thinking && streamingText !== null && (
        <AssistantBubble message={{ id: "streaming", role: "assistant", content: streamingText, createdAt: "" }} streaming />
      )}
      <div ref={endRef} />
    </div>
  );
}

function UserBubble({ message }: { message: MessageDTO }) {
  return (
    <div className="flex animate-fade-up flex-col items-end [animation-duration:0.35s]">
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md px-4 py-2.5 text-sm sm:max-w-[75%] ${
          message.failed
            ? "border border-danger/50 bg-danger/10 text-chalk"
            : "bg-gradient-to-br from-accent to-accent-strong text-pitch-950 shadow-[0_8px_24px_-12px_#a3e635]"
        }`}
      >
        {message.content}
      </div>
      {message.failed && <span className="mt-1 text-xs text-danger">No enviado</span>}
    </div>
  );
}

function AssistantBubble({ message, streaming = false }: { message: MessageDTO; streaming?: boolean }) {
  return (
    <div className="flex gap-3">
      <Avatar active={streaming} />
      <div
        className={`glass min-w-0 flex-1 rounded-2xl rounded-tl-md px-4 py-3 transition-shadow ${
          streaming ? "shadow-[0_0_0_1px_rgb(163_230_53/0.25),0_10px_30px_-15px_#a3e635]" : ""
        }`}
      >
        <Markdown>{message.content}</Markdown>
        {streaming && <span aria-hidden className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-accent align-middle" />}
        {message.latencyMs != null && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-chalk-muted/60">
            <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2M10 2h4" />
            </svg>
            {(message.latencyMs / 1000).toFixed(1)} s
          </p>
        )}
      </div>
    </div>
  );
}

const THINKING = ["Armando la jugada…", "Revisando la pizarra…", "Consultando al cuerpo técnico…", "Ajustando la táctica…"];

function ThinkingBubble() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % THINKING.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex animate-fade-up gap-3" role="status" aria-label="El asistente está escribiendo">
      <Avatar active />
      <div className="glass flex items-center gap-3 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-chalk-muted">
        <span className="relative flex h-5 w-5 items-end justify-center" aria-hidden>
          <span className="animate-ball text-base leading-none">⚽</span>
        </span>
        <span key={i} className="animate-fade-in">
          {THINKING[i]}
        </span>
      </div>
    </div>
  );
}

function Avatar({ active = false }: { active?: boolean }) {
  return (
    <div
      aria-hidden
      className={`relative grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-turf text-pitch-950 ${
        active ? "shadow-[0_0_18px_-2px_#a3e635]" : ""
      }`}
    >
      {active && <span className="absolute inset-0 animate-ping rounded-xl bg-accent/30" />}
      <svg viewBox="0 0 24 24" className="relative size-4" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <path d="M12 5v14" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    </div>
  );
}
