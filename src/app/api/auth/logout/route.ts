import { logoutUser } from "@/core/application/use-cases/auth";
import { makeAuthGateway } from "@/lib/container";
import { handleApiError, json } from "@/lib/http";

export async function POST() {
  try {
    await logoutUser({ auth: await makeAuthGateway() });
    return json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
