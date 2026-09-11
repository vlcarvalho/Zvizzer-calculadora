import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Lista pública dos Master Trainers ativos, na ordem definida no admin. */
export async function GET() {
  const trainers = await prisma.masterTrainer.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    select: { id: true, nome: true, fotoUrl: true, miniCv: true },
  });

  return NextResponse.json({ trainers });
}
