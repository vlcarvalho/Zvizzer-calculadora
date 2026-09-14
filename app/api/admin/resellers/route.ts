import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obterSessaoAdmin } from "@/lib/auth";
import { resellerSchema } from "@/lib/validation";
import { sanitizarWhatsapp } from "@/lib/whatsapp";
import { interpretarLogoEnviada } from "@/lib/logo-upload";

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

  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const { logoBase64, ...dados } = raw ?? {};

  const parsed = resellerSchema.safeParse(dados);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados do revendedor inválidos.", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const logo = interpretarLogoEnviada(logoBase64);
  if (!logo.ok) return NextResponse.json({ error: logo.erro }, { status: 400 });

  const reseller = await prisma.reseller.create({
    data: {
      ...parsed.data,
      whatsapp: sanitizarWhatsapp(parsed.data.whatsapp),
      ...(logo.logo ?? {}),
    },
  });

  // A URL da logo só existe depois que o registro ganha id.
  if (logo.logo) {
    await prisma.reseller.update({
      where: { id: reseller.id },
      data: { logoUrl: `/api/revendedores/${reseller.id}/logo` },
    });
  }

  return NextResponse.json({ reseller }, { status: 201 });
}

export async function PUT(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object" || !("id" in raw)) {
    return NextResponse.json({ error: "Informe o id do revendedor." }, { status: 400 });
  }
  const { id, logoBase64, ...rest } = raw as { id: string } & Record<string, unknown>;

  const parsed = resellerSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados do revendedor inválidos.", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const logo = interpretarLogoEnviada(logoBase64);
  if (!logo.ok) return NextResponse.json({ error: logo.erro }, { status: 400 });

  // logoBase64 ausente = manter a logo atual; string vazia = remover.
  const mudancaDeLogo = logo.logo
    ? { ...logo.logo, logoUrl: `/api/revendedores/${id}/logo` }
    : logoBase64 === ""
      ? { logoData: null, logoTipo: null, logoUrl: null }
      : {};

  const reseller = await prisma.reseller.update({
    where: { id },
    data: {
      ...parsed.data,
      whatsapp: sanitizarWhatsapp(parsed.data.whatsapp),
      ...mudancaDeLogo,
    },
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
