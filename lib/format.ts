/** Formatação pt-BR (spec §24): moeda, horas "2h30" e percentuais. */

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const currencyFormatterPreciso = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

export function formatarMoeda(valor: number, preciso = false): string {
  if (!Number.isFinite(valor)) return "R$ 0";
  return (preciso ? currencyFormatterPreciso : currencyFormatter).format(valor);
}

/** Converte horas decimais (ex.: 5.5) em "5h30". */
export function formatarHoras(horasDecimais: number): string {
  if (!Number.isFinite(horasDecimais) || horasDecimais < 0) return "0h";
  const horas = Math.floor(horasDecimais);
  const minutos = Math.round((horasDecimais - horas) * 60);
  if (minutos === 0) return `${horas}h`;
  return `${horas}h${String(minutos).padStart(2, "0")}`;
}

export function formatarPercentual(fracao: number, casasDecimais = 1): string {
  if (!Number.isFinite(fracao)) return "0%";
  return `${(fracao * 100).toFixed(casasDecimais).replace(".", ",")}%`;
}

export function formatarNumero(valor: number): string {
  if (!Number.isFinite(valor)) return "0";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(valor);
}
