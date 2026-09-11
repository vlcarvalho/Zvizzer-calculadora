import { describe, expect, it } from "vitest";
import {
  calcular,
  custoBoinaCarro,
  custoCompostoCarro,
  custoFixoMensalTotal,
  custoHoraOperacao,
  valorVendaHora,
  type BoinaInput,
  type CompostoInput,
  type CustosFixosInput,
  type LaborParams,
  type ZvizzerParams,
} from "./calculations";

const labor: LaborParams = { horasBaseMensais: 220 };

const zvizzer: ZvizzerParams = {
  compostoPreco: 700,
  compostoPesoG: 750,
  compostoConsumoG: 40,
  boinaPreco: 150,
  boinaQuantidade: 1,
  boinaDurabilidadeCarros: 10,
  tempoProcessoMinutos: 180,
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

  it("divide o custo fixo pela referência de horas/mês do admin", () => {
    // Exemplo do cliente: R$20.000 / 220h ≈ R$90,91/h
    expect(custoHoraOperacao(custosFixos, labor)).toBeCloseTo(20000 / 220, 5);
  });

  it("acompanha a referência de horas configurada (200h em vez de 220h)", () => {
    expect(custoHoraOperacao(custosFixos, { horasBaseMensais: 200 })).toBeCloseTo(100, 5);
  });

  it("retorna 0 em vez de dividir por zero se a referência de horas for 0", () => {
    expect(custoHoraOperacao(custosFixos, { horasBaseMensais: 0 })).toBe(0);
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
      zvizzer,
      labor
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

    // Zvizzer usa o MESMO custo-hora, variando só o tempo (180min = 3h)
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

  it("quando o processo atual já é mais rápido que o Zvizzer, horas liberadas = 0", () => {
    const resultado = calcular(
      {
        polimentosMes: 20,
        precoMedioPolimento: 500,
        horasAtuais: 2, // mais rápido que as 3h do Zvizzer
        custosFixos,
        compostos: [],
        boinas: [],
      },
      zvizzer,
      labor
    );

    expect(resultado.horasLiberadasPorCarro).toBe(0);
    expect(resultado.horasLiberadasMes).toBe(0);
    expect(resultado.capacidadeFaturamento).toBe(0);
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
      { ...zvizzer, compostoPreco: 5000, tempoProcessoMinutos: 300 },
      labor
    );

    expect(resultado.economiaPorCarro).toBeLessThan(0);
    expect(resultado.economiaMensal).toBeLessThan(0);
  });

  it("numeroPessoasPolimento, quando informado, divide o tempo Zvizzer", () => {
    const resultado = calcular(
      {
        polimentosMes: 30,
        precoMedioPolimento: 1000,
        horasAtuais: 4,
        custosFixos,
        numeroPessoasPolimento: 3,
        compostos: [],
        boinas: [],
      },
      zvizzer,
      labor
    );

    expect(resultado.numeroPessoas).toBe(3);
    expect(resultado.horasZvizzer).toBeCloseTo(1, 5); // 3h / 3 pessoas
  });

  it("sem numeroPessoasPolimento, o tempo Zvizzer é o configurado no admin", () => {
    const resultado = calcular(
      {
        polimentosMes: 30,
        precoMedioPolimento: 1000,
        horasAtuais: 4,
        custosFixos,
        compostos: [],
        boinas: [],
      },
      zvizzer,
      labor
    );

    expect(resultado.numeroPessoas).toBe(1);
    expect(resultado.horasZvizzer).toBeCloseTo(3, 5);
  });
});
