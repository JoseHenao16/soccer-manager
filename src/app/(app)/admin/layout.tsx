import { Suspense } from "react";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { RequireAdmin } from "@/components/auth/guards";

/**
 * Zona ADMIN. Defensa en capas: proxy (sesión) → este guard → requireAdminPage() en cada
 * página (antes de renderizar) → requireAdmin() + assertAdmin() en API y casos de uso.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">Panel de administración</h1>
        <AdminTabs />
        <div className="pt-6">
          <Suspense fallback={<AdminSkeleton />}>
            <RequireAdmin>{children}</RequireAdmin>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Cargando">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-pitch-800" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-pitch-800" />
    </div>
  );
}
