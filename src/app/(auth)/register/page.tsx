import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/ui/auth-form";

export const metadata: Metadata = { title: "Crear cuenta · The Pizarra Futnorte IA" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Crea tu cuenta</h1>
      <p className="mb-6 text-sm text-chalk-muted">Tu asistente de táctica, entrenamiento y reglamento.</p>
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </>
  );
}
