"use client";

import type { BoinaInput, CalculatorResult, CompostoInput } from "@/lib/calculations";
import type { ZvizzerDisplaySettings } from "@/lib/hooks/use-settings";
import { formatarHoras, formatarNumero } from "@/lib/format";

interface ComoChegamosProps {
  resultado: CalculatorResult;
  compostosUsuario: CompostoInput[];
  boinasUsuario: BoinaInput[];
  zvizzer: ZvizzerDisplaySettings;
}

/**
 * O "por quê" do número: compara quantidades (compostos, boinas e horas) e
 * explica a tecnologia por trás da diferença. Sem isso o resultado parece
 * marketing; com isso o usuário reconstrói a conta na cabeça dele.
 */
export function ComoChegamos({
  resultado,
  compostosUsuario,
  boinasUsuario,
  zvizzer,
}: ComoChegamosProps) {
  const compostosAtual = compostosUsuario.length;
  const boinasAtual = boinasUsuario.reduce((soma, b) => soma + b.quantidade, 0);

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-border bg-surface/60 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Como chegamos nesse custo
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug">
          No lugar de {formatarNumero(compostosAtual)}{" "}
          {compostosAtual === 1 ? "composto" : "compostos"}, {formatarNumero(boinasAtual)}{" "}
          {boinasAtual === 1 ? "boina" : "boinas"} e {formatarHoras(resultado.horasAtuais)}, com
          Zvizzer você precisa de{" "}
          <span className="text-accent">
            1 composto, {formatarNumero(zvizzer.boinaQuantidade)}{" "}
            {zvizzer.boinaQuantidade === 1 ? "boina" : "boinas"} e{" "}
            {formatarHoras(resultado.horasZvizzer)}
          </span>
          .
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Comparacao rotulo="Compostos" antes={formatarNumero(compostosAtual)} depois="1" />
        <Comparacao
          rotulo="Boinas"
          antes={formatarNumero(boinasAtual)}
          depois={formatarNumero(zvizzer.boinaQuantidade)}
        />
        <Comparacao
          rotulo="Tempo"
          antes={formatarHoras(resultado.horasAtuais)}
          depois={formatarHoras(resultado.horasZvizzer)}
        />
      </div>

      <div className="rounded-2xl border border-accent/25 bg-accent/[0.06] p-4">
        <p className="mb-1 text-sm font-semibold">Como isso é possível?</p>
        <p className="text-sm leading-relaxed text-muted">
          Abrasivos homogêneos de alta qualidade somados à boina com tecnologia patenteada e
          exclusiva <strong className="text-foreground">Thermopad</strong>, que reduz a
          dissipação de calor. Juntos, permitem fazer{" "}
          <strong className="text-foreground">mais de 90% dos polimentos em uma única etapa</strong>{" "}
          — de verdade.
        </p>
      </div>
    </section>
  );
}

function Comparacao({
  rotulo,
  antes,
  depois,
}: {
  rotulo: string;
  antes: string;
  depois: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 px-2 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted">{rotulo}</p>
      <p className="mt-1 text-sm text-muted line-through decoration-danger/70">{antes}</p>
      <p className="text-lg font-extrabold tabular-nums text-accent">{depois}</p>
    </div>
  );
}
