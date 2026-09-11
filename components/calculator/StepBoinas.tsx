"use client";

import clsx from "clsx";
import { useCalculatorStore } from "@/lib/store/calculator-store";
import type { ErrosPorItem } from "@/lib/step-validation";
import {
  OPCOES_CARROS_ATE_TROCA,
  OPCOES_QUANTIDADE_BOINAS,
  TIPOS_BOINA,
} from "@/lib/opcoes";
import { Field } from "@/components/ui/Field";
import { SelectInput } from "@/components/ui/SelectInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";

interface StepBoinasProps {
  erros: ErrosPorItem;
}

export function StepBoinas({ erros }: StepBoinasProps) {
  const { boinas, atualizarBoina, adicionarBoina, removerBoina } = useCalculatorStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Boinas utilizadas</h2>
        <p className="mt-1 text-muted">
          Cadastre cada boina que entra no seu processo de polimento.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {boinas.map((boina, i) => {
          const errosItem = erros[i] ?? {};
          return (
            <div key={i} className="rounded-2xl border border-border p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">Boina {i + 1}</span>
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

              <div className="flex flex-col gap-4">
                <Field label="Tipo da boina" error={errosItem.tipo}>
                  <div className="grid grid-cols-2 gap-2">
                    {TIPOS_BOINA.map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => atualizarBoina(i, { tipo })}
                        className={clsx(
                          "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                          boina.tipo === tipo
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border bg-surface text-muted hover:border-chrome-2"
                        )}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Nome ou marca da boina" error={errosItem.nome}>
                  <TextInput
                    value={boina.nome ?? ""}
                    onChange={(v) => atualizarBoina(i, { nome: v })}
                    placeholder="Ex.: Boina de corte 5 pol."
                  />
                </Field>

                <Field
                  label="Quantidade de boinas em revezamento"
                  error={errosItem.quantidade}
                >
                  <SelectInput
                    value={boina.quantidade}
                    onChange={(v) => atualizarBoina(i, { quantidade: v })}
                    opcoes={OPCOES_QUANTIDADE_BOINAS}
                    placeholder="Selecione a quantidade"
                  />
                </Field>

                <Field label="Preço de cada boina" error={errosItem.precoUnitario}>
                  <CurrencyInput
                    value={boina.precoUnitario}
                    onChange={(v) => atualizarBoina(i, { precoUnitario: v })}
                  />
                </Field>

                <Field
                  label="Quantos carros até a troca?"
                  error={errosItem.durabilidadeCarros}
                >
                  <SelectInput
                    value={boina.durabilidadeCarros}
                    onChange={(v) => atualizarBoina(i, { durabilidadeCarros: v })}
                    opcoes={OPCOES_CARROS_ATE_TROCA}
                    placeholder="Selecione a durabilidade"
                  />
                </Field>
              </div>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="secondary" onClick={adicionarBoina}>
        + Adicionar boina
      </Button>
    </div>
  );
}
