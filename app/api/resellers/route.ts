import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Lista pública de revendedores ativos (spec §16) — sem uso de CEP, sempre em ordem alfabética pelo nome da loja. */
export async function GET() {
  const resellers = await prisma.reseller.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      cidade: true,
      estado: true,
      whatsapp: true,
      logoUrl: true,
      latitude: true,
      longitude: true,
    },
  });

  // Ordena em JS (e não no banco): o collation do Postgres pode tratar
  // acentos e maiúsculas de um jeito que foge do alfabeto em português.
  resellers.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));

  return NextResponse.json({ resellers });
}
