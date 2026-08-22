"use client";

import { useCalculatorStore } from "@/lib/store/calculator-store";
import { Field } from "@/components/ui/Field";
import { NumericInput } from "@/components/ui/NumericInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";

interface StepCompostosProps {
  erros: Record<string, string>;
}

export function StepCompostos({ erros }: StepCompostosProps) {
  const { compostos, atualizarComposto, adicionarComposto, removerComposto } =
    useCalculatorStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Compostos utilizados</h2>
        <p className="mt-1 text-muted">
          Ex.: composto de corte + composto de lustro. Adicione quantos usar.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {compostos.map((composto, i) => (
          <div key={i} className="rounded-2xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted">
                Composto {i + 1} (opcional o nome)
              </span>
              {compostos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removerComposto(i)}
                  className="text-xs text-danger"
                >
                  Remover
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Nome ou marca (opcional)"
              value={composto.nome ?? ""}
              onChange={(e) => atualizarComposto(i, { nome: e.target.value })}
              className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
            <div className="flex flex-col gap-4">
              <Field label="Preço da embalagem" error={i === 0 ? erros.precoEmbalagem : undefined}>
                <CurrencyInput
                  value={composto.precoEmbalagem}
                  onChange={(v) => atualizarComposto(i, { precoEmbalagem: v })}
                />
              </Field>
              <Field
                label="Quantidade da embalagem (gramas)"
                error={i === 0 ? erros.quantidadeEmbalagemG : undefined}
              >
                <NumericInput
                  value={composto.quantidadeEmbalagemG || ""}
                  onChange={(v) => atualizarComposto(i, { quantidadeEmbalagemG: v })}
                  suffix="g"
                />
              </Field>
              <Field
                label="Consumo médio por carro (gramas)"
                error={i === 0 ? erros.consumoCarroG : undefined}
              >
                <NumericInput
                  value={composto.consumoCarroG || ""}
                  onChange={(v) => atualizarComposto(i, { consumoCarroG: v })}
                  suffix="g"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={adicionarComposto}>
        + Adicionar composto
      </Button>
    </div>
  );
}
