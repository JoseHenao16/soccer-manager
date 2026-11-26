import Link from "next/link";
import { Suspense } from "react";
import { GuestNav, PublicNav } from "@/components/auth/user-nav";
import { ChatPreview } from "@/components/landing/chat-preview";
import { TacticalBoard } from "@/components/landing/tactical-board";
import { Logo } from "@/components/ui/logo";

const FEATURES = [
  {
    title: "Táctica",
    text: "Sistemas, pressing, salida de balón y transiciones explicados como en una charla técnica.",
    icon: "M4 6h16M4 12h10M4 18h6",
    tag: "Modo Analista",
  },
  {
    title: "Entrenamiento",
    text: "Sesiones completas con objetivos, tiempos, espacios y variantes para cada categoría.",
    icon: "M5 12h14M12 5v14",
    tag: "Modo Entrenador",
  },
  {
    title: "Reglamento",
    text: "Reglas de Juego de la IFAB, fuera de juego y VAR, con la regla exacta citada.",
    icon: "M6 4h9l3 3v13H6z M9 12h6M9 16h4",
    tag: "Modo Árbitro",
  },
];

const TOPICS = [
  "4-3-3", "Presión alta", "Rondos", "Fuera de juego", "VAR", "Bloque bajo", "Salida de tres",
  "Pretemporada", "Juego de posición", "Transiciones", "Balón parado", "Regla 12", "Sub-15", "Contraataque",
];

const STEPS = [
  { n: "01", title: "Elige el modo", text: "General, Entrenador, Árbitro o Analista." },
  { n: "02", title: "Pregunta", text: "En tus palabras, como hablarías con tu cuerpo técnico." },
  { n: "03", title: "Lleva la pizarra al campo", text: "Respuestas estructuradas con un consejo práctico." },
];

export default function LandingPage() {
  return (
    <div className="stadium-bg flex min-h-screen flex-col overflow-x-clip">
      <header className="sticky top-0 z-20 border-b border-chalk/5 bg-pitch-900/60 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <nav className="flex items-center gap-3 text-sm">
            <Suspense fallback={<GuestNav />}>
              <PublicNav />
            </Suspense>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="pitch-lines">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-24">
            <div>
              <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_#a3e635]" />
                Asistente de IA especializado en fútbol
              </p>
              <h1
                className="mt-5 animate-fade-up font-display text-5xl font-extrabold uppercase italic leading-[0.95] tracking-tight sm:text-7xl"
                style={{ animationDelay: "80ms" }}
              >
                Tu cuerpo técnico,
                <br />
                <span className="text-gradient">en una pizarra.</span>
              </h1>
              <p className="mt-5 max-w-lg animate-fade-up text-lg text-chalk-muted" style={{ animationDelay: "160ms" }}>
                Pregunta sobre táctica, diseña entrenamientos y resuelve dudas de reglamento con The Pizarra
                Futnorte IA.
              </p>
              <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
                <Link
                  href="/register"
                  className="btn-shine group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-pitch-950 shadow-[0_10px_30px_-10px_#a3e635] transition hover:bg-accent-strong"
                >
                  Empezar gratis
                  <svg viewBox="0 0 24 24" className="size-4 transition group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-chalk/20 bg-pitch-900/40 px-6 py-3 backdrop-blur transition hover:border-accent/50 hover:text-accent"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-up sm:pb-20" style={{ animationDelay: "200ms" }}>
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/10 blur-3xl" aria-hidden />
              <div className="glass glow-border rounded-2xl p-3 shadow-2xl shadow-black/50" data-active="true">
                <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-chalk-muted">
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-chalk">
                    Pizarra · 4-3-3
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-danger/15 px-2 py-0.5 font-semibold text-danger">
                    <span className="size-1.5 animate-pulse rounded-full bg-danger" /> EN VIVO
                  </span>
                </div>
                <TacticalBoard className="w-full" />
              </div>
              {/* Móvil: debajo de la pizarra; desde sm: flotando sobre su esquina */}
              <div className="mt-4 animate-float sm:absolute sm:-bottom-2 sm:-right-6 sm:mt-0 sm:w-80">
                <ChatPreview />
              </div>
            </div>
          </div>
        </section>

        {/* Marquee de temas */}
        <section className="mask-fade-x overflow-hidden border-y border-chalk/5 bg-pitch-950/40 py-4" aria-label="Temas">
          <ul className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
            {[...TOPICS, ...TOPICS].map((t, i) => (
              <li
                key={i}
                aria-hidden={i >= TOPICS.length}
                className="whitespace-nowrap rounded-full border border-chalk/10 bg-pitch-800/60 px-4 py-1.5 font-display text-sm font-semibold uppercase tracking-wider text-chalk-muted"
              >
                <span className="mr-2 text-accent">●</span>
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* Funcionalidades */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-display text-4xl font-extrabold uppercase italic tracking-tight sm:text-5xl">
            Todo el cuerpo técnico, <span className="text-gradient">un solo chat</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className="glass glow-border lift group animate-fade-up rounded-2xl p-6"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/30 transition duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-pitch-950">
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide">{f.title}</h3>
                <p className="mt-2 text-sm text-chalk-muted">{f.text}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent/80">{f.tag}</p>
              </article>
            ))}
          </div>

          {/* Cómo funciona */}
          <ol className="mt-16 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative border-l-2 border-accent/40 pl-5">
                <span className="font-display text-5xl font-extrabold italic text-chalk/10">{s.n}</span>
                <p className="-mt-3 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-chalk-muted">{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="btn-shine inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 font-semibold text-pitch-950 shadow-[0_10px_30px_-10px_#a3e635] transition hover:bg-accent-strong"
            >
              Saltar a la cancha
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-chalk/10 py-6 text-center text-xs text-chalk-muted">
        The Pizarra Futnorte IA · Proyecto integrador de Ingeniería Web · 2026
      </footer>
    </div>
  );
}
