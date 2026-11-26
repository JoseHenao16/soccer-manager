"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error?.message ?? "No se pudo completar la solicitud");
        return;
      }
      const next = params.get("next");
      router.replace(next?.startsWith("/") ? next : "/chat");
      router.refresh();
    } catch {
      setError("Error de red. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {isRegister && (
        <Field label="Nombre" name="name" type="text" autoComplete="name" placeholder="Tu nombre" />
      )}
      <Field label="Correo" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        placeholder={isRegister ? "Mínimo 8 caracteres" : "••••••••"}
      />

      {error && (
        <p role="alert" className="animate-pop-in rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-pitch-950 shadow-[0_10px_30px_-12px_#a3e635] transition hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <span className="size-4 animate-spin rounded-full border-2 border-pitch-950/30 border-t-pitch-950" aria-hidden />}
        {loading ? "Un momento…" : isRegister ? "Crear cuenta" : "Entrar"}
      </button>

      <p className="text-center text-sm text-chalk-muted">
        {isRegister ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
        <Link href={isRegister ? "/login" : "/register"} className="text-accent hover:underline">
          {isRegister ? "Inicia sesión" : "Regístrate"}
        </Link>
      </p>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...input } = props;
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-chalk-muted">{label}</span>
      <input
        {...input}
        required
        className="w-full rounded-xl border border-chalk/15 bg-pitch-950/60 px-3.5 py-2.5 text-chalk outline-none transition placeholder:text-chalk-muted/50 hover:border-chalk/30 focus:border-accent focus:bg-pitch-950 focus:ring-4 focus:ring-accent/15"
      />
    </label>
  );
}
