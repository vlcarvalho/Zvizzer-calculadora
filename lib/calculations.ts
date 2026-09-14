/**
 * Motor de cálculo da Calculadora de Eficiência de Polimento Zvizzer.
 *
 * Funções puras, sem I/O e sem dependência de framework — propositalmente,
 * para poderem ser copiadas 1:1 para um futuro app mobile (React Native/Expo)
 * caso o caminho de empacotamento mude de Capacitor para app nativo separado.
 *
 * Todas as fórmulas seguem literalmente o documento
 * "Calculadora de Eficiência de Polimento.docx" (seções 4 a 14), com o ajuste
 * de regra de negócio confirmado pelo cliente em 2026-09-14: o tempo-base de
 * horas/mês é uma constante fixa (não mais configurável no admin) e o tempo
 * Zvizzer é sempre 60% do tempo atual informado pelo cliente — nunca dividido
 * pela quantidade de profissionais (ver constantes abaixo).
 */

// ---------------------------------------------------------------------------
// Constantes de negócio
// ---------------------------------------------------------------------------

/**
 * Horas/mês usadas para transformar o custo fixo mensal informado pelo
 * usuário em custo-hora da operação. Fixo em 220h (referência padrão de
 * mercado) — deixou de ser configurável pelo admin por decisão do cliente.
 */
export const HORAS_BASE_MENSAIS = 220;

/**
 * O processo com Zvizzer é sempre 40% mais rápido que o processo atual
 * informado pelo cliente — ou seja, leva 60% do tempo atual.
 * tempo_zvizzer = tempo_atual × 0.60 (NUNCA tempo_atual × 0.40: 40% MENOS
 * tempo significa usar 60% do tempo original).
 */
export const FATOR_TEMPO_ZVIZZER = 0.6;

// ---------------------------------------------------------------------------
// Tipos de entrada
// ---------------------------------------------------------------------------

/**
 * Custos fixos mensais da operação. O usuário informa esses quatro valores
 * (em vez de escolher um "cenário" de mão de obra) e o custo-hora sai da
 * soma deles dividida pela referência fixa de horas/mês (`HORAS_BASE_MENSAIS`).
 */
export interface CustosFixosInput {
  salarioProLabore: number; // R$/mês
  aluguel: number; // R$/mês
  custoFuncionarios: number; // R$/mês, já com encargos
  demaisDespesas: number; // R$/mês (energia, água, internet, contabilidade...)
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
}

export interface CalculatorInput {
  polimentosMes: number;
  precoMedioPolimento: number;
  /** Duração real do processo daquela equipe — nunca dividida pela
   * quantidade de profissionais (esse número já é o tempo de parede). */
  horasAtuais: number; // horas decimais (ex.: 5.5 = 5h30)
  custosFixos: CustosFixosInput;
  compostos: CompostoInput[];
  boinas: BoinaInput[];
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
 * fixa de 220h/mês (`HORAS_BASE_MENSAIS`, padrão de mercado, não configurável).
 *
 * Este mesmo custo-hora é reaproveitado no cenário Zvizzer (spec §9: "não
 * utilizar um custo-hora Zvizzer fixo... usar exatamente o mesmo custo-hora
 * calculado para aquele usuário"), de modo que a comparação varie só no
 * tempo do processo e nos insumos.
 */
export function custoHoraOperacao(custos: CustosFixosInput): number {
  return custoFixoMensalTotal(custos) / HORAS_BASE_MENSAIS;
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

export function calcular(input: CalculatorInput, zvizzer: ZvizzerParams): CalculatorResult {
  const custoHora = custoHoraOperacao(input.custosFixos);
  const vendaHora = valorVendaHora(input.precoMedioPolimento, input.horasAtuais);

  // O processo Zvizzer é sempre 40% mais rápido que o tempo atual informado
  // pelo cliente — ou seja, 60% do tempo atual. A quantidade de profissionais
  // é a mesma nos dois cenários e NUNCA divide o tempo (nem o atual, nem o
  // Zvizzer): o ganho vem da redução do tempo de processo, não de uma
  // redução fictícia de gente trabalhando.
  const horasZvizzer = input.horasAtuais * FATOR_TEMPO_ZVIZZER;

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
