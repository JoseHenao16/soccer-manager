"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AssistantMode } from "@/core/domain/entities";
import { api, ApiError, postStream } from "@/lib/api-client";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { MessageList } from "./message-list";
import { Sidebar } from "./sidebar";
import { MODES, type ConversationDTO, type MessageDTO, type StreamEvent } from "./types";

type ListState = "loading" | "ready" | "error";
type MessagesState = "idle" | "loading" | "error" | "not-found";

const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : "Ocurrió un error inesperado");

function idFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/chat\/([^/]+)/);
  return match ? match[1] : null;
}

export function ChatApp() {
  const params = useParams<{ id?: string[] }>();
  const initialId = params.id?.[0] ?? null;

  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [listState, setListState] = useState<ListState>("loading");
  const [activeId, setActiveIdState] = useState<string | null>(initialId);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [messagesState, setMessagesState] = useState<MessagesState>(initialId ? "loading" : "idle");
  const [sending, setSending] = useState(false);
  /** Texto de la respuesta mientras llega por streaming (null = aún no empieza). */
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; retry?: () => void } | null>(null);
  const [draftMode, setDraftMode] = useState<AssistantMode>("GENERAL");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ref sincronizada con activeId para descartar respuestas que llegan tarde.
  const activeIdRef = useRef<string | null>(initialId);
  const loadToken = useRef(0);

  const setActive = useCallback((id: string | null, pushUrl = true) => {
    activeIdRef.current = id;
    setActiveIdState(id);
    if (pushUrl) window.history.pushState(null, "", id ? `/chat/${id}` : "/chat");
  }, []);

  // ── Carga de datos ────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const { conversations } = await api.get<{ conversations: ConversationDTO[] }>("/api/conversations");
      setConversations(conversations);
      setListState("ready");
    } catch {
      setListState("error");
    }
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    const token = ++loadToken.current;
    try {
      const data = await api.get<{ messages: MessageDTO[] }>(`/api/conversations/${id}`);
      if (token !== loadToken.current) return;
      setMessages(data.messages);
      setMessagesState("idle");
    } catch (e) {
      if (token !== loadToken.current) return;
      setMessagesState(e instanceof ApiError && e.status === 404 ? "not-found" : "error");
    }
  }, []);

  useEffect(() => {
    // Carga inicial (los estados ya arrancan en "loading").
    let ignore = false;
    api
      .get<{ conversations: ConversationDTO[] }>("/api/conversations")
      .then(({ conversations }) => {
        if (ignore) return;
        setConversations(conversations);
        setListState("ready");
      })
      .catch(() => !ignore && setListState("error"));

    if (initialId) {
      const token = ++loadToken.current;
      api
        .get<{ messages: MessageDTO[] }>(`/api/conversations/${initialId}`)
        .then((data) => {
          if (ignore || token !== loadToken.current) return;
          setMessages(data.messages);
          setMessagesState("idle");
        })
        .catch((e) => {
          if (ignore || token !== loadToken.current) return;
          setMessagesState(e instanceof ApiError && e.status === 404 ? "not-found" : "error");
        });
    }
    return () => {
      ignore = true;
    };
  }, [initialId]);

  // ── Navegación entre conversaciones ───────────────────────────
  const openConversation = useCallback(
    (id: string, pushUrl = true) => {
      setSidebarOpen(false);
      setError(null);
      if (id === activeIdRef.current && pushUrl) return;
      setActive(id, pushUrl);
      setMessages([]);
      setMessagesState("loading");
      void fetchMessages(id);
    },
    [fetchMessages, setActive],
  );

  const newConversation = useCallback(
    (pushUrl = true) => {
      loadToken.current++;
      setSidebarOpen(false);
      setError(null);
      setActive(null, pushUrl);
      setMessages([]);
      setMessagesState("idle");
    },
    [setActive],
  );

  useEffect(() => {
    // Botones atrás/adelante del navegador.
    const onPop = () => {
      const id = idFromPath(window.location.pathname);
      if (id) openConversation(id, false);
      else newConversation(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [openConversation, newConversation]);

  // ── Acciones ──────────────────────────────────────────────────
  async function send(content: string) {
    if (sending) return;
    setError(null);
    const tempId = `tmp-${Date.now()}`;
    setMessages((m) => [
      ...m.filter((x) => !x.failed),
      { id: tempId, role: "user", content, createdAt: new Date().toISOString() },
    ]);
    setSending(true);
    setStreamingText(null);

    let convId = activeIdRef.current;
    try {
      if (!convId) {
        const { conversation } = await api.post<{ conversation: ConversationDTO }>("/api/conversations", {
          mode: draftMode,
        });
        convId = conversation.id;
        setConversations((c) => [conversation, ...c]);
        setActive(convId);
      }
      const targetId = convId;
      let finished = false;

      // Respuesta en streaming: el texto aparece a medida que el modelo lo genera.
      await postStream<StreamEvent>(`/api/conversations/${targetId}/messages`, { content, stream: true }, (event) => {
        const visible = activeIdRef.current === targetId;
        if (event.type === "delta") {
          if (visible) setStreamingText((t) => (t ?? "") + event.text);
        } else if (event.type === "done") {
          finished = true;
          if (visible) {
            setMessages((m) => [...m.filter((x) => x.id !== tempId), event.userMessage, event.assistantMessage]);
          }
          setConversations((c) => [event.conversation, ...c.filter((x) => x.id !== targetId)]);
        } else if (event.type === "error") {
          throw new ApiError(event.message, 0, event.code, event.retryable);
        }
      });
      if (!finished) throw new ApiError("La respuesta se interrumpió. Inténtalo de nuevo.", 0, "INTERRUPTED");
    } catch (e) {
      setMessages((m) => m.map((x) => (x.id === tempId ? { ...x, failed: true } : x)));
      const retryable = !(e instanceof ApiError) || e.retryable;
      setError({ message: errorMessage(e), retry: retryable ? () => void send(content) : undefined });
    } finally {
      setSending(false);
      setStreamingText(null);
    }
  }

  async function renameConversation(id: string, title: string) {
    try {
      const { conversation } = await api.patch<{ conversation: ConversationDTO }>(`/api/conversations/${id}`, { title });
      setConversations((c) => c.map((x) => (x.id === id ? conversation : x)));
    } catch (e) {
      setError({ message: errorMessage(e) });
      throw e;
    }
  }

  async function deleteConversation(id: string) {
    try {
      await api.delete(`/api/conversations/${id}`);
      setConversations((c) => c.filter((x) => x.id !== id));
      if (activeIdRef.current === id) newConversation();
    } catch (e) {
      setError({ message: errorMessage(e) });
      throw e;
    }
  }

  async function changeMode(mode: AssistantMode) {
    const id = activeIdRef.current;
    if (!id) {
      setDraftMode(mode);
      return;
    }
    try {
      const { conversation } = await api.patch<{ conversation: ConversationDTO }>(`/api/conversations/${id}`, { mode });
      setConversations((c) => c.map((x) => (x.id === id ? conversation : x)));
    } catch (e) {
      setError({ message: errorMessage(e) });
    }
  }

  // ── Render ────────────────────────────────────────────────────
  const active = conversations.find((c) => c.id === activeId) ?? null;
  const currentMode = active?.mode ?? draftMode;
  const showEmpty = !activeId && messages.length === 0;

  return (
    <div className="flex h-full">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-chalk/10 bg-pitch-950 transition-transform md:static md:z-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Historial de conversaciones"
      >
        <Sidebar
          conversations={conversations}
          state={listState}
          activeId={activeId}
          onSelect={(id) => openConversation(id)}
          onNew={() => newConversation()}
          onRename={renameConversation}
          onDelete={deleteConversation}
          onRetry={() => {
            setListState("loading");
            void fetchConversations();
          }}
        />
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-chalk/10 px-3 py-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-chalk-muted hover:bg-pitch-700 md:hidden"
            aria-label="Abrir historial"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="min-w-0 flex-1 truncate text-sm font-medium">{active?.title ?? "Nueva conversación"}</h2>
          <label className="flex items-center gap-2 text-xs text-chalk-muted">
            <span className="hidden sm:inline">Modo</span>
            <select
              value={currentMode}
              onChange={(e) => void changeMode(e.target.value as AssistantMode)}
              disabled={sending}
              className="rounded-lg border border-chalk/15 bg-pitch-800 px-2 py-1.5 text-xs text-chalk outline-none focus:border-accent"
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.icon} {m.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="pitch-lines min-h-0 flex-1 overflow-y-auto">
          {messagesState === "loading" && (
            <div className="grid h-full place-items-center" role="status" aria-label="Cargando mensajes">
              <div className="size-8 animate-spin rounded-full border-2 border-chalk/20 border-t-accent" />
            </div>
          )}
          {messagesState === "error" && (
            <CenteredNotice
              text="No se pudieron cargar los mensajes."
              action="Reintentar"
              onAction={() => activeId && openConversation(activeId, false)}
            />
          )}
          {messagesState === "not-found" && (
            <CenteredNotice
              text="Esta conversación no existe o no te pertenece."
              action="Empezar una nueva"
              onAction={() => newConversation()}
            />
          )}
          {messagesState === "idle" &&
            (showEmpty ? (
              <EmptyState mode={draftMode} onModeChange={setDraftMode} onPick={(q) => void send(q)} disabled={sending} />
            ) : (
              <MessageList messages={messages} thinking={sending} streamingText={streamingText} />
            ))}
        </div>

        {error && (
          <div className="mx-auto w-full max-w-3xl px-4 pb-2">
            <div role="alert" className="flex items-center gap-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm">
              <span className="flex-1">{error.message}</span>
              {error.retry && (
                <button onClick={error.retry} className="font-semibold text-accent hover:underline">
                  Reintentar
                </button>
              )}
              <button onClick={() => setError(null)} aria-label="Cerrar" className="text-chalk-muted hover:text-chalk">
                ✕
              </button>
            </div>
          </div>
        )}

        <Composer
          onSend={(c) => void send(c)}
          disabled={sending || messagesState === "loading" || messagesState === "not-found"}
        />
      </section>
    </div>
  );
}

function CenteredNotice({ text, action, onAction }: { text: string; action: string; onAction: () => void }) {
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div>
        <p className="text-chalk-muted">{text}</p>
        <button onClick={onAction} className="mt-3 text-sm font-semibold text-accent hover:underline">
          {action}
        </button>
      </div>
    </div>
  );
}
