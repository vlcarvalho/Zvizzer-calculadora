"use client";

import { useCalculatorStore } from "@/lib/store/calculator-store";
import { Field } from "@/components/ui/Field";
import { NumericInput } from "@/components/ui/NumericInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { HoursInput } from "@/components/ui/HoursInput";

interface StepVolumeProps {
  erros: Record<string, string>;
}

export function StepVolume({ erros }: StepVolumeProps) {
  const { volumePreco, setVolumePreco } = useCalculatorStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Volume e preço</h2>
        <p className="mt-1 text-muted">Vamos começar pelo básico da sua operação hoje.</p>
      </div>

      <Field
        label="Quantos polimentos você realiza por mês?"
        error={erros.polimentosMes}
      >
        <NumericInput
          value={volumePreco.polimentosMes || ""}
          onChange={(v) => setVolumePreco({ polimentosMes: v })}
          placeholder="Ex.: 20"
          suffix="polimentos"
          autoFocus
        />
      </Field>

      <Field
        label="Quanto você cobra, em média, por polimento?"
        error={erros.precoMedioPolimento}
      >
        <CurrencyInput
          value={volumePreco.precoMedioPolimento}
          onChange={(v) => setVolumePreco({ precoMedioPolimento: v })}
        />
      </Field>

      <Field
        label="Quanto tempo você leva atualmente para realizar o polimento de um carro?"
        hint="Ex.: 5 horas, ou 5h30"
        error={erros.horasAtuais}
      >
        <HoursInput
          horas={volumePreco.horas}
          minutos={volumePreco.minutos}
          onChange={(horas, minutos) => setVolumePreco({ horas, minutos })}
        />
      </Field>
    </div>
  );
}
