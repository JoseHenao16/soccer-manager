"use client";

import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;
    setLoading(true);
    // Aunque la petición falle, se navega igual: el servidor borra las cookies de sesión
    // y el proxy decide a dónde ir con lo que quede.
    await fetch("/api/auth/logout", { method: "POST", cache: "no-store" }).catch(() => null);
    // Recarga completa (no router.replace): descarta la caché del router de Next y el estado
    // en memoria del usuario anterior (conversaciones, panel de admin…).
    window.location.replace(new URL("/login", window.location.origin).toString());
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="rounded-lg border border-chalk/15 px-3 py-1.5 text-sm text-chalk-muted transition hover:border-danger/50 hover:bg-danger/10 hover:text-danger disabled:opacity-60"
    >
      {loading ? "Saliendo…" : "Salir"}
    </button>
  );
}
