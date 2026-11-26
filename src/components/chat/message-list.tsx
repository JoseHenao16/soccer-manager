"use client";

import { useEffect, useRef } from "react";
import { Markdown } from "./markdown";
import type { MessageDTO } from "./types";

export function MessageList({
  messages,
  thinking,
}: {
  messages: MessageDTO[];
  thinking: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, thinking]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      {messages.map((m) => (m.role === "user" ? <UserBubble key={m.id} message={m} /> : <AssistantBubble key={m.id} message={m} />))}
      {thinking && <ThinkingBubble />}
      <div ref={endRef} />
    </div>
  );
}

function UserBubble({ message }: { message: MessageDTO }) {
  return (
    <div className="flex flex-col items-end">
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md px-4 py-2.5 text-sm sm:max-w-[75%] ${
          message.failed ? "border border-danger/50 bg-danger/10 text-chalk" : "bg-accent text-pitch-950"
        }`}
      >
        {message.content}
      </div>
      {message.failed && <span className="mt-1 text-xs text-danger">No enviado</span>}
    </div>
  );
}

function AssistantBubble({ message }: { message: MessageDTO }) {
  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-chalk/10 bg-pitch-800 px-4 py-2.5">
        <Markdown>{message.content}</Markdown>
        {message.latencyMs != null && (
          <p className="mt-1 text-[11px] text-chalk-muted/60">{(message.latencyMs / 1000).toFixed(1)} s</p>
        )}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3" role="status" aria-label="El asistente está escribiendo">
      <Avatar />
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-chalk/10 bg-pitch-800 px-4 py-3 text-sm text-chalk-muted">
        <span className="flex gap-1">
          {[0, 150, 300].map((d) => (
            <span key={d} className="size-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${d}ms` }} />
          ))}
        </span>
        Armando la jugada…
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div aria-hidden className="grid size-8 shrink-0 place-items-center rounded-lg border border-chalk/20 bg-pitch-700 text-accent">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <path d="M12 5v14" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    </div>
  );
}
