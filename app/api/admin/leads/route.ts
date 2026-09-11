import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obterSessaoAdmin } from "@/lib/auth";

/** Contatos deixados na calculadora, do mais recente para o mais antigo. */
export async function GET() {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ leads });
}

export async function DELETE(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object" || !("id" in raw)) {
    return NextResponse.json({ error: "Informe o id do contato." }, { status: 400 });
  }
  const { id } = raw as { id: string };

  // Exclusão sob demanda: o titular pode pedir a remoção dos dados (LGPD).
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
