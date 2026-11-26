import "server-only";
import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { DomainError, ValidationError } from "@/core/domain/errors";

const STATUS: Record<string, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  RATE_LIMIT: 429,
  AI_PROVIDER: 502,
  AI_RATE_LIMIT: 429,
  AI_TIMEOUT: 504,
  AI_CONFIG: 500,
  AUTH: 400,
};

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Convierte cualquier error en una respuesta JSON consistente: { error: { code, message } }. */
export function handleApiError(error: unknown) {
  // Deja pasar los errores internos de Next (prerender dinámico, redirect, notFound).
  unstable_rethrow(error);
  if (error instanceof DomainError) {
    return json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error instanceof ValidationError && error.details ? { details: error.details } : {}),
        },
      },
      STATUS[error.code] ?? 400,
    );
  }
  console.error("[API] Error no controlado:", error);
  return json({ error: { code: "INTERNAL", message: "Ocurrió un error inesperado" } }, 500);
}

/** Lee y valida el body con zod; lanza ValidationError con detalles por campo. */
export async function parseBody<S extends z.ZodType>(request: Request, schema: S): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ValidationError("El cuerpo de la petición no es JSON válido");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    throw new ValidationError(details[0]?.message ?? "Datos inválidos", details);
  }
  return result.data;
}
