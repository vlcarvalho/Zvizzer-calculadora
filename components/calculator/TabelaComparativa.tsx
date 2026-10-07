"use client";

import type { CalculatorResult } from "@/lib/calculations";
import { formatarHoras, formatarMoeda, formatarPercentual } from "@/lib/format";

interface TabelaComparativaProps {
  resultado: CalculatorResult;
}

/**
 * Custo do mesmo polimento hoje × com Zvizzer, por carro, com a diferença em
 * reais e em percentual de cada item. Usa o mesmo custo-hora nos dois lados
 * (spec §9), então a mão de obra só muda pelo tempo do processo.
 *
 * Diferença = Zvizzer − Atual: negativa (verde) é redução de custo; positiva
 * (vermelha) é custo maior. Nunca é escondida — um composto mais caro aparece
 * como tal, o ganho vem do conjunto.
 */
export function TabelaComparativa({ resultado }: TabelaComparativaProps) {
  const linhas = [
    {
      rotulo: "Compostos",
      atual: resultado.custoCompostosAtual,
      zvizzer: resultado.custoCompostoZvizzer,
    },
    {
      rotulo: "Boinas",
      atual: resultado.custoBoinasAtual,
      zvizzer: resultado.custoBoinaZvizzer,
    },
    {
      rotulo: "Mão de obra",
      detalhe: `${formatarMoeda(resultado.custoHoraEfetivo, true)}/h`,
      atual: resultado.custoMaoDeObraAtual,
      zvizzer: resultado.custoMaoDeObraZvizzer,
      horasAtual: resultado.horasAtuais,
      horasZvizzer: resultado.horasZvizzer,
    },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-accent/40 bg-accent/[0.06]">
      <header className="border-b border-accent/30 px-5 py-4">
        <h3 className="font-bold text-accent">Atual × Zvizzer</h3>
        <p className="mt-0.5 text-xs text-muted">
          Custo por polimento, com o mesmo custo-hora da sua operação
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] gap-x-2 border-b border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted sm:px-5">
        <span />
        <span className="text-right">Atual</span>
        <span className="text-right text-accent">Zvizzer</span>
        <span className="text-right">Diferença</span>
      </div>

      <div className="divide-y divide-border">
        {linhas.map((linha) => (
          <Linha
            key={linha.rotulo}
            rotulo={linha.rotulo}
            detalheRotulo={linha.detalhe}
            atual={linha.atual}
            zvizzer={linha.zvizzer}
            detalheAtual={linha.horasAtual !== undefined ? formatarHoras(linha.horasAtual) : undefined}
            detalheZvizzer={
              linha.horasZvizzer !== undefined ? formatarHoras(linha.horasZvizzer) : undefined
            }
          />
        ))}
      </div>

      <div className="border-t border-accent/30 bg-accent/10">
        <Linha
          total
          rotulo="Total por polimento"
          atual={resultado.custoOperacionalAtual}
          zvizzer={resultado.custoOperacionalZvizzer}
        />
      </div>
    </section>
  );
}

function Linha({
  rotulo,
  detalheRotulo,
  atual,
  zvizzer,
  detalheAtual,
  detalheZvizzer,
  total,
}: {
  rotulo: string;
  detalheRotulo?: string;
  atual: number;
  zvizzer: number;
  detalheAtual?: string;
  detalheZvizzer?: string;
  total?: boolean;
}) {
  const delta = zvizzer - atual;
  const reducao = delta < -0.005;
  const aumento = delta > 0.005;
  const sinal = reducao ? "−" : aumento ? "+" : "";
  const cor = reducao ? "text-accent" : aumento ? "text-danger" : "text-muted";
  const pct = atual > 0 ? formatarPercentual(Math.abs(delta) / atual, 0) : "—";

  return (
    <div className="grid grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] items-start gap-x-2 px-4 py-3 sm:px-5">
      <div>
        <p className={total ? "text-xs font-bold sm:text-sm" : "text-sm font-medium"}>{rotulo}</p>
        {detalheRotulo && <p className="mt-0.5 text-[10px] text-muted">{detalheRotulo}</p>}
      </div>

      <div className="text-right">
        <p className={`tabular-nums ${total ? "text-sm font-bold sm:text-base" : "text-sm"}`}>
          {formatarMoeda(atual, true)}
        </p>
        {detalheAtual && <p className="mt-0.5 text-[10px] text-muted">{detalheAtual}</p>}
      </div>

      <div className="text-right">
        <p className={`tabular-nums text-accent ${total ? "text-sm font-extrabold sm:text-base" : "text-sm font-semibold"}`}>
          {formatarMoeda(zvizzer, true)}
        </p>
        {detalheZvizzer && <p className="mt-0.5 text-[10px] text-muted">{detalheZvizzer}</p>}
      </div>

      <div className={`text-right ${cor}`}>
        <p className={`tabular-nums ${total ? "text-sm font-extrabold sm:text-base" : "text-sm font-semibold"}`}>
          {sinal}
          {formatarMoeda(Math.abs(delta), true)}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold tabular-nums">
          {sinal}
          {pct}
        </p>
      </div>
    </div>
  );
}
