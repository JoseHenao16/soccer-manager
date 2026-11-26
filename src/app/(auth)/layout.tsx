import { TacticalBoard } from "@/components/landing/tactical-board";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="stadium-bg flex min-h-screen flex-col items-center justify-center overflow-clip px-4 py-10">
      {/* Pizarra animada de fondo, muy tenue */}
      <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center opacity-[0.12]" aria-hidden>
        <TacticalBoard className="w-[140vmax] max-w-none rotate-[-8deg]" />
      </div>
      <div className="mb-8 animate-fade-up">
        <Logo />
      </div>
      <div
        className="glass glow-border w-full max-w-sm animate-pop-in rounded-2xl p-6 shadow-2xl shadow-black/50 sm:p-8"
        data-active="true"
        style={{ animationDelay: "80ms" }}
      >
        {children}
      </div>
    </main>
  );
}
