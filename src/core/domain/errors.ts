// Errores de dominio. La capa de presentación los traduce a códigos HTTP.

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Debes iniciar sesión") {
    super(message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "No tienes permisos para esta acción") {
    super(message, "FORBIDDEN");
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Recurso no encontrado") {
    super(message, "NOT_FOUND");
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message, "VALIDATION");
  }
}

/**
 * Error del proveedor de IA. `kind` permite responder con el código HTTP adecuado:
 * RATE_LIMIT → 429, TIMEOUT → 504, CONFIG → 500, UNAVAILABLE → 502.
 */
export type AIErrorKind = "RATE_LIMIT" | "TIMEOUT" | "CONFIG" | "UNAVAILABLE";

export class AIProviderError extends DomainError {
  constructor(
    message: string,
    public readonly retryable = false,
    public readonly kind: AIErrorKind = "UNAVAILABLE",
  ) {
    super(message, kind === "UNAVAILABLE" ? "AI_PROVIDER" : `AI_${kind}`);
  }
}
