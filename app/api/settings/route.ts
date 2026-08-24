import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Leitura pública (sem auth) dos parâmetros vigentes do processo Zvizzer e
 * de mão de obra — usados pelo client para rodar o cálculo. Não expõe
 * nenhum dado administrativo além dos próprios parâmetros.
 */
export async function GET() {
  const [zvizzer, labor] = await Promise.all([
    prisma.zvizzerSettings.findUnique({ where: { id: "default" } }),
    prisma.laborSettings.findUnique({ where: { id: "default" } }),
  ]);

  if (!zvizzer || !labor) {
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
      tempoProcessoMinutos: zvizzer.tempoProcessoMinutos,
    },
    labor: {
      encargosPatronaisPct: labor.encargosPatronaisPct,
      fgtsPct: labor.fgtsPct,
      decimoTerceiroPct: labor.decimoTerceiroPct,
      feriasPct: labor.feriasPct,
      adicionalFeriasPct: labor.adicionalFeriasPct,
      outrosEncargosPct: labor.outrosEncargosPct,
      horasBaseMensalEmpresa: labor.horasBaseMensalEmpresa,
    },
  });
}
