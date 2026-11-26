import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

/**
 * Guards de servidor. Deben ir dentro de <Suspense> (cacheComponents):
 * leen la sesión en tiempo de request y redirigen si no hay permiso.
 */
export async function RequireUser({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return children;
}

export async function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/chat");
  return children;
}
