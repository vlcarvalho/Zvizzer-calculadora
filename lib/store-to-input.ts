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
    // Duração real do processo daquela equipe — nunca dividida pela
    // quantidade de profissionais informada na Etapa 1 (armazenada à parte,
    // sem entrar em nenhuma fórmula de tempo: ver lib/calculations.ts).
    horasAtuais: store.volumePreco.horas,
    custosFixos: store.custosFixos,
    compostos: store.compostos,
    boinas: store.boinas,
  };
}
