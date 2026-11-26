import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/infrastructure/auth/supabase-proxy";

const PROTECTED = ["/chat", "/admin"];
const AUTH_PAGES = ["/login", "/register"];

/**
 * Chequeo optimista de sesión (Next 16: "proxy", antes "middleware").
 * La autorización real (dueño / ADMIN) se valida en layouts y API Routes.
 */
export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    if (path === "/login") url.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(url);
    // Conserva las cookies de sesión refrescadas.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!userId && PROTECTED.some((p) => pathname.startsWith(p))) return redirectTo("/login");
  if (userId && AUTH_PAGES.includes(pathname)) return redirectTo("/chat");

  return response;
}

export const config = {
  // Todo excepto estáticos, imágenes y la API (las API Routes validan por su cuenta).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
