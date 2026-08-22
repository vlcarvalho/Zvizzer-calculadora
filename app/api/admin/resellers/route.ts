import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obterSessaoAdmin } from "@/lib/auth";
import { resellerSchema } from "@/lib/validation";
import { sanitizarWhatsapp } from "@/lib/whatsapp";

/** CRUD de revendedores (spec §20/§21). Sem rotas dinâmicas: update/delete
 * recebem o `id` no corpo da requisição para manter o roteamento simples. */

export async function GET() {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const resellers = await prisma.reseller.findMany({
    orderBy: [{ estado: "asc" }, { cidade: "asc" }, { nome: "asc" }],
  });
  return NextResponse.json({ resellers });
}

export async function POST(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const raw = await request.json().catch(() => null);
  const parsed = resellerSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados do revendedor inválidos.", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const reseller = await prisma.reseller.create({
    data: { ...parsed.data, whatsapp: sanitizarWhatsapp(parsed.data.whatsapp) },
  });

  return NextResponse.json({ reseller }, { status: 201 });
}

export async function PUT(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object" || !("id" in raw)) {
    return NextResponse.json({ error: "Informe o id do revendedor." }, { status: 400 });
  }
  const { id, ...rest } = raw as { id: string } & Record<string, unknown>;

  const parsed = resellerSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados do revendedor inválidos.", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const reseller = await prisma.reseller.update({
    where: { id },
    data: { ...parsed.data, whatsapp: sanitizarWhatsapp(parsed.data.whatsapp) },
  });

  return NextResponse.json({ reseller });
}

export async function DELETE(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object" || !("id" in raw)) {
    return NextResponse.json({ error: "Informe o id do revendedor." }, { status: 400 });
  }
  const { id } = raw as { id: string };

  await prisma.reseller.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
