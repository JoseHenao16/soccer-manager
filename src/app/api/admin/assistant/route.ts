import { getAssistantConfig, updateAssistantConfig } from "@/core/application/use-cases/admin";
import { repositories } from "@/lib/container";
import { handleApiError, json, parseBody } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { assistantConfigSchema } from "@/lib/validation/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();
    return json({ config: await getAssistantConfig(repositories, admin) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Reemplaza la configuración del asistente (System Prompt, modelo, parámetros). */
export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const data = await parseBody(request, assistantConfigSchema);
    return json({ config: await updateAssistantConfig(repositories, admin, data) });
  } catch (error) {
    return handleApiError(error);
  }
}
