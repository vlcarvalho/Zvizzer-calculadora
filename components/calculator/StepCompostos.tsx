"use client";

import { useCalculatorStore } from "@/lib/store/calculator-store";
import type { ErrosPorItem } from "@/lib/step-validation";
import { OPCOES_CONSUMO_G, OPCOES_EMBALAGEM_G } from "@/lib/opcoes";
import { Field } from "@/components/ui/Field";
import { SelectInput } from "@/components/ui/SelectInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";

interface StepCompostosProps {
  erros: ErrosPorItem;
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
        {compostos.map((composto, i) => {
          const errosItem = erros[i] ?? {};
          return (
            <div key={i} className="rounded-2xl border border-border p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">Composto {i + 1}</span>
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

              <div className="flex flex-col gap-4">
                <Field label="Nome ou marca do composto" error={errosItem.nome}>
                  <TextInput
                    value={composto.nome ?? ""}
                    onChange={(v) => atualizarComposto(i, { nome: v })}
                    placeholder="Ex.: Composto de corte"
                  />
                </Field>

                <Field label="Preço do produto" error={errosItem.precoEmbalagem}>
                  <CurrencyInput
                    value={composto.precoEmbalagem}
                    onChange={(v) => atualizarComposto(i, { precoEmbalagem: v })}
                  />
                </Field>

                <Field
                  label="Quantidade da embalagem"
                  error={errosItem.quantidadeEmbalagemG}
                >
                  <SelectInput
                    value={composto.quantidadeEmbalagemG}
                    onChange={(v) => atualizarComposto(i, { quantidadeEmbalagemG: v })}
                    opcoes={OPCOES_EMBALAGEM_G}
                    placeholder="Selecione a embalagem"
                  />
                </Field>

                <Field label="Consumo médio por carro" error={errosItem.consumoCarroG}>
                  <SelectInput
                    value={composto.consumoCarroG}
                    onChange={(v) => atualizarComposto(i, { consumoCarroG: v })}
                    opcoes={OPCOES_CONSUMO_G}
                    placeholder="Selecione o consumo"
                  />
                </Field>
              </div>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="secondary" onClick={adicionarComposto}>
        + Adicionar composto
      </Button>
    </div>
  );
}
