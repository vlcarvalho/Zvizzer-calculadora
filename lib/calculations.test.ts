import { describe, expect, it } from "vitest";
import {
  calcular,
  custoBoinaCarro,
  custoCompostoCarro,
  custoFixoMensalTotal,
  custoHoraOperacao,
  valorVendaHora,
  FATOR_TEMPO_ZVIZZER,
  HORAS_BASE_MENSAIS,
  type BoinaInput,
  type CompostoInput,
  type CustosFixosInput,
  type ZvizzerParams,
} from "./calculations";

const zvizzer: ZvizzerParams = {
  compostoPreco: 700,
  compostoPesoG: 750,
  compostoConsumoG: 40,
  boinaPreco: 150,
  boinaQuantidade: 1,
  boinaDurabilidadeCarros: 10,
};

const custosFixos: CustosFixosInput = {
  salarioProLabore: 8000,
  aluguel: 4000,
  custoFuncionarios: 6000,
  demaisDespesas: 2000,
};

describe("valorVendaHora", () => {
  it("segue o exemplo do documento: R$1.000 / 5h = R$200/h", () => {
    expect(valorVendaHora(1000, 5)).toBe(200);
  });

  it("retorna 0 em vez de dividir por zero quando horasAtuais é 0", () => {
    expect(valorVendaHora(1000, 0)).toBe(0);
  });
});

describe("custo-hora da operação", () => {
  it("soma os quatro custos fixos informados pelo usuário", () => {
    expect(custoFixoMensalTotal(custosFixos)).toBe(20000);
  });

  it("divide o custo fixo pela constante fixa de 220h/mês", () => {
    // Exemplo do cliente: R$20.000 / 220h ≈ R$90,91/h
    expect(HORAS_BASE_MENSAIS).toBe(220);
    expect(custoHoraOperacao(custosFixos)).toBeCloseTo(20000 / 220, 5);
  });
});

describe("compostos e boinas", () => {
  it("custo do composto por carro", () => {
    const composto: CompostoInput = {
      precoEmbalagem: 700,
      quantidadeEmbalagemG: 750,
      consumoCarroG: 40,
    };
    expect(custoCompostoCarro(composto)).toBeCloseTo((700 / 750) * 40, 5);
  });

  it("custo da boina por carro (durabilidade em carros)", () => {
    const boina: BoinaInput = { quantidade: 1, precoUnitario: 150, durabilidadeCarros: 10 };
    expect(custoBoinaCarro(boina)).toBeCloseTo((1 * 150) / 10, 5);
  });

  it("nunca divide por zero: durabilidade 0 retorna custo 0 em vez de Infinity", () => {
    expect(custoBoinaCarro({ quantidade: 1, precoUnitario: 150, durabilidadeCarros: 0 })).toBe(0);
  });
});

describe("calcular() — cenário completo", () => {
  it("monta o resultado a partir dos custos fixos, compostos e boinas", () => {
    const resultado = calcular(
      {
        polimentosMes: 30,
        precoMedioPolimento: 1000,
        horasAtuais: 5,
        custosFixos,
        compostos: [{ precoEmbalagem: 300, quantidadeEmbalagemG: 500, consumoCarroG: 60 }],
        boinas: [{ quantidade: 2, precoUnitario: 80, durabilidadeCarros: 8 }],
      },
      zvizzer
    );

    const custoHora = 20000 / 220;

    expect(resultado.custoFixoMensal).toBe(20000);
    expect(resultado.custoHoraEfetivo).toBeCloseTo(custoHora, 5);
    expect(resultado.valorVendaHora).toBe(200);

    // Atual: composto 36 + boina 20 + mão de obra (custoHora × 5h)
    expect(resultado.custoCompostosAtual).toBeCloseTo(36, 5);
    expect(resultado.custoBoinasAtual).toBeCloseTo(20, 5);
    expect(resultado.custoMaoDeObraAtual).toBeCloseTo(custoHora * 5, 5);
    expect(resultado.custoOperacionalAtual).toBeCloseTo(36 + 20 + custoHora * 5, 5);

    // Zvizzer usa o MESMO custo-hora, e o tempo é 60% do tempo atual
    // (5h × 0.60 = 3h) — nunca dividido por quantidade de profissionais.
    expect(resultado.horasZvizzer).toBeCloseTo(5 * FATOR_TEMPO_ZVIZZER, 5);
    expect(resultado.horasZvizzer).toBeCloseTo(3, 5);
    expect(resultado.custoMaoDeObraZvizzer).toBeCloseTo(custoHora * 3, 5);

    expect(resultado.horasLiberadasPorCarro).toBeCloseTo(2, 5);
    expect(resultado.horasLiberadasMes).toBeCloseTo(60, 5);
    expect(resultado.capacidadeFaturamento).toBeCloseTo(60 * 200, 5);
    expect(resultado.impactoEconomicoPotencial).toBeCloseTo(
      resultado.economiaMensal + resultado.capacidadeFaturamento,
      5
    );
  });

  it("quando o tempo atual já é curto, horas liberadas seguem proporcionais (60% do atual)", () => {
    const resultado = calcular(
      {
        polimentosMes: 20,
        precoMedioPolimento: 500,
        horasAtuais: 2,
        custosFixos,
        compostos: [],
        boinas: [],
      },
      zvizzer
    );

    // 2h × 0.60 = 1.2h Zvizzer — sempre mais rápido que o atual, nunca mais.
    expect(resultado.horasZvizzer).toBeCloseTo(1.2, 5);
    expect(resultado.horasLiberadasPorCarro).toBeCloseTo(0.8, 5);
    expect(resultado.horasLiberadasMes).toBeCloseTo(16, 5);
  });

  it("economia pode ser negativa e não deve ser escondida/zerada", () => {
    const resultado = calcular(
      {
        polimentosMes: 10,
        precoMedioPolimento: 200,
        horasAtuais: 1,
        custosFixos: {
          salarioProLabore: 1000,
          aluguel: 0,
          custoFuncionarios: 0,
          demaisDespesas: 0,
        },
        compostos: [{ precoEmbalagem: 10, quantidadeEmbalagemG: 1000, consumoCarroG: 5 }],
        boinas: [],
      },
      { ...zvizzer, compostoPreco: 5000 }
    );

    expect(resultado.economiaPorCarro).toBeLessThan(0);
    expect(resultado.economiaMensal).toBeLessThan(0);
  });

  it("a quantidade de profissionais nunca entra na fórmula: tempo Zvizzer é sempre 60% do atual", () => {
    // Exemplo literal do cliente: equipe de 2 profissionais leva 5 horas
    // corridas. Zvizzer: 5 × 0.60 = 3 horas, com os MESMOS 2 profissionais —
    // nunca 5 / 2 = 2,5h (atual) nem 3 / 2 = 1,5h (Zvizzer).
    const resultado = calcular(
      {
        polimentosMes: 30,
        precoMedioPolimento: 1000,
        horasAtuais: 5,
        custosFixos,
        compostos: [],
        boinas: [],
      },
      zvizzer
    );

    expect(resultado.horasAtuais).toBe(5);
    expect(resultado.horasZvizzer).toBeCloseTo(3, 5);
  });
});
