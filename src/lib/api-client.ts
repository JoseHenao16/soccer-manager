/** Cliente HTTP del navegador hacia nuestra API. Normaliza errores a ApiError. */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly retryable = true,
  ) {
    super(message);
  }
}

const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

async function send(method: string, url: string, body?: unknown, signal?: AbortSignal): Promise<Response> {
  try {
    return await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    if (isAbort(e)) throw e;
    throw new ApiError("Sin conexión. Revisa tu internet e inténtalo de nuevo.", 0, "NETWORK");
  }
}

/** Convierte una respuesta de error { error: { code, message } } en ApiError. */
async function throwApiError(res: Response): Promise<never> {
  const data = await res.json().catch(() => null);
  if (res.status === 401 && typeof window !== "undefined") {
    // Sesión expirada: recarga completa hacia el login (limpia el estado del cliente).
    const url = new URL("/login", window.location.origin);
    url.searchParams.set("next", window.location.pathname);
    window.location.assign(url.toString());
  }
  throw new ApiError(
    data?.error?.message ?? "Ocurrió un error inesperado",
    res.status,
    data?.error?.code ?? "UNKNOWN",
  );
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await send(method, url, body);
  if (!res.ok) await throwApiError(res);
  return (await res.json()) as T;
}

/**
 * POST que recibe NDJSON (una línea JSON por evento) y llama a `onEvent` por cada uno.
 * Si el servidor responde con error antes de abrir el stream, lanza ApiError.
 */
export async function postStream<E>(
  url: string,
  body: unknown,
  onEvent: (event: E) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await send("POST", url, body, signal);
  if (!res.ok || !res.body) await throwApiError(res);

  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  const flush = (line: string) => line.trim() && onEvent(JSON.parse(line) as E);
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      let nl: number;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        flush(buffer.slice(0, nl));
        buffer = buffer.slice(nl + 1);
      }
    }
  } catch (e) {
    if (isAbort(e)) throw e;
    throw new ApiError("Se perdió la conexión mientras llegaba la respuesta.", 0, "NETWORK");
  }
  flush(buffer);
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body ?? {}),
  put: <T>(url: string, body: unknown) => request<T>("PUT", url, body),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  delete: <T>(url: string) => request<T>("DELETE", url),
};
