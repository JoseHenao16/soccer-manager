import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/ui/auth-form";

export const metadata: Metadata = { title: "Iniciar sesión · The Pizarra Futnorte IA" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-1 font-display text-4xl font-extrabold uppercase italic tracking-tight">Bienvenido de vuelta</h1>
      <p className="mb-6 text-sm text-chalk-muted">Entra para seguir armando tu pizarra.</p>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </>
  );
}
