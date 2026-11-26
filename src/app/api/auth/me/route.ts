import { handleApiError, json } from "@/lib/http";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    return json({ user: await requireUser() });
  } catch (error) {
    return handleApiError(error);
  }
}
