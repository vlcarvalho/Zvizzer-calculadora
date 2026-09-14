import { formatarHoras, formatarMoeda } from "./format";

/**
 * Listas de seleção do wizard. Centralizadas aqui para que os ranges
 * (1 a 50 polimentos, R$100 a R$3.000, 0h30 a 20h etc.) sejam fáceis de
 * ajustar num lugar só.
 */

export interface OpcaoNumerica {
  valor: number;
  label: string;
}

function faixa(inicio: number, fim: number, passo: number): number[] {
  const valores: number[] = [];
  for (let v = inicio; v <= fim + 1e-9; v += passo) {
    valores.push(Number(v.toFixed(2)));
  }
  return valores;
}

/** 1 a 50 polimentos por mês. */
export const OPCOES_POLIMENTOS_MES: OpcaoNumerica[] = faixa(1, 50, 1).map((v) => ({
  valor: v,
  label: String(v),
}));

/** R$ 100,00 a R$ 3.000,00, de R$ 100 em R$ 100. */
export const OPCOES_PRECO_POLIMENTO: OpcaoNumerica[] = faixa(100, 3000, 100).map((v) => ({
  valor: v,
  label: formatarMoeda(v),
}));

/** 0h30 a 20h, de 30 em 30 minutos (valor em horas decimais). */
export const OPCOES_HORAS_POLIMENTO: OpcaoNumerica[] = faixa(0.5, 20, 0.5).map((v) => ({
  valor: v,
  label: formatarHoras(v),
}));

/** 1 a 4 profissionais polindo o mesmo carro ao mesmo tempo. */
export const OPCOES_PROFISSIONAIS: OpcaoNumerica[] = faixa(1, 4, 1).map((v) => ({
  valor: v,
  label: v === 1 ? "1 profissional" : `${v} profissionais`,
}));

/** Embalagens de composto disponíveis no mercado. */
export const OPCOES_EMBALAGEM_G: OpcaoNumerica[] = [
  { valor: 250, label: "250 g" },
  { valor: 500, label: "500 g" },
  { valor: 750, label: "750 g" },
  { valor: 1000, label: "1 kg" },
];

/** 25 g a 200 g por carro, de 25 em 25. */
export const OPCOES_CONSUMO_G: OpcaoNumerica[] = faixa(25, 200, 25).map((v) => ({
  valor: v,
  label: `${v} g`,
}));

/** 1 a 6 boinas em revezamento. */
export const OPCOES_QUANTIDADE_BOINAS: OpcaoNumerica[] = faixa(1, 6, 1).map((v) => ({
  valor: v,
  label: String(v),
}));

/** 1 a 20 carros até a troca da boina. */
export const OPCOES_CARROS_ATE_TROCA: OpcaoNumerica[] = faixa(1, 20, 1).map((v) => ({
  valor: v,
  label: v === 1 ? "1 carro" : `${v} carros`,
}));

export const TIPOS_BOINA = ["Lã", "Espuma", "Híbrida", "Microfibra"] as const;
export type TipoBoina = (typeof TIPOS_BOINA)[number];
