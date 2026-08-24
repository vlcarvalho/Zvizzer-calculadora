import {
  boinaSchema,
  compostoSchema,
  membroSchema,
  volumePrecoSchema,
} from "@/lib/validation";
import type { BoinaInput, CompostoInput, MembroInput } from "@/lib/calculations";
import type { VolumePrecoState } from "@/lib/store/calculator-store";

export type ErrosCampo = Record<string, string>;

function coletarErros(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }): ErrosCampo {
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

export function validarEtapaMaoDeObra(membros: MembroInput[]): ErrosCampo {
  for (const membro of membros) {
    const result = membroSchema.safeParse(membro);
    if (!result.success) return coletarErros(result);
  }
  return {};
}

export function validarEtapaCompostos(compostos: CompostoInput[]): ErrosCampo {
  if (compostos.length === 0) return { _geral: "Adicione ao menos um composto." };
  for (const composto of compostos) {
    const result = compostoSchema.safeParse(composto);
    if (!result.success) return coletarErros(result);
  }
  return {};
}

export function validarEtapaBoinas(boinas: BoinaInput[]): ErrosCampo {
  if (boinas.length === 0) return { _geral: "Adicione ao menos um conjunto de boinas." };
  for (const boina of boinas) {
    const result = boinaSchema.safeParse(boina);
    if (!result.success) return coletarErros(result);
  }
  return {};
}
