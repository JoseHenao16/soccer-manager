import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatApp } from "@/components/chat/chat-app";

export const metadata: Metadata = { title: "Chat · The Pizarra Futnorte IA" };

/** /chat (nueva conversación) y /chat/<id> (conversación existente). */
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="grid h-full place-items-center" role="status" aria-label="Cargando chat">
          <div className="size-8 animate-spin rounded-full border-2 border-chalk/20 border-t-accent" />
        </div>
      }
    >
      <ChatApp />
    </Suspense>
  );
}
