import { getStats } from "@/core/application/use-cases/admin";
import { repositories } from "@/lib/container";
import { handleApiError, json } from "@/lib/http";
import { requireAdmin } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    const days = Number(new URL(request.url).searchParams.get("days") ?? 14);
    const safeDays = Number.isInteger(days) && days >= 1 && days <= 90 ? days : 14;
    return json({ stats: await getStats(repositories, admin, safeDays) });
  } catch (error) {
    return handleApiError(error);
  }
}
