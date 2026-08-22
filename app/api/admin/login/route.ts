import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { criarSessionToken, definirCookieSessao, verificarSenha } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { excedeuLimite, obterIpRequisicao } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = obterIpRequisicao(request);
  if (excedeuLimite(`login:${ip}`)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
      { status: 429 }
    );
  }

  const raw = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Informe e-mail e senha válidos." },
      { status: 400 }
    );
  }

  const { email, senha } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    // Mensagem genérica de propósito — não revela se o e-mail existe.
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const senhaValida = await verificarSenha(senha, admin.passwordHash);
  if (!senhaValida) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const token = await criarSessionToken({ sub: admin.id, email: admin.email });
  await definirCookieSessao(token);

  return NextResponse.json({ ok: true });
}
