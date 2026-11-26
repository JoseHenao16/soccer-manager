import {
  deleteConversation,
  getConversationWithMessages,
  updateConversation,
} from "@/core/application/use-cases/conversations";
import { NotFoundError } from "@/core/domain/errors";
import { repositories } from "@/lib/container";
import { handleApiError, json, parseBody } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { idSchema, updateConversationSchema } from "@/lib/validation/conversations";

type Ctx = RouteContext<"/api/conversations/[id]">;

async function parseId(ctx: Ctx) {
  const { id } = await ctx.params;
  if (!idSchema.safeParse(id).success) throw new NotFoundError("Conversación no encontrada");
  return id;
}

/** Conversación + mensajes (solo el dueño). */
export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    return json(await getConversationWithMessages(repositories, user, await parseId(ctx)));
  } catch (error) {
    return handleApiError(error);
  }
}

/** Renombrar o cambiar el modo. */
export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const id = await parseId(ctx);
    const input = await parseBody(request, updateConversationSchema);
    return json({ conversation: await updateConversation(repositories, user, id, input) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Eliminar (con sus mensajes en cascada). */
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    await deleteConversation(repositories, user, await parseId(ctx));
    return json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
