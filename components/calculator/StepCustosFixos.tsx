"use client";

import { useCalculatorStore } from "@/lib/store/calculator-store";
import { custoFixoMensalTotal, custoHoraOperacao, HORAS_BASE_MENSAIS } from "@/lib/calculations";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { Field } from "@/components/ui/Field";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

interface StepCustosFixosProps {
  erros: Record<string, string>;
}

export function StepCustosFixos({ erros }: StepCustosFixosProps) {
  const { custosFixos, setCustosFixos } = useCalculatorStore();

  const total = custoFixoMensalTotal(custosFixos);
  const custoHora = custoHoraOperacao(custosFixos);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Custos fixos da operação</h2>
        <p className="mt-1 text-muted">
          É o que sua estrutura custa todo mês, independentemente de quantos carros entram.
        </p>
      </div>

      <Field label="Salário / pró-labore" error={erros.salarioProLabore}>
        <CurrencyInput
          value={custosFixos.salarioProLabore}
          onChange={(v) => setCustosFixos({ salarioProLabore: v })}
        />
      </Field>

      <Field label="Aluguel" hint="Se não paga aluguel, deixe zerado." error={erros.aluguel}>
        <CurrencyInput
          value={custosFixos.aluguel}
          onChange={(v) => setCustosFixos({ aluguel: v })}
        />
      </Field>

      <Field
        label="Custo com funcionários"
        hint="Salários + encargos + benefícios de quem trabalha com você."
        error={erros.custoFuncionarios}
      >
        <CurrencyInput
          value={custosFixos.custoFuncionarios}
          onChange={(v) => setCustosFixos({ custoFuncionarios: v })}
        />
      </Field>

      <Field
        label="Demais despesas"
        hint="Energia, água, internet, contabilidade etc."
        error={erros.demaisDespesas}
      >
        <CurrencyInput
          value={custosFixos.demaisDespesas}
          onChange={(v) => setCustosFixos({ demaisDespesas: v })}
        />
      </Field>

      {total > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">Custo fixo mensal</span>
            <span className="text-lg font-bold tabular-nums">{formatarMoeda(total)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
            <span className="text-sm text-muted">
              Custo por hora trabalhada
              <span className="ml-1 text-xs">
                (÷ {formatarNumero(HORAS_BASE_MENSAIS)}h/mês)
              </span>
            </span>
            <span className="text-lg font-bold tabular-nums text-accent">
              {formatarMoeda(custoHora, true)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
