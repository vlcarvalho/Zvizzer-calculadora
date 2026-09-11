"use client";

import type { CalculatorResult } from "@/lib/calculations";
import { formatarHoras, formatarMoeda } from "@/lib/format";

interface GatilhoEconomiaProps {
  resultado: CalculatorResult;
}

/**
 * Ponte entre o custo atual e o custo Zvizzer. Só promete o que o cálculo
 * daquela pessoa realmente mostra: se não houver ganho de custo ou de tempo,
 * o texto muda em vez de prometer economia que não existe.
 */
export function GatilhoEconomia({ resultado }: GatilhoEconomiaProps) {
  const temEconomia = resultado.economiaMensal > 0;
  const temHoras = resultado.horasLiberadasMes > 0;

  if (!temEconomia && !temHoras) {
    return (
      <section className="rounded-3xl border border-border bg-surface/60 p-6 text-center">
        <h3 className="text-xl font-bold">Sua operação já está enxuta.</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Pelos números que você informou, seu processo atual já está bem ajustado. Veja abaixo
          como fica o mesmo polimento com a tecnologia alemã Zvizzer e compare você mesmo — sem
          promessa, só conta.
        </p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/[0.12] to-transparent p-6 text-center">
      <span className="text-3xl" aria-hidden>
        ⚠️
      </span>
      <h3 className="mt-2 text-2xl font-black leading-tight">
        Calma, nem tudo está perdido!
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Veja abaixo o custo do mesmo polimento com a tecnologia alemã Zvizzer. Com ela, sua
        operação pode:
      </p>

      <ul className="mt-5 flex flex-col gap-3 text-left">
        {temEconomia && (
          <LinhaGanho
            valor={`${formatarMoeda(resultado.economiaMensal)}/mês`}
            texto="de economia no custo operacional"
          />
        )}
        {temHoras && (
          <LinhaGanho
            valor={`${formatarHoras(resultado.horasLiberadasMes)}/mês`}
            texto="liberadas na sua agenda"
          />
        )}
        {resultado.capacidadeFaturamento > 0 && (
          <LinhaGanho
            valor={`${formatarMoeda(resultado.capacidadeFaturamento)}/mês`}
            texto="de potencial de faturamento com essas horas — ou trabalhar menos pelo mesmo faturamento"
          />
        )}
      </ul>
    </section>
  );
}

function LinhaGanho({ valor, texto }: { valor: string; texto: string }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-border bg-surface/70 px-4 py-3">
      <span className="mt-0.5 text-accent" aria-hidden>
        ✓
      </span>
      <span className="text-sm leading-snug">
        <strong className="block text-lg font-extrabold tabular-nums text-accent">{valor}</strong>
        <span className="text-muted">{texto}</span>
      </span>
    </li>
  );
}
