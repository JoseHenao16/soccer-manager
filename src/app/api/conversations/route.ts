import { createConversation, listConversations } from "@/core/application/use-cases/conversations";
import { repositories } from "@/lib/container";
import { handleApiError, json, parseBody } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { createConversationSchema } from "@/lib/validation/conversations";

/** Lista las conversaciones del usuario autenticado. */
export async function GET() {
  try {
    const user = await requireUser();
    return json({ conversations: await listConversations(repositories, user) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Crea una conversación vacía. */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, createConversationSchema);
    return json({ conversation: await createConversation(repositories, user, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
