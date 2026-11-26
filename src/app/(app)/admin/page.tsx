import type { Metadata } from "next";
import { ActivityChart } from "@/components/admin/activity-chart";
import { getStats } from "@/core/application/use-cases/admin";
import { repositories } from "@/lib/container";
import { requireAdminPage } from "@/lib/session";

export const metadata: Metadata = { title: "Admin · Estadísticas" };

export default async function AdminStatsPage() {
  const admin = await requireAdminPage(); // validar ANTES de consultar/renderizar
  const stats = await getStats(repositories, admin, 14);

  const tiles = [
    { label: "Usuarios", value: stats.users, hint: `${stats.admins} admin` },
    { label: "Conversaciones", value: stats.conversations },
    { label: "Mensajes", value: stats.messages },
    {
      label: "Preguntas por conversación",
      value: stats.conversations ? (stats.messages / 2 / stats.conversations).toFixed(1) : "0",
    },
    {
      label: "Latencia media IA",
      value: stats.avgLatencyMs != null ? `${(stats.avgLatencyMs / 1000).toFixed(1)} s` : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-chalk/10 bg-pitch-800 p-4">
            <p className="text-xs text-chalk-muted">{t.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{t.value}</p>
            {t.hint && <p className="mt-0.5 text-xs text-chalk-muted">{t.hint}</p>}
          </div>
        ))}
      </div>
      <ActivityChart data={stats.messagesPerDay} />
    </div>
  );
}
