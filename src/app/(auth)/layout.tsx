import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="pitch-lines flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-chalk/10 bg-pitch-800/80 p-6 shadow-2xl backdrop-blur sm:p-8">
        {children}
      </div>
    </main>
  );
}
