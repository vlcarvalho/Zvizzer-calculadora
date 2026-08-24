/**
 * Motor de cálculo da Calculadora de Eficiência de Polimento Zvizzer.
 *
 * Funções puras, sem I/O e sem dependência de framework — propositalmente,
 * para poderem ser copiadas 1:1 para um futuro app mobile (React Native/Expo)
 * caso o caminho de empacotamento mude de Capacitor para app nativo separado.
 *
 * Todas as fórmulas seguem literalmente o documento
 * "Calculadora de Eficiência de Polimento.docx" (seções 4 a 14). Onde o
 * documento deixava uma ambiguidade (modo equipe reaplicado no cenário
 * Zvizzer), a decisão tomada está documentada no comentário da função.
 */

// ---------------------------------------------------------------------------
// Tipos de entrada
// ---------------------------------------------------------------------------

export type PapelMaoDeObra = "proprietario" | "colaborador" | "empresa";

export interface ProprietarioInput {
  papel: "proprietario";
  proLabore: number; // R$/mês
  horasSemanais: number;
}

export interface ColaboradorInput {
  papel: "colaborador";
  salarioBruto: number; // R$/mês
  beneficios: number; // R$/mês
  horasSemanais: number;
}

/** Cenário "Empresa com vários funcionários": em vez de somar salário por
 * salário, usa o custo fixo mensal total da operação dividido por uma
 * referência de horas/mês (spec do cliente: 220h — configurável no admin). */
export interface EmpresaInput {
  papel: "empresa";
  custoFixoMensal: number; // R$/mês
}

export type MembroInput = ProprietarioInput | ColaboradorInput | EmpresaInput;

export interface LaborParams {
  encargosPatronaisPct: number;
  fgtsPct: number;
  decimoTerceiroPct: number;
  feriasPct: number;
  adicionalFeriasPct: number;
  outrosEncargosPct: number;
  horasBaseMensalEmpresa: number;
}

export interface CompostoInput {
  nome?: string;
  precoEmbalagem: number;
  quantidadeEmbalagemG: number;
  consumoCarroG: number;
}

export interface BoinaInput {
  nome?: string;
  quantidade: number;
  precoUnitario: number;
  durabilidadeCarros: number;
}

export interface ZvizzerParams {
  compostoPreco: number;
  compostoPesoG: number;
  compostoConsumoG: number;
  boinaPreco: number;
  boinaQuantidade: number;
  boinaDurabilidadeCarros: number;
  tempoProcessoMinutos: number;
}

export interface CalculatorInput {
  polimentosMes: number;
  precoMedioPolimento: number;
  horasAtuais: number; // horas decimais (ex.: 5.5 = 5h30)
  equipe: MembroInput[]; // 1 membro = proprietário/colaborador/empresa único; >1 = modo equipe
  compostos: CompostoInput[];
  boinas: BoinaInput[];
  /** Número de pessoas trabalhando juntas na etapa de polimento — usado para
   * dividir proporcionalmente o tempo do processo Zvizzer. Por padrão é
   * `equipe.length`; informe explicitamente quando o custo é único mas a
   * operação tem mais gente (ex.: cenário "empresa com vários
   * funcionários", onde o custo fixo não é decomposto pessoa a pessoa). */
  numeroPessoasPolimento?: number;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Semanas médias por mês, conforme especificado no documento-fonte. */
export const SEMANAS_POR_MES = 4.33;

// ---------------------------------------------------------------------------
// Custo-hora de mão de obra
// ---------------------------------------------------------------------------

export function horasMensais(horasSemanais: number): number {
  return horasSemanais * SEMANAS_POR_MES;
}

export function custoHoraProprietario(membro: ProprietarioInput): number {
  const horas = horasMensais(membro.horasSemanais);
  if (horas <= 0) return 0;
  return membro.proLabore / horas;
}

export function custoMensalColaborador(
  membro: ColaboradorInput,
  labor: LaborParams
): number {
  const percentualTotal =
    labor.encargosPatronaisPct +
    labor.fgtsPct +
    labor.decimoTerceiroPct +
    labor.feriasPct +
    labor.adicionalFeriasPct +
    labor.outrosEncargosPct;
  const encargos = membro.salarioBruto * percentualTotal;
  return membro.salarioBruto + membro.beneficios + encargos;
}

export function custoHoraColaborador(
  membro: ColaboradorInput,
  labor: LaborParams
): number {
  const horas = horasMensais(membro.horasSemanais);
  if (horas <= 0) return 0;
  return custoMensalColaborador(membro, labor) / horas;
}

/** Custo fixo mensal da operação dividido pela referência de horas/mês
 * configurada no admin (spec do cliente: 220h por padrão). */
export function custoHoraEmpresa(membro: EmpresaInput, labor: LaborParams): number {
  if (labor.horasBaseMensalEmpresa <= 0) return 0;
  return membro.custoFixoMensal / labor.horasBaseMensalEmpresa;
}

export function custoHoraMembro(membro: MembroInput, labor: LaborParams): number {
  if (membro.papel === "proprietario") return custoHoraProprietario(membro);
  if (membro.papel === "colaborador") return custoHoraColaborador(membro, labor);
  return custoHoraEmpresa(membro, labor);
}

/**
 * Custo-hora efetivo da mão de obra envolvida no polimento.
 *
 * Modo único (1 membro): custo-hora daquela pessoa.
 * Modo equipe (>1 membro): soma do custo-hora de todas as pessoas
 * efetivamente envolvidas na etapa de polimento (spec §5 "Se for equipe").
 *
 * Este mesmo valor é reutilizado no cenário Zvizzer (spec §9: "não utilizar
 * um custo-hora Zvizzer fixo... usar exatamente o mesmo custo-hora calculado
 * para aquele usuário"), inclusive quando o usuário está no modo equipe —
 * garantindo que a comparação atual-vs-Zvizzer seja sempre feita com a
 * mesma equipe/custo, só variando o tempo do processo.
 */
export function custoHoraEfetivo(
  equipe: MembroInput[],
  labor: LaborParams
): number {
  return equipe.reduce((soma, membro) => soma + custoHoraMembro(membro, labor), 0);
}

// ---------------------------------------------------------------------------
// Valor de venda da hora
// ---------------------------------------------------------------------------

/** valor_venda_hora = preço_médio_polimento / horas_atuais_polimento */
export function valorVendaHora(precoMedioPolimento: number, horasAtuais: number): number {
  if (horasAtuais <= 0) return 0;
  return precoMedioPolimento / horasAtuais;
}

// ---------------------------------------------------------------------------
// Compostos e boinas
// ---------------------------------------------------------------------------

export function custoCompostoCarro(composto: CompostoInput): number {
  if (composto.quantidadeEmbalagemG <= 0) return 0;
  return (composto.precoEmbalagem / composto.quantidadeEmbalagemG) * composto.consumoCarroG;
}

export function custoCompostosTotal(compostos: CompostoInput[]): number {
  return compostos.reduce((soma, c) => soma + custoCompostoCarro(c), 0);
}

export function custoBoinaCarro(boina: BoinaInput): number {
  if (boina.durabilidadeCarros <= 0) return 0;
  return (boina.quantidade * boina.precoUnitario) / boina.durabilidadeCarros;
}

export function custoBoinasTotal(boinas: BoinaInput[]): number {
  return boinas.reduce((soma, b) => soma + custoBoinaCarro(b), 0);
}

export function custoCompostoZvizzer(params: ZvizzerParams): number {
  return custoCompostoCarro({
    precoEmbalagem: params.compostoPreco,
    quantidadeEmbalagemG: params.compostoPesoG,
    consumoCarroG: params.compostoConsumoG,
  });
}

export function custoBoinaZvizzer(params: ZvizzerParams): number {
  return custoBoinaCarro({
    quantidade: params.boinaQuantidade,
    precoUnitario: params.boinaPreco,
    durabilidadeCarros: params.boinaDurabilidadeCarros,
  });
}

// ---------------------------------------------------------------------------
// Resultado completo
// ---------------------------------------------------------------------------

export interface CalculatorResult {
  custoHoraEfetivo: number;
  valorVendaHora: number;

  numeroPessoas: number;
  horasAtuais: number;
  horasZvizzer: number;

  custoCompostosAtual: number;
  custoBoinasAtual: number;
  custoMaoDeObraAtual: number;
  custoOperacionalAtual: number;
  custoOperacionalMensalAtual: number;

  custoCompostoZvizzer: number;
  custoBoinaZvizzer: number;
  custoMaoDeObraZvizzer: number;
  custoOperacionalZvizzer: number;
  custoOperacionalMensalZvizzer: number;

  economiaPorCarro: number;
  economiaMensal: number;

  horasLiberadasPorCarro: number;
  horasLiberadasMes: number;

  capacidadeFaturamento: number;
  impactoEconomicoPotencial: number;
}

export function calcular(
  input: CalculatorInput,
  zvizzer: ZvizzerParams,
  labor: LaborParams
): CalculatorResult {
  const custoHora = custoHoraEfetivo(input.equipe, labor);
  const vendaHora = valorVendaHora(input.precoMedioPolimento, input.horasAtuais);

  // Quantas pessoas efetivamente polem o carro juntas. O tempo do processo
  // Zvizzer configurado no admin (`tempoProcessoMinutos`) é a referência para
  // 1 pessoa sozinha; com mais gente trabalhando ao mesmo tempo no mesmo
  // carro, o tempo de parede diminui proporcionalmente (ajuste pedido pela
  // Zvizzer: 2 pessoas ≈ metade do tempo, 3 pessoas ≈ um terço, etc.).
  // Por padrão é o tamanho da equipe; o cenário "empresa" informa esse
  // número explicitamente, já que o custo ali não é decomposto pessoa a
  // pessoa (ver `numeroPessoasPolimento` em CalculatorInput).
  const numeroPessoas = Math.max(1, input.numeroPessoasPolimento ?? input.equipe.length);
  const horasZvizzer = zvizzer.tempoProcessoMinutos / 60 / numeroPessoas;

  // --- Cenário atual ---
  const custoCompostosAtual = custoCompostosTotal(input.compostos);
  const custoBoinasAtual = custoBoinasTotal(input.boinas);
  const custoMaoDeObraAtual = custoHora * input.horasAtuais;
  const custoOperacionalAtual =
    custoCompostosAtual + custoBoinasAtual + custoMaoDeObraAtual;
  const custoOperacionalMensalAtual = custoOperacionalAtual * input.polimentosMes;

  // --- Cenário Zvizzer (mesmo custo-hora do usuário, spec §9) ---
  const custoCompZvizzer = custoCompostoZvizzer(zvizzer);
  const custoBoinaZviz = custoBoinaZvizzer(zvizzer);
  const custoMaoDeObraZvizzer = custoHora * horasZvizzer;
  const custoOperacionalZvizzer = custoCompZvizzer + custoBoinaZviz + custoMaoDeObraZvizzer;
  const custoOperacionalMensalZvizzer = custoOperacionalZvizzer * input.polimentosMes;

  // --- Economia ---
  // Pode ser negativa; a UI deve rotular como "diferença de custo" quando < 0
  // (spec §11), nunca ocultar o resultado.
  const economiaPorCarro = custoOperacionalAtual - custoOperacionalZvizzer;
  const economiaMensal = economiaPorCarro * input.polimentosMes;

  // --- Horas liberadas ---
  // Nunca negativo (spec §12): se o processo atual já é mais rápido, é 0.
  const horasLiberadasPorCarro = Math.max(0, input.horasAtuais - horasZvizzer);
  const horasLiberadasMes = horasLiberadasPorCarro * input.polimentosMes;

  // --- Capacidade de faturamento e impacto potencial ---
  const capacidadeFaturamento = horasLiberadasMes * vendaHora;
  // Soma de duas fontes conceitualmente distintas: economia de custo já
  // realizada (economiaMensal) + capacidade comercial das horas liberadas
  // (capacidadeFaturamento), exatamente como pedido no spec §14. Não é um
  // valor de caixa garantido — a UI deve usar linguagem cautelosa
  // ("capacidade potencial de faturamento"), nunca "faturamento garantido".
  const impactoEconomicoPotencial = economiaMensal + capacidadeFaturamento;

  return {
    custoHoraEfetivo: custoHora,
    valorVendaHora: vendaHora,
    numeroPessoas,
    horasAtuais: input.horasAtuais,
    horasZvizzer,
    custoCompostosAtual,
    custoBoinasAtual,
    custoMaoDeObraAtual,
    custoOperacionalAtual,
    custoOperacionalMensalAtual,
    custoCompostoZvizzer: custoCompZvizzer,
    custoBoinaZvizzer: custoBoinaZviz,
    custoMaoDeObraZvizzer,
    custoOperacionalZvizzer,
    custoOperacionalMensalZvizzer,
    economiaPorCarro,
    economiaMensal,
    horasLiberadasPorCarro,
    horasLiberadasMes,
    capacidadeFaturamento,
    impactoEconomicoPotencial,
  };
}
