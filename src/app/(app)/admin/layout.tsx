import { Suspense } from "react";
import { RequireAdmin } from "@/components/auth/guards";

/** Solo ADMIN. Las API Routes de admin validan también con requireAdmin(). */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="h-full overflow-y-auto">
      <Suspense>
        <RequireAdmin>{children}</RequireAdmin>
      </Suspense>
    </div>
  );
}
