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

/**
 * Custos fixos mensais da operação. O usuário informa esses quatro valores
 * (em vez de escolher um "cenário" de mão de obra) e o custo-hora sai da
 * soma deles dividida pela referência de horas/mês do admin.
 */
export interface CustosFixosInput {
  salarioProLabore: number; // R$/mês
  aluguel: number; // R$/mês
  custoFuncionarios: number; // R$/mês, já com encargos
  demaisDespesas: number; // R$/mês (energia, água, internet, contabilidade...)
}

export interface LaborParams {
  /** Horas/mês usadas para transformar custo fixo mensal em custo-hora. */
  horasBaseMensais: number;
}

export interface CompostoInput {
  nome?: string;
  precoEmbalagem: number;
  quantidadeEmbalagemG: number;
  consumoCarroG: number;
}

export interface BoinaInput {
  nome?: string;
  tipo?: string; // Lã, Espuma, Híbrida ou Microfibra
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
  custosFixos: CustosFixosInput;
  compostos: CompostoInput[];
  boinas: BoinaInput[];
  /** Número de pessoas trabalhando juntas na etapa de polimento — divide
   * proporcionalmente o tempo do processo Zvizzer. Hoje a calculadora não
   * pergunta isso (o custo é informado como custo fixo da operação, sem
   * decompor por pessoa), então o padrão é 1. */
  numeroPessoasPolimento?: number;
}

// ---------------------------------------------------------------------------
// Custo-hora da operação
// ---------------------------------------------------------------------------

/** Soma dos custos fixos mensais informados pelo usuário. */
export function custoFixoMensalTotal(custos: CustosFixosInput): number {
  return (
    custos.salarioProLabore +
    custos.aluguel +
    custos.custoFuncionarios +
    custos.demaisDespesas
  );
}

/**
 * Custo-hora da operação: custo fixo mensal total dividido pela referência
 * de horas/mês configurada no admin (padrão de mercado: 220h).
 *
 * Este mesmo custo-hora é reaproveitado no cenário Zvizzer (spec §9: "não
 * utilizar um custo-hora Zvizzer fixo... usar exatamente o mesmo custo-hora
 * calculado para aquele usuário"), de modo que a comparação varie só no
 * tempo do processo e nos insumos.
 */
export function custoHoraOperacao(
  custos: CustosFixosInput,
  labor: LaborParams
): number {
  if (labor.horasBaseMensais <= 0) return 0;
  return custoFixoMensalTotal(custos) / labor.horasBaseMensais;
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
  custoFixoMensal: number;
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
  const custoHora = custoHoraOperacao(input.custosFixos, labor);
  const vendaHora = valorVendaHora(input.precoMedioPolimento, input.horasAtuais);

  // Quantas pessoas polem o carro juntas. O tempo do processo Zvizzer
  // configurado no admin (`tempoProcessoMinutos`) é a referência para 1
  // pessoa; com mais gente trabalhando ao mesmo tempo no mesmo carro, o
  // tempo de parede cai proporcionalmente. A calculadora não pergunta isso
  // hoje (o custo entra como custo fixo da operação), então fica em 1 —
  // basta voltar a passar `numeroPessoasPolimento` para reativar.
  const numeroPessoas = Math.max(1, input.numeroPessoasPolimento ?? 1);
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
    custoFixoMensal: custoFixoMensalTotal(input.custosFixos),
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
