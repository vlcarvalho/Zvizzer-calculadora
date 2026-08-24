import type { CalculatorInput } from "@/lib/calculations";
import type { TipoMaoDeObra, VolumePrecoState } from "@/lib/store/calculator-store";
import type { BoinaInput, CompostoInput, MembroInput } from "@/lib/calculations";

export function converterParaCalculatorInput(store: {
  volumePreco: VolumePrecoState;
  tipoMaoDeObra: TipoMaoDeObra;
  membros: MembroInput[];
  numeroPessoasEmpresa: number;
  compostos: CompostoInput[];
  boinas: BoinaInput[];
}): CalculatorInput {
  return {
    polimentosMes: store.volumePreco.polimentosMes,
    precoMedioPolimento: store.volumePreco.precoMedioPolimento,
    horasAtuais: store.volumePreco.horas,
    equipe: store.membros,
    // No modo "empresa" o custo é único (custo fixo), mas o número de
    // pessoas que realmente polem o carro precisa ser informado à parte
    // para dividir o tempo do processo Zvizzer proporcionalmente.
    numeroPessoasPolimento:
      store.tipoMaoDeObra === "empresa" ? store.numeroPessoasEmpresa : undefined,
    compostos: store.compostos,
    boinas: store.boinas,
  };
}
