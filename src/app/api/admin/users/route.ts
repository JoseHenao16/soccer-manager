import { listUsers } from "@/core/application/use-cases/admin";
import { repositories } from "@/lib/container";
import { handleApiError, json } from "@/lib/http";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const admin = await requireAdmin();
    return json({ users: await listUsers(repositories, admin) });
  } catch (error) {
    return handleApiError(error);
  }
}
