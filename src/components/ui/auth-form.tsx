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
      <PasswordField
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

const INPUT_CLASS =
  "w-full rounded-xl border border-chalk/15 bg-pitch-950/60 px-3.5 py-2.5 text-chalk outline-none transition placeholder:text-chalk-muted/50 hover:border-chalk/30 focus:border-accent focus:bg-pitch-950 focus:ring-4 focus:ring-accent/15";

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...input } = props;
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-chalk-muted">{label}</span>
      <input {...input} required className={INPUT_CLASS} />
    </label>
  );
}

/** Contraseña con botón para mostrarla u ocultarla. */
function PasswordField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor="password" className="block text-sm text-chalk-muted">
        Contraseña
      </label>
      <div className="relative">
        <input
          {...props}
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          required
          className={`${INPUT_CLASS} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          // Evita que el input pierda el foco (y el cursor) al pulsar el botón.
          onMouseDown={(e) => e.preventDefault()}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          aria-controls="password"
          title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-1.5 my-auto grid size-9 place-items-center rounded-lg text-chalk-muted transition hover:bg-pitch-700/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="M4 4l16 16" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
