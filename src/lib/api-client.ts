/** Cliente HTTP del navegador hacia nuestra API. Normaliza errores a ApiError. */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Sin conexión. Revisa tu internet e inténtalo de nuevo.", 0, "NETWORK");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
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
  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body ?? {}),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  delete: <T>(url: string) => request<T>("DELETE", url),
};
