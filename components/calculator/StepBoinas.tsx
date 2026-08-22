"use client";

import { useCalculatorStore } from "@/lib/store/calculator-store";
import { Field } from "@/components/ui/Field";
import { NumericInput } from "@/components/ui/NumericInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";

interface StepBoinasProps {
  erros: Record<string, string>;
}

export function StepBoinas({ erros }: StepBoinasProps) {
  const { boinas, atualizarBoina, adicionarBoina, removerBoina } = useCalculatorStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Boinas</h2>
        <p className="mt-1 text-muted">
          Conjuntos de boinas usados em revezamento até a substituição.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {boinas.map((boina, i) => (
          <div key={i} className="rounded-2xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted">
                Conjunto {i + 1} (opcional o nome)
              </span>
              {boinas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removerBoina(i)}
                  className="text-xs text-danger"
                >
                  Remover
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Tipo/nome da boina (opcional)"
              value={boina.nome ?? ""}
              onChange={(e) => atualizarBoina(i, { nome: e.target.value })}
              className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
            <div className="flex flex-col gap-4">
              <Field
                label="Quantidade de boinas em revezamento"
                error={i === 0 ? erros.quantidade : undefined}
              >
                <NumericInput
                  value={boina.quantidade || ""}
                  onChange={(v) => atualizarBoina(i, { quantidade: v })}
                />
              </Field>
              <Field label="Preço de cada boina" error={i === 0 ? erros.precoUnitario : undefined}>
                <CurrencyInput
                  value={boina.precoUnitario}
                  onChange={(v) => atualizarBoina(i, { precoUnitario: v })}
                />
              </Field>
              <Field
                label="Quantos carros esse conjunto atende antes da troca?"
                error={i === 0 ? erros.durabilidadeCarros : undefined}
              >
                <NumericInput
                  value={boina.durabilidadeCarros || ""}
                  onChange={(v) => atualizarBoina(i, { durabilidadeCarros: v })}
                  suffix="carros"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={adicionarBoina}>
        + Adicionar conjunto de boinas
      </Button>
    </div>
  );
}
