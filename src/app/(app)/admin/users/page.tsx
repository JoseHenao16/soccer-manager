import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { UsersTable } from "@/components/admin/users-table";
import { listUsers } from "@/core/application/use-cases/admin";
import { repositories } from "@/lib/container";
import { requireAdminPage } from "@/lib/session";

export const metadata: Metadata = { title: "Admin · Usuarios" };

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <UsersContent />
    </Suspense>
  );
}

async function UsersContent() {
  const admin = await requireAdminPage(); // validar ANTES de consultar/renderizar
  const users = await listUsers(repositories, admin);
  return <UsersTable users={users} currentUserId={admin.id} />;
}
