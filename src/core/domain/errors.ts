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

export class AIProviderError extends DomainError {
  constructor(
    message: string,
    public readonly retryable = false,
  ) {
    super(message, "AI_PROVIDER");
  }
}
