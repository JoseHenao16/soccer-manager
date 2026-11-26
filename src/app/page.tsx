import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Suspense } from "react";
import { GuestNav, PublicNav } from "@/components/auth/user-nav";

const FEATURES = [
  {
    title: "Táctica",
    text: "Sistemas, pressing, salida de balón y transiciones explicados como en una charla técnica.",
    icon: "M4 6h16M4 12h10M4 18h6",
  },
  {
    title: "Entrenamiento",
    text: "Sesiones completas con objetivos, tiempos, espacios y variantes para cada categoría.",
    icon: "M5 12h14M12 5v14",
  },
  {
    title: "Reglamento",
    text: "Reglas de Juego de la IFAB, fuera de juego y VAR, con la regla exacta citada.",
    icon: "M6 4h9l3 3v13H6z M9 12h6M9 16h4",
  },
];

const EXAMPLES = [
  "¿Cómo presionar alto con un 4-3-3 contra una salida de tres centrales?",
  "Diseña una sesión de 75 minutos para sub-15 enfocada en transiciones.",
  "¿Es fuera de juego si recibo de un saque de banda?",
];

export default function LandingPage() {

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-3 text-sm">
          <Suspense fallback={<GuestNav />}>
            <PublicNav />
          </Suspense>
        </nav>
      </header>

      <main className="flex-1">
        <section className="pitch-lines">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <p className="mb-3 inline-block rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Asistente de IA especializado en fútbol
              </p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Tu cuerpo técnico, <span className="text-accent">en una pizarra</span>.
              </h1>
              <p className="mt-4 max-w-lg text-lg text-chalk-muted">
                Pregunta sobre táctica, diseña entrenamientos y resuelve dudas de reglamento con
                The Pizarra Futnorte IA.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="rounded-lg bg-accent px-6 py-3 font-semibold text-pitch-950 hover:bg-accent-strong">
                  Empezar gratis
                </Link>
                <Link href="/login" className="rounded-lg border border-chalk/20 px-6 py-3 hover:border-chalk/40">
                    Ya tengo cuenta
                  </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-chalk/10 bg-pitch-800/80 p-5 shadow-2xl">
              <p className="mb-3 text-xs uppercase tracking-wider text-chalk-muted">Pregúntale cosas como…</p>
              <ul className="space-y-3">
                {EXAMPLES.map((q) => (
                  <li key={q} className="rounded-xl border border-chalk/10 bg-pitch-950/50 px-4 py-3 text-sm">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-2xl border border-chalk/10 bg-pitch-800/60 p-6">
              <svg viewBox="0 0 24 24" className="mb-4 size-7 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d={f.icon} />
              </svg>
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-chalk-muted">{f.text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-chalk/10 py-6 text-center text-xs text-chalk-muted">
        The Pizarra Futnorte IA · Proyecto integrador de Ingeniería Web · 2026
      </footer>
    </div>
  );
}
