import { prisma } from "@/lib/db";
import { obterSessaoAdmin } from "@/lib/auth";

/**
 * Exporta todos os contatos em CSV pensado para abrir direto no Excel em
 * português: separador `;`, números com vírgula decimal e BOM UTF-8 (sem ele
 * o Excel estraga os acentos).
 */

const COLUNAS = [
  "Data do contato",
  "E-mail",
  "WhatsApp",
  "Polimentos/mês",
  "Custo atual por carro (R$)",
  "Custo Zvizzer por carro (R$)",
  "Economia mensal (R$)",
  "Horas liberadas/mês",
  "Data do consentimento",
  "Versão da política",
] as const;

function numero(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}

function dataHora(data: Date): string {
  return data.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

/** Escapa a célula e neutraliza "injeção de fórmula": e-mail e WhatsApp vêm
 * do público, e uma célula começando com = + - @ seria executada pelo Excel. */
function celula(valor: string): string {
  const seguro = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
  return `"${seguro.replace(/"/g, '""')}"`;
}

export async function GET() {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return Response.json({ error: "Não autenticado." }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const linhas = leads.map((lead) =>
    [
      dataHora(lead.createdAt),
      lead.email,
      lead.whatsapp,
      String(lead.polimentosMes),
      numero(lead.custoAtualPorCarro),
      numero(lead.custoZvizzerPorCarro),
      numero(lead.economiaMensal),
      numero(lead.horasLiberadasMes),
      lead.politicaVersao === "pre-consentimento" ? "sem registro" : dataHora(lead.consentimentoEm),
      lead.politicaVersao,
    ]
      .map(celula)
      .join(";")
  );

  const csv = "﻿" + [COLUNAS.map(celula).join(";"), ...linhas].join("\r\n");
  const dia = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contatos-${dia}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
