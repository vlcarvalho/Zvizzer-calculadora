"use client";

import { useCalculatorStore } from "@/lib/store/calculator-store";
import { Field } from "@/components/ui/Field";
import { SelectInput } from "@/components/ui/SelectInput";
import {
  OPCOES_HORAS_POLIMENTO,
  OPCOES_POLIMENTOS_MES,
  OPCOES_PRECO_POLIMENTO,
} from "@/lib/opcoes";

interface StepVolumeProps {
  erros: Record<string, string>;
}

export function StepVolume({ erros }: StepVolumeProps) {
  const { volumePreco, setVolumePreco } = useCalculatorStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Sua operação hoje</h2>
        <p className="mt-1 text-muted">Comece pelo volume e pelo preço do seu polimento.</p>
      </div>

      <Field
        label="Quantos polimentos você realiza por mês em média?"
        error={erros.polimentosMes}
      >
        <SelectInput
          value={volumePreco.polimentosMes}
          onChange={(v) => setVolumePreco({ polimentosMes: v })}
          opcoes={OPCOES_POLIMENTOS_MES}
          placeholder="Selecione a quantidade"
        />
      </Field>

      <Field
        label="Quanto você cobra, em média, por polimento?"
        error={erros.precoMedioPolimento}
      >
        <SelectInput
          value={volumePreco.precoMedioPolimento}
          onChange={(v) => setVolumePreco({ precoMedioPolimento: v })}
          opcoes={OPCOES_PRECO_POLIMENTO}
          placeholder="Selecione o valor"
        />
      </Field>

      <Field
        label="Quanto tempo você leva atualmente para realizar o polimento de um carro?"
        error={erros.horasAtuais}
      >
        <SelectInput
          value={volumePreco.horas}
          onChange={(v) => setVolumePreco({ horas: v })}
          opcoes={OPCOES_HORAS_POLIMENTO}
          placeholder="Selecione o tempo"
        />
      </Field>
    </div>
  );
}
