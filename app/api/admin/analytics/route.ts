import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obterSessaoAdmin } from "@/lib/auth";

/**
 * Funil de conversão (spec §19): visitantes → iniciaram → concluíram →
 * clicaram no WhatsApp, com contagem de cliques por revendedor. O clique no
 * WhatsApp é a conversão final mensurável — não há confirmação de envio
 * real da mensagem (sem integração com a API do WhatsApp).
 */
export async function GET() {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const [totalVisitas, totalIniciaram, totalConcluiram, totalClicaramWhatsapp] =
    await Promise.all([
      prisma.analyticsSession.count(),
      prisma.analyticsEvent.groupBy({
        by: ["sessionId"],
        where: { eventName: "calculator_start" },
      }).then((r) => r.length),
      prisma.analyticsSession.count({ where: { completedCalculation: true } }),
      prisma.analyticsSession.count({ where: { whatsappClicked: true } }),
    ]);

  const cliquesPorRevendedorRaw = await prisma.analyticsEvent.groupBy({
    by: ["resellerId"],
    where: { eventName: "whatsapp_clicked", resellerId: { not: null } },
    _count: { resellerId: true },
  });

  const resellerIds = cliquesPorRevendedorRaw
    .map((c) => c.resellerId)
    .filter((id): id is string => Boolean(id));

  const resellers = await prisma.reseller.findMany({
    where: { id: { in: resellerIds } },
    select: { id: true, nome: true, cidade: true, estado: true },
  });
  const resellerMap = new Map(resellers.map((r) => [r.id, r]));

  const cliquesPorRevendedor = cliquesPorRevendedorRaw
    .map((c) => {
      const r = c.resellerId ? resellerMap.get(c.resellerId) : undefined;
      return {
        resellerId: c.resellerId,
        nome: r?.nome ?? "Revendedor removido",
        cidade: r?.cidade ?? "",
        estado: r?.estado ?? "",
        cliques: c._count.resellerId,
      };
    })
    .sort((a, b) => b.cliques - a.cliques);

  function percentual(parte: number, total: number): number {
    return total > 0 ? parte / total : 0;
  }

  return NextResponse.json({
    funil: {
      visitas: totalVisitas,
      iniciaram: totalIniciaram,
      concluiram: totalConcluiram,
      clicaramWhatsapp: totalClicaramWhatsapp,
      percentualIniciaram: percentual(totalIniciaram, totalVisitas),
      percentualConcluiram: percentual(totalConcluiram, totalVisitas),
      percentualClicaramWhatsapp: percentual(totalClicaramWhatsapp, totalVisitas),
    },
    cliquesPorRevendedor,
  });
}
