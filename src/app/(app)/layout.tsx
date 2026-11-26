import { Suspense } from "react";
import { RequireUser } from "@/components/auth/guards";
import { UserNav } from "@/components/auth/user-nav";
import { Logo } from "@/components/ui/logo";

/**
 * Layout de la zona privada. El header es estático; la sesión se valida en el servidor
 * dentro de <Suspense> (RequireUser), además del chequeo optimista del proxy.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="stadium-bg flex h-dvh flex-col overflow-clip">
      <header className="relative z-10 flex items-center justify-between gap-3 border-b border-chalk/10 bg-pitch-950/50 px-4 py-2.5 backdrop-blur-xl">
        <Logo href="/chat" />
        <Suspense fallback={<div className="skeleton h-8 w-40 rounded-lg" />}>
          <UserNav />
        </Suspense>
      </header>
      <div className="min-h-0 flex-1">
        <Suspense fallback={<PageSpinner />}>
          <RequireUser>{children}</RequireUser>
        </Suspense>
      </div>
    </div>
  );
}

function PageSpinner() {
  return (
    <div className="grid h-full place-items-center" role="status" aria-label="Cargando">
      <div className="size-8 animate-spin rounded-full border-2 border-chalk/20 border-t-accent" />
    </div>
  );
}
