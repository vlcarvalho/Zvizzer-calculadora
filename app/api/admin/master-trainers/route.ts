import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obterSessaoAdmin } from "@/lib/auth";
import { masterTrainerSchema } from "@/lib/validation";

/** CRUD dos Master Trainers. Sem rotas dinâmicas: update/delete recebem o
 * `id` no corpo da requisição, como no CRUD de revendedores. */

export async function GET() {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const trainers = await prisma.masterTrainer.findMany({
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
  return NextResponse.json({ trainers });
}

export async function POST(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const parsed = masterTrainerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const trainer = await prisma.masterTrainer.create({ data: parsed.data });
  return NextResponse.json({ trainer }, { status: 201 });
}

export async function PUT(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object" || !("id" in raw)) {
    return NextResponse.json({ error: "Informe o id do Master Trainer." }, { status: 400 });
  }
  const { id, ...rest } = raw as { id: string } & Record<string, unknown>;

  const parsed = masterTrainerSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const trainer = await prisma.masterTrainer.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ trainer });
}

export async function DELETE(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object" || !("id" in raw)) {
    return NextResponse.json({ error: "Informe o id do Master Trainer." }, { status: 400 });
  }
  const { id } = raw as { id: string };

  await prisma.masterTrainer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
