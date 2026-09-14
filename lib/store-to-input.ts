import type {
  BoinaInput,
  CalculatorInput,
  CompostoInput,
  CustosFixosInput,
} from "@/lib/calculations";
import type { VolumePrecoState } from "@/lib/store/calculator-store";

export function converterParaCalculatorInput(store: {
  volumePreco: VolumePrecoState;
  custosFixos: CustosFixosInput;
  compostos: CompostoInput[];
  boinas: BoinaInput[];
}): CalculatorInput {
  return {
    polimentosMes: store.volumePreco.polimentosMes,
    precoMedioPolimento: store.volumePreco.precoMedioPolimento,
    horasAtuais: store.volumePreco.horas,
    // Mais gente polindo junto = tempo de parede menor no processo Zvizzer.
    numeroPessoasPolimento: store.volumePreco.profissionaisSimultaneos,
    custosFixos: store.custosFixos,
    compostos: store.compostos,
    boinas: store.boinas,
  };
}
