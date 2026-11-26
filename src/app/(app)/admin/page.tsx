import { Suspense } from "react";
import { requireAdminPage } from "@/lib/session";

export default function AdminPage() {
  return (
    <Suspense>
      <AdminDashboard />
    </Suspense>
  );
}

// Placeholder: el panel completo (usuarios, asistente, estadísticas) llega en la Fase 4.
async function AdminDashboard() {
  await requireAdminPage(); // validar ANTES de renderizar contenido de admin
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Panel de administración</h1>
      <p className="mt-2 text-chalk-muted">Usuarios, configuración del asistente y estadísticas: Fase 4.</p>
    </main>
  );
}
