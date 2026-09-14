import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Lista pública de revendedores ativos (spec §16) — sem uso de CEP. */
export async function GET() {
  const resellers = await prisma.reseller.findMany({
    where: { ativo: true },
    orderBy: [{ estado: "asc" }, { cidade: "asc" }, { nome: "asc" }],
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

  return NextResponse.json({ resellers });
}
