import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  NOME_COOKIE_SESSAO,
  SESSION_DURATION_SECONDS,
  criarSessionToken,
  verificarSessionToken,
  type AdminSessionPayload,
} from "./session";

export { criarSessionToken, verificarSessionToken, type AdminSessionPayload };

/** Define o cookie httpOnly de sessão do admin (uso em Route Handlers). */
export async function definirCookieSessao(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(NOME_COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function limparCookieSessao() {
  const cookieStore = await cookies();
  cookieStore.delete(NOME_COOKIE_SESSAO);
}

/** Lê e valida a sessão do admin a partir dos cookies da requisição atual. */
export async function obterSessaoAdmin(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOME_COOKIE_SESSAO)?.value;
  if (!token) return null;
  return verificarSessionToken(token);
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
