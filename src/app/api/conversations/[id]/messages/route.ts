import { sendMessage } from "@/core/application/use-cases/send-message";
import { NotFoundError } from "@/core/domain/errors";
import { getAIProvider, repositories } from "@/lib/container";
import { handleApiError, json, parseBody } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { idSchema, sendMessageSchema } from "@/lib/validation/conversations";

// Las respuestas de un LLM pueden tardar: margen amplio en Vercel.
export const maxDuration = 60;

/** Envía una pregunta y devuelve la respuesta del asistente. */
export async function POST(request: Request, ctx: RouteContext<"/api/conversations/[id]/messages">) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    if (!idSchema.safeParse(id).success) throw new NotFoundError("Conversación no encontrada");
    const { content } = await parseBody(request, sendMessageSchema);

    const result = await sendMessage(
      { ...repositories, ai: getAIProvider() },
      user,
      id,
      content,
    );
    return json(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
