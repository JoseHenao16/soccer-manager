import { sendMessage, streamMessage } from "@/core/application/use-cases/send-message";
import { NotFoundError } from "@/core/domain/errors";
import { getAIProvider, repositories } from "@/lib/container";
import { handleApiError, json, parseBody } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { idSchema, sendMessageSchema } from "@/lib/validation/conversations";

// Las respuestas de un LLM pueden tardar: margen amplio en Vercel.
export const maxDuration = 60;

/**
 * Envía una pregunta al asistente.
 * - `{ content }` → JSON con { conversation, userMessage, assistantMessage }.
 * - `{ content, stream: true }` → NDJSON (una línea JSON por evento):
 *   {type:"delta",text} … {type:"done",…} | {type:"error",code,message,retryable}
 */
export async function POST(request: Request, ctx: RouteContext<"/api/conversations/[id]/messages">) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    if (!idSchema.safeParse(id).success) throw new NotFoundError("Conversación no encontrada");
    const { content, stream } = await parseBody(request, sendMessageSchema);
    const deps = { ...repositories, ai: getAIProvider() };

    if (!stream) return json(await sendMessage(deps, user, id, content), 201);

    // Errores de validación/permisos se lanzan aquí (antes de abrir el stream) → JSON normal.
    const events = await streamMessage(deps, user, id, content, request.signal);
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of events) {
            controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
