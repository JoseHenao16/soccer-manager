import { getSessionUser } from "@/lib/session";

// Placeholder: la interfaz de chat completa llega en la Fase 3.
export default async function ChatPage() {
  const user = await getSessionUser();
  return (
    <main className="pitch-lines grid h-full place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">¡Hola, {user?.name ?? "crack"}! ⚽</h1>
        <p className="mt-2 text-chalk-muted">El chat con The Pizarra Futnorte IA llega en la Fase 3.</p>
      </div>
    </main>
  );
}
