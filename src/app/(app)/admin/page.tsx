import type { Metadata } from "next";
import { ActivityChart } from "@/components/admin/activity-chart";
import { StatTile } from "@/components/admin/stat-tile";
import { getStats } from "@/core/application/use-cases/admin";
import { repositories } from "@/lib/container";
import { requireAdminPage } from "@/lib/session";

export const metadata: Metadata = { title: "Admin · Estadísticas" };

export default async function AdminStatsPage() {
  const admin = await requireAdminPage(); // validar ANTES de consultar/renderizar
  const stats = await getStats(repositories, admin, 14);

  const tiles = [
    {
      label: "Usuarios",
      value: stats.users,
      hint: `${stats.admins} admin`,
      icon: "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    },
    { label: "Conversaciones", value: stats.conversations, icon: "M4 5h16v11H8l-4 4z" },
    { label: "Mensajes", value: stats.messages, icon: "M4 6h16M4 12h16M4 18h10" },
    {
      label: "Preguntas por conversación",
      value: stats.conversations ? stats.messages / 2 / stats.conversations : 0,
      decimals: 1,
      icon: "M9 9a3 3 0 1 1 4 2.8c-.6.3-1 .9-1 1.6V14M12 18h.01",
    },
    {
      label: "Latencia media IA",
      value: stats.avgLatencyMs != null ? stats.avgLatencyMs / 1000 : null,
      decimals: 1,
      suffix: " s",
      icon: "M12 13m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 9v4l2 2M10 2h4",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map((t, i) => (
          <StatTile key={t.label} index={i} {...t} />
        ))}
      </div>
      <ActivityChart data={stats.messagesPerDay} />
    </div>
  );
}
