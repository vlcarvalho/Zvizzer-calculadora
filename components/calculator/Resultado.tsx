"use client";

import type { BoinaInput, CalculatorResult, CompostoInput } from "@/lib/calculations";
import type { ZvizzerDisplaySettings } from "@/lib/hooks/use-settings";
import { formatarHoras, formatarMoeda } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { ComparativoProdutos } from "@/components/calculator/ComparativoProdutos";

interface ResultadoProps {
  resultado: CalculatorResult;
  polimentosMes: number;
  compostosUsuario: CompostoInput[];
  boinasUsuario: BoinaInput[];
  zvizzerSettings: ZvizzerDisplaySettings;
  onVerRevendedores: () => void;
  onNovoCalculo: () => void;
}

export function Resultado({
  resultado,
  polimentosMes,
  compostosUsuario,
  boinasUsuario,
  zvizzerSettings,
  onVerRevendedores,
  onNovoCalculo,
}: ResultadoProps) {
  const economiaNegativa = resultado.economiaMensal < 0;

  return (
    <div className="flex flex-col gap-8">
      {/* SEU POTENCIAL */}
      <div className="rounded-3xl border border-accent/30 bg-gradient-to-b from-accent/10 to-transparent p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          Seu potencial
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 text-left sm:grid-cols-3">
          <MetricaGrande
            label={economiaNegativa ? "Diferença de custo operacional" : "Economia operacional"}
            valor={formatarMoeda(resultado.economiaMensal)}
            sufixo="/mês"
            destaque={!economiaNegativa}
          />
          <MetricaGrande
            label="Horas liberadas"
            valor={formatarHoras(resultado.horasLiberadasMes)}
            sufixo="/mês"
          />
          <MetricaGrande
            label="Capacidade potencial de faturamento"
            valor={formatarMoeda(resultado.capacidadeFaturamento)}
            sufixo="/mês"
          />
        </div>

        <div className="mt-8 border-t border-accent/20 pt-6">
          <p className="text-sm text-muted">Impacto econômico potencial</p>
          <p className="mt-1 text-4xl font-black tabular-nums text-accent sm:text-5xl">
            {formatarMoeda(resultado.impactoEconomicoPotencial)}
            <span className="text-lg font-medium text-muted">/mês</span>
          </p>
        </div>

        {resultado.horasLiberadasMes > 0 && (
          <p className="mt-4 text-sm text-muted">
            Você poderia liberar {formatarHoras(resultado.horasLiberadasMes)} da sua agenda
            todos os meses sem aumentar sua carga horária.
          </p>
        )}
      </div>

      {/* Comparativo visual */}
      <div>
        <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-muted">
          Comparativo
        </h3>
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CardComparativo
            titulo="Seu processo atual"
            custoPorPolimento={resultado.custoOperacionalAtual}
            tempo={resultado.horasAtuais}
            custoMensal={resultado.custoOperacionalMensalAtual}
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted sm:block">
            VS
          </div>
          <CardComparativo
            titulo="Processo Zvizzer"
            custoPorPolimento={resultado.custoOperacionalZvizzer}
            tempo={resultado.horasZvizzer}
            custoMensal={resultado.custoOperacionalMensalZvizzer}
            nota={
              resultado.numeroPessoas > 1
                ? `Tempo dividido entre ${resultado.numeroPessoas} pessoas trabalhando juntas`
                : undefined
            }
            destaque
          />
        </div>
      </div>

      <ComparativoProdutos
        compostosUsuario={compostosUsuario}
        boinasUsuario={boinasUsuario}
        zvizzer={zvizzerSettings}
      />

      <p className="text-center text-xs leading-relaxed text-muted">
        As horas liberadas podem ser utilizadas para novos polimentos, outros serviços,
        gestão da empresa ou redução da carga de trabalho. A capacidade de faturamento é uma
        estimativa de valor comercial das horas liberadas, não um faturamento garantido.
        {polimentosMes > 0 && ` Cálculo baseado em ${polimentosMes} polimentos/mês.`}
      </p>

      <div className="flex flex-col gap-3">
        <Button onClick={onVerRevendedores}>Encontrar um revendedor Zvizzer</Button>
        <button
          type="button"
          onClick={onNovoCalculo}
          className="text-center text-sm text-muted underline underline-offset-4"
        >
          Fazer novo cálculo
        </button>
      </div>
    </div>
  );
}

function MetricaGrande({
  label,
  valor,
  sufixo,
  destaque,
}: {
  label: string;
  valor: string;
  sufixo?: string;
  destaque?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold tabular-nums ${
          destaque ? "text-accent" : "text-foreground"
        }`}
      >
        {valor}
        {sufixo && <span className="text-sm font-medium text-muted">{sufixo}</span>}
      </p>
    </div>
  );
}

function CardComparativo({
  titulo,
  custoPorPolimento,
  tempo,
  custoMensal,
  nota,
  destaque,
}: {
  titulo: string;
  custoPorPolimento: number;
  tempo: number;
  custoMensal: number;
  nota?: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        destaque ? "border-accent/40 bg-accent/5" : "border-border bg-surface"
      }`}
    >
      <p className="text-sm font-semibold text-muted">{titulo}</p>
      <dl className="mt-4 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <dt className="text-xs text-muted">Custo por polimento</dt>
          <dd className="text-lg font-bold tabular-nums">{formatarMoeda(custoPorPolimento, true)}</dd>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <dt className="text-xs text-muted">Tempo por polimento</dt>
            <dd className="text-lg font-bold tabular-nums">{formatarHoras(tempo)}</dd>
          </div>
          {nota && <p className="mt-0.5 text-right text-[11px] text-muted">{nota}</p>}
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-xs text-muted">Custo mensal</dt>
          <dd className="text-lg font-bold tabular-nums">{formatarMoeda(custoMensal)}</dd>
        </div>
      </dl>
    </div>
  );
}
