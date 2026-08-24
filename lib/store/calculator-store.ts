"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoinaInput, CompostoInput, MembroInput } from "@/lib/calculations";

export type TipoMaoDeObra = "proprietario" | "colaborador" | "equipe" | "empresa";

export interface VolumePrecoState {
  polimentosMes: number;
  precoMedioPolimento: number;
  /** Horas do polimento atual (decimal — ex.: 5,5 = 5h30). Apenas horas na
   * UI, sem campo separado de minutos, a pedido da Zvizzer. */
  horas: number;
}

interface CalculatorState {
  etapa: number; // 1..4 (etapa 5 = resultado, não persistida como "etapa")
  volumePreco: VolumePrecoState;
  tipoMaoDeObra: TipoMaoDeObra;
  membros: MembroInput[];
  /** Só usado no modo "empresa": quantas pessoas atuam na etapa de
   * polimento — o custo é único (custo fixo), mas esse número ainda é
   * necessário para dividir o tempo do processo Zvizzer proporcionalmente. */
  numeroPessoasEmpresa: number;
  compostos: CompostoInput[];
  boinas: BoinaInput[];

  irParaEtapa: (etapa: number) => void;
  proximaEtapa: () => void;
  etapaAnterior: () => void;

  setVolumePreco: (patch: Partial<VolumePrecoState>) => void;
  setTipoMaoDeObra: (tipo: TipoMaoDeObra) => void;
  setMembro: (index: number, membro: MembroInput) => void;
  adicionarMembro: () => void;
  removerMembro: (index: number) => void;
  setNumeroPessoasEmpresa: (n: number) => void;

  adicionarComposto: () => void;
  atualizarComposto: (index: number, patch: Partial<CompostoInput>) => void;
  removerComposto: (index: number) => void;

  adicionarBoina: () => void;
  atualizarBoina: (index: number, patch: Partial<BoinaInput>) => void;
  removerBoina: (index: number) => void;

  reiniciar: () => void;
}

const membroProprietarioPadrao: MembroInput = {
  papel: "proprietario",
  proLabore: 0,
  horasSemanais: 44,
};

const compostoPadrao: CompostoInput = {
  precoEmbalagem: 0,
  quantidadeEmbalagemG: 0,
  consumoCarroG: 0,
};

const boinaPadrao: BoinaInput = {
  quantidade: 1,
  precoUnitario: 0,
  durabilidadeCarros: 0,
};

const estadoInicial = {
  etapa: 1,
  volumePreco: { polimentosMes: 0, precoMedioPolimento: 0, horas: 0 },
  tipoMaoDeObra: "proprietario" as TipoMaoDeObra,
  membros: [membroProprietarioPadrao],
  numeroPessoasEmpresa: 0,
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

      setTipoMaoDeObra: (tipo) =>
        set(() => {
          if (tipo === "proprietario") {
            return { tipoMaoDeObra: tipo, membros: [membroProprietarioPadrao] };
          }
          if (tipo === "colaborador") {
            return {
              tipoMaoDeObra: tipo,
              membros: [
                { papel: "colaborador", salarioBruto: 0, beneficios: 0, horasSemanais: 44 },
              ],
            };
          }
          if (tipo === "empresa") {
            return {
              tipoMaoDeObra: tipo,
              membros: [{ papel: "empresa", custoFixoMensal: 0 }],
            };
          }
          return {
            tipoMaoDeObra: tipo,
            membros: [membroProprietarioPadrao],
          };
        }),

      setMembro: (index, membro) =>
        set((s) => {
          const membros = [...s.membros];
          membros[index] = membro;
          return { membros };
        }),

      adicionarMembro: () =>
        set((s) => ({
          membros: [
            ...s.membros,
            { papel: "colaborador", salarioBruto: 0, beneficios: 0, horasSemanais: 44 },
          ],
        })),

      removerMembro: (index) =>
        set((s) => ({ membros: s.membros.filter((_, i) => i !== index) })),

      setNumeroPessoasEmpresa: (n) => set({ numeroPessoasEmpresa: n }),

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
    }
  )
);
