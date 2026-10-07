"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoinaInput, CompostoInput, CustosFixosInput } from "@/lib/calculations";

export interface VolumePrecoState {
  polimentosMes: number;
  precoMedioPolimento: number;
  /** Horas do polimento atual (decimal — ex.: 5,5 = 5h30). */
  horas: number;
  /** Quantas pessoas polem o mesmo carro ao mesmo tempo (1 a 4). É só um
   * dado informado: não entra em nenhuma conta de tempo (o tempo informado já
   * é o da equipe inteira). */
  profissionaisSimultaneos: number;
}

interface CalculatorState {
  etapa: number; // 1..4 (a tela de resultado não conta como etapa)
  volumePreco: VolumePrecoState;
  custosFixos: CustosFixosInput;
  compostos: CompostoInput[];
  boinas: BoinaInput[];

  irParaEtapa: (etapa: number) => void;
  proximaEtapa: () => void;
  etapaAnterior: () => void;

  setVolumePreco: (patch: Partial<VolumePrecoState>) => void;
  setCustosFixos: (patch: Partial<CustosFixosInput>) => void;

  adicionarComposto: () => void;
  atualizarComposto: (index: number, patch: Partial<CompostoInput>) => void;
  removerComposto: (index: number) => void;

  adicionarBoina: () => void;
  atualizarBoina: (index: number, patch: Partial<BoinaInput>) => void;
  removerBoina: (index: number) => void;

  reiniciar: () => void;
}

const compostoPadrao: CompostoInput = {
  nome: "",
  precoEmbalagem: 0,
  quantidadeEmbalagemG: 0,
  consumoCarroG: 0,
};

const boinaPadrao: BoinaInput = {
  nome: "",
  tipo: "",
  quantidade: 0,
  precoUnitario: 0,
  durabilidadeCarros: 0,
};

const estadoInicial = {
  etapa: 1,
  volumePreco: {
    polimentosMes: 0,
    precoMedioPolimento: 0,
    horas: 0,
    profissionaisSimultaneos: 0,
  },
  custosFixos: {
    salarioProLabore: 0,
    aluguel: 0,
    custoFuncionarios: 0,
    demaisDespesas: 0,
  },
  compostos: [compostoPadrao],
  boinas: [boinaPadrao],
};

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      ...estadoInicial,

      irParaEtapa: (etapa) => set({ etapa }),
      proximaEtapa: () => set((s) => ({ etapa: Math.min(4, s.etapa + 1) })),
      etapaAnterior: () => set((s) => ({ etapa: Math.max(1, s.etapa - 1) })),

      setVolumePreco: (patch) =>
        set((s) => ({ volumePreco: { ...s.volumePreco, ...patch } })),

      setCustosFixos: (patch) =>
        set((s) => ({ custosFixos: { ...s.custosFixos, ...patch } })),

      adicionarComposto: () =>
        set((s) => ({ compostos: [...s.compostos, { ...compostoPadrao }] })),
      atualizarComposto: (index, patch) =>
        set((s) => {
          const compostos = [...s.compostos];
          compostos[index] = { ...compostos[index], ...patch };
          return { compostos };
        }),
      removerComposto: (index) =>
        set((s) => ({ compostos: s.compostos.filter((_, i) => i !== index) })),

      adicionarBoina: () => set((s) => ({ boinas: [...s.boinas, { ...boinaPadrao }] })),
      atualizarBoina: (index, patch) =>
        set((s) => {
          const boinas = [...s.boinas];
          boinas[index] = { ...boinas[index], ...patch };
          return { boinas };
        }),
      removerBoina: (index) =>
        set((s) => ({ boinas: s.boinas.filter((_, i) => i !== index) })),

      reiniciar: () => set(estadoInicial),
    }),
    {
      name: "zvizzer-calculadora-progresso", // spec §25: persistência temporária
      version: 3, // etapa 1 ganhou o número de profissionais simultâneos
    }
  )
);
