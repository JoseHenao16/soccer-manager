"use client";

import { useState } from "react";
import type { Role } from "@/core/domain/entities";
import { api, ApiError } from "@/lib/api-client";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date | string;
}

export function UsersTable({ users: initial, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const [users, setUsers] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [query, setQuery] = useState("");

  async function changeRole(user: UserRow, role: Role) {
    setBusy(user.id);
    setFeedback(null);
    try {
      const { user: updated } = await api.patch<{ user: UserRow }>(`/api/admin/users/${user.id}`, { role });
      setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, role: updated.role } : u)));
      setFeedback({ type: "ok", text: `${user.email} ahora es ${role}` });
    } catch (e) {
      setFeedback({ type: "error", text: e instanceof ApiError ? e.message : "No se pudo cambiar el rol" });
    } finally {
      setBusy(null);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) => u.email.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q))
    : users;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-chalk-muted">
          {users.length} usuarios · {users.filter((u) => u.role === "ADMIN").length} administradores
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar usuarios"
          className="w-full rounded-lg border border-chalk/15 bg-pitch-950/60 px-3 py-2 text-sm outline-none focus:border-accent sm:w-72"
        />
      </div>

      {feedback && (
        <p
          role="status"
          className={`rounded-lg border px-3 py-2 text-sm ${
            feedback.type === "ok" ? "border-accent/40 bg-accent/10 text-accent" : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-chalk/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-pitch-800 text-xs uppercase tracking-wider text-chalk-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const isMe = u.id === currentUserId;
              return (
                <tr key={u.id} className="border-t border-chalk/10">
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {u.name ?? "Sin nombre"} {isMe && <span className="text-xs text-chalk-muted">(tú)</span>}
                    </p>
                    <p className="text-xs text-chalk-muted">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-chalk-muted">
                    {new Date(u.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={isMe || busy === u.id}
                      onChange={(e) => void changeRole(u, e.target.value as Role)}
                      aria-label={`Rol de ${u.email}`}
                      title={isMe ? "No puedes cambiar tu propio rol" : undefined}
                      className="rounded-lg border border-chalk/15 bg-pitch-800 px-2 py-1.5 text-xs outline-none focus:border-accent disabled:opacity-50"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-chalk-muted">
                  Ningún usuario coincide con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
