import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NOME_COOKIE_SESSAO, verificarSessionToken } from "@/lib/session";

/**
 * Protege as rotas administrativas (/admin/* exceto /admin/login e as
 * rotas de API /api/admin/*). Renomeado de `middleware.ts` para `proxy.ts`
 * conforme a convenção do Next.js 16.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isLoginPage;
  // /api/admin/login precisa ficar acessível sem sessão — é o próprio
  // endpoint que cria a sessão (sem essa exceção, ninguém consegue logar).
  // /api/admin/logout também: deve sempre conseguir limpar o cookie, mesmo
  // com uma sessão já expirada/inválida.
  const isPublicAdminApi =
    pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  const isAdminApi = pathname.startsWith("/api/admin") && !isPublicAdminApi;

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(NOME_COOKIE_SESSAO)?.value;
  const sessao = token ? await verificarSessionToken(token) : null;

  if (!sessao) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
