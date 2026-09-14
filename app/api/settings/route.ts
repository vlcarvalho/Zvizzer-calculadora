import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Leitura pública (sem auth) dos parâmetros vigentes do processo Zvizzer —
 * usados pelo client para rodar o cálculo. Não expõe nenhum dado
 * administrativo além dos próprios parâmetros. A referência de horas/mês
 * (220h) é uma constante fixa do motor de cálculo, não vem do banco.
 */
export async function GET() {
  const zvizzer = await prisma.zvizzerSettings.findUnique({ where: { id: "default" } });

  if (!zvizzer) {
    return NextResponse.json(
      { error: "Parâmetros ainda não configurados. Rode o seed inicial." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    zvizzer: {
      compostoNome: zvizzer.compostoNome,
      compostoPreco: zvizzer.compostoPreco,
      compostoPesoG: zvizzer.compostoPesoG,
      compostoConsumoG: zvizzer.compostoConsumoG,
      boinaNome: zvizzer.boinaNome,
      boinaPreco: zvizzer.boinaPreco,
      boinaQuantidade: zvizzer.boinaQuantidade,
      boinaDurabilidadeCarros: zvizzer.boinaDurabilidadeCarros,
    },
  });
}
