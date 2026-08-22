/**
 * Assinatura/verificação do JWT de sessão do admin — sem dependência de
 * `next/headers` nem `bcryptjs`, para poder ser importado tanto pelos Route
 * Handlers quanto pelo `proxy.ts` (que só tem acesso a `NextRequest.cookies`).
 */
import { SignJWT, jwtVerify } from "jose";

export const NOME_COOKIE_SESSAO = "zvizzer_admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 horas

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET não configurado. Defina no .env (veja .env.example)."
    );
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSessionPayload {
  sub: string; // AdminUser.id
  email: string;
}

export async function criarSessionToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verificarSessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
