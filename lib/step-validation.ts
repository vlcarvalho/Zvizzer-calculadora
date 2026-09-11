import {
  boinaSchema,
  compostoSchema,
  custosFixosSchema,
  volumePrecoSchema,
} from "@/lib/validation";
import type { BoinaInput, CompostoInput, CustosFixosInput } from "@/lib/calculations";
import type { VolumePrecoState } from "@/lib/store/calculator-store";

export type ErrosCampo = Record<string, string>;

function coletarErros(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}): ErrosCampo {
  const erros: ErrosCampo = {};
  if (!result.success && result.error) {
    for (const issue of result.error.issues) {
      const chave = String(issue.path[0] ?? "_geral");
      if (!erros[chave]) erros[chave] = issue.message;
    }
  }
  return erros;
}

export function validarEtapaVolume(volumePreco: VolumePrecoState): ErrosCampo {
  const result = volumePrecoSchema.safeParse({
    polimentosMes: volumePreco.polimentosMes,
    precoMedioPolimento: volumePreco.precoMedioPolimento,
    horasAtuais: volumePreco.horas,
  });
  return coletarErros(result);
}

export function validarEtapaCustosFixos(custosFixos: CustosFixosInput): ErrosCampo {
  return coletarErros(custosFixosSchema.safeParse(custosFixos));
}

/** Erros por índice do item da lista, para destacar o card certo na tela. */
export type ErrosPorItem = Record<number, ErrosCampo>;

export function validarEtapaCompostos(compostos: CompostoInput[]): ErrosPorItem {
  if (compostos.length === 0) return { 0: { _geral: "Adicione ao menos um composto." } };

  const erros: ErrosPorItem = {};
  compostos.forEach((composto, i) => {
    const result = compostoSchema.safeParse(composto);
    if (!result.success) erros[i] = coletarErros(result);
  });
  return erros;
}

export function validarEtapaBoinas(boinas: BoinaInput[]): ErrosPorItem {
  if (boinas.length === 0) return { 0: { _geral: "Adicione ao menos uma boina." } };

  const erros: ErrosPorItem = {};
  boinas.forEach((boina, i) => {
    const result = boinaSchema.safeParse(boina);
    if (!result.success) erros[i] = coletarErros(result);
  });
  return erros;
}
