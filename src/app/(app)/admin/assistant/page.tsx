import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { AssistantForm } from "@/components/admin/assistant-form";
import { getAssistantConfig } from "@/core/application/use-cases/admin";
import { DEFAULT_SYSTEM_PROMPT } from "@/core/domain/assistant";
import { repositories } from "@/lib/container";
import { requireAdminPage } from "@/lib/session";
import { ALLOWED_MODELS } from "@/lib/validation/admin";

export const metadata: Metadata = { title: "Admin · Asistente" };

export default function AdminAssistantPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AssistantContent />
    </Suspense>
  );
}

async function AssistantContent() {
  const admin = await requireAdminPage(); // validar ANTES de consultar/renderizar
  const config = await getAssistantConfig(repositories, admin);
  return (
    <AssistantForm
      config={config}
      models={ALLOWED_MODELS}
      defaultPrompt={DEFAULT_SYSTEM_PROMPT}
      provider={process.env.AI_PROVIDER ?? "mock"}
    />
  );
}
