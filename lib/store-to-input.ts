import type { CalculatorInput } from "@/lib/calculations";
import type { VolumePrecoState } from "@/lib/store/calculator-store";
import { horasEMinutosParaDecimal } from "@/lib/format";
import type { BoinaInput, CompostoInput, MembroInput } from "@/lib/calculations";

export function converterParaCalculatorInput(store: {
  volumePreco: VolumePrecoState;
  membros: MembroInput[];
  compostos: CompostoInput[];
  boinas: BoinaInput[];
}): CalculatorInput {
  return {
    polimentosMes: store.volumePreco.polimentosMes,
    precoMedioPolimento: store.volumePreco.precoMedioPolimento,
    horasAtuais: horasEMinutosParaDecimal(store.volumePreco.horas, store.volumePreco.minutos),
    equipe: store.membros,
    compostos: store.compostos,
    boinas: store.boinas,
  };
}
