"use client";

import { useState } from "react";
import { modeInfo, type ConversationDTO } from "./types";

type ListState = "loading" | "ready" | "error";

export function Sidebar({
  conversations,
  state,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onRetry,
}: {
  conversations: ConversationDTO[];
  state: ListState;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-pitch-950 transition hover:bg-accent-strong"
        >
          <span className="text-lg leading-none">+</span> Nueva conversación
        </button>
      </div>

      <p className="px-4 pb-2 text-xs font-medium uppercase tracking-wider text-chalk-muted/70">Historial</p>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {state === "loading" && (
          <ul className="space-y-2 px-1" aria-label="Cargando historial">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="h-12 animate-pulse rounded-lg bg-pitch-700/50" />
            ))}
          </ul>
        )}

        {state === "error" && (
          <div className="px-2 py-4 text-sm text-chalk-muted">
            No se pudo cargar el historial.{" "}
            <button onClick={onRetry} className="text-accent hover:underline">
              Reintentar
            </button>
          </div>
        )}

        {state === "ready" && conversations.length === 0 && (
          <p className="px-2 py-4 text-sm text-chalk-muted">Aún no tienes conversaciones.</p>
        )}

        {state === "ready" && (
          <ul className="space-y-1">
            {conversations.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                active={c.id === activeId}
                onSelect={() => onSelect(c.id)}
                onRename={(title) => onRename(c.id, title)}
                onDelete={() => onDelete(c.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  conversation: ConversationDTO;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm" | "busy">("view");
  const [title, setTitle] = useState(conversation.title);

  async function saveTitle() {
    const t = title.trim();
    if (!t || t === conversation.title) {
      setTitle(conversation.title);
      setMode("view");
      return;
    }
    setMode("busy");
    try {
      await onRename(t);
    } catch {
      setTitle(conversation.title);
    }
    setMode("view");
  }

  async function confirmDelete() {
    setMode("busy");
    try {
      await onDelete();
    } catch {
      setMode("view");
    }
  }

  if (mode === "edit") {
    return (
      <li className="rounded-lg bg-pitch-700 p-1.5">
        <input
          autoFocus
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveTitle();
            if (e.key === "Escape") {
              setTitle(conversation.title);
              setMode("view");
            }
          }}
          aria-label="Nuevo título"
          className="w-full rounded-md border border-accent/60 bg-pitch-950 px-2 py-1.5 text-sm outline-none"
        />
      </li>
    );
  }

  if (mode === "confirm") {
    return (
      <li className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm">
        <p className="truncate">¿Eliminar “{conversation.title}”?</p>
        <div className="mt-2 flex gap-2">
          <button onClick={confirmDelete} className="rounded-md bg-danger px-3 py-1 text-xs font-semibold text-pitch-950">
            Eliminar
          </button>
          <button onClick={() => setMode("view")} className="rounded-md border border-chalk/20 px-3 py-1 text-xs">
            Cancelar
          </button>
        </div>
      </li>
    );
  }

  const info = modeInfo(conversation.mode);

  return (
    <li
      className={`group flex items-center gap-1 rounded-lg transition ${
        active ? "bg-pitch-700" : "hover:bg-pitch-700/50"
      } ${mode === "busy" ? "pointer-events-none opacity-50" : ""}`}
    >
      <button onClick={onSelect} className="min-w-0 flex-1 px-3 py-2 text-left" aria-current={active ? "page" : undefined}>
        <p className="truncate text-sm">{conversation.title}</p>
        <p className="text-[11px] text-chalk-muted/70">
          {info.icon} {info.label} · {formatDate(conversation.updatedAt)}
        </p>
      </button>
      <div className="flex shrink-0 pr-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <IconButton label="Renombrar" onClick={() => setMode("edit")} d="M4 20h4L19 9l-4-4L4 16v4z" />
        <IconButton label="Eliminar" onClick={() => setMode("confirm")} d="M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      </div>
    </li>
  );
}

function IconButton({ label, onClick, d }: { label: string; onClick: () => void; d: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-7 place-items-center rounded-md text-chalk-muted hover:bg-pitch-600 hover:text-chalk"
    >
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={d} />
      </svg>
    </button>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diffDays < 1) return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7) return d.toLocaleDateString("es-CO", { weekday: "short" });
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}
