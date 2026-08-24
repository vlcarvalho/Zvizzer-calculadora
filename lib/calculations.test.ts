import { describe, expect, it } from "vitest";
import {
  calcular,
  custoBoinaCarro,
  custoCompostoCarro,
  custoHoraColaborador,
  custoHoraEfetivo,
  custoHoraEmpresa,
  custoHoraProprietario,
  horasMensais,
  valorVendaHora,
  type BoinaInput,
  type CompostoInput,
  type LaborParams,
  type ZvizzerParams,
} from "./calculations";

const labor: LaborParams = {
  encargosPatronaisPct: 0.28,
  fgtsPct: 0.08,
  decimoTerceiroPct: 0.0833,
  feriasPct: 0.0833,
  adicionalFeriasPct: 0.0278,
  outrosEncargosPct: 0,
  horasBaseMensalEmpresa: 220,
};

const zvizzer: ZvizzerParams = {
  compostoPreco: 700,
  compostoPesoG: 750,
  compostoConsumoG: 40,
  boinaPreco: 150,
  boinaQuantidade: 1,
  boinaDurabilidadeCarros: 10,
  tempoProcessoMinutos: 180,
};

describe("valorVendaHora", () => {
  it("segue o exemplo do documento: R$1.000 / 5h = R$200/h", () => {
    expect(valorVendaHora(1000, 5)).toBe(200);
  });

  it("retorna 0 em vez de dividir por zero quando horasAtuais é 0", () => {
    expect(valorVendaHora(1000, 0)).toBe(0);
  });
});

describe("custo-hora de mão de obra", () => {
  it("proprietário: pró-labore / (horas_semanais * 4,33)", () => {
    const custo = custoHoraProprietario({
      papel: "proprietario",
      proLabore: 4330,
      horasSemanais: 40,
    });
    // 40 * 4.33 = 173.2 horas/mês; 4330 / 173.2 = 25
    expect(custo).toBeCloseTo(25, 5);
  });

  it("colaborador: inclui salário + benefícios + encargos configuráveis", () => {
    const custo = custoHoraColaborador(
      { papel: "colaborador", salarioBruto: 2000, beneficios: 300, horasSemanais: 44 },
      labor
    );
    const percentual =
      labor.encargosPatronaisPct +
      labor.fgtsPct +
      labor.decimoTerceiroPct +
      labor.feriasPct +
      labor.adicionalFeriasPct +
      labor.outrosEncargosPct;
    const custoMensalEsperado = 2000 + 300 + 2000 * percentual;
    const horasEsperadas = horasMensais(44);
    expect(custo).toBeCloseTo(custoMensalEsperado / horasEsperadas, 5);
  });

  it("equipe: soma o custo-hora de cada membro envolvido", () => {
    const total = custoHoraEfetivo(
      [
        { papel: "proprietario", proLabore: 4330, horasSemanais: 40 },
        { papel: "colaborador", salarioBruto: 2000, beneficios: 300, horasSemanais: 44 },
      ],
      labor
    );
    const esperado =
      custoHoraProprietario({ papel: "proprietario", proLabore: 4330, horasSemanais: 40 }) +
      custoHoraColaborador(
        { papel: "colaborador", salarioBruto: 2000, beneficios: 300, horasSemanais: 44 },
        labor
      );
    expect(total).toBeCloseTo(esperado, 5);
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
  it("reproduz o exemplo do §14 do documento (mesma ordem de grandeza)", () => {
    // Cenário: proprietário, 30 polimentos/mês, R$1.000/polimento, 5h atuais.
    const resultado = calcular(
      {
        polimentosMes: 30,
        precoMedioPolimento: 1000,
        horasAtuais: 5,
        equipe: [{ papel: "proprietario", proLabore: 6000, horasSemanais: 44 }],
        compostos: [{ precoEmbalagem: 300, quantidadeEmbalagemG: 500, consumoCarroG: 60 }],
        boinas: [{ quantidade: 2, precoUnitario: 80, durabilidadeCarros: 8 }],
      },
      zvizzer,
      labor
    );

    expect(resultado.valorVendaHora).toBe(200);
    expect(resultado.horasZvizzer).toBeCloseTo(3, 5); // 180 min / 60
    expect(resultado.horasLiberadasPorCarro).toBeCloseTo(2, 5); // 5h - 3h
    expect(resultado.horasLiberadasMes).toBeCloseTo(60, 5); // 2h * 30
    expect(resultado.capacidadeFaturamento).toBeCloseTo(60 * 200, 5); // 12.000
    expect(resultado.impactoEconomicoPotencial).toBeCloseTo(
      resultado.economiaMensal + resultado.capacidadeFaturamento,
      5
    );
  });

  it("quando o processo atual já é mais rápido que o Zvizzer, horas liberadas = 0 (nunca negativo)", () => {
    const resultado = calcular(
      {
        polimentosMes: 20,
        precoMedioPolimento: 500,
        horasAtuais: 2, // mais rápido que os 3h do Zvizzer
        equipe: [{ papel: "proprietario", proLabore: 5000, horasSemanais: 40 }],
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
    // Processo atual muito barato (compostos/boinas simbólicos, custo-hora baixo)
    // comparado a um parâmetro Zvizzer caro, gerando "diferença de custo" negativa.
    const resultado = calcular(
      {
        polimentosMes: 10,
        precoMedioPolimento: 200,
        horasAtuais: 1,
        equipe: [{ papel: "proprietario", proLabore: 500, horasSemanais: 10 }],
        compostos: [{ precoEmbalagem: 10, quantidadeEmbalagemG: 1000, consumoCarroG: 5 }],
        boinas: [],
      },
      { ...zvizzer, compostoPreco: 5000, tempoProcessoMinutos: 300 },
      labor
    );

    expect(resultado.economiaPorCarro).toBeLessThan(0);
    expect(resultado.economiaMensal).toBeLessThan(0);
  });

  it("modo equipe: custo-hora efetivo é a soma e é reaproveitado no cenário Zvizzer", () => {
    const equipe = [
      { papel: "proprietario" as const, proLabore: 4330, horasSemanais: 40 },
      { papel: "colaborador" as const, salarioBruto: 1800, beneficios: 200, horasSemanais: 40 },
    ];
    const resultado = calcular(
      {
        polimentosMes: 15,
        precoMedioPolimento: 900,
        horasAtuais: 4,
        equipe,
        compostos: [],
        boinas: [],
      },
      zvizzer,
      labor
    );

    const custoHoraEsperado = custoHoraEfetivo(equipe, labor);
    // 2 pessoas na equipe → tempo Zvizzer cai pela metade (3h → 1,5h).
    expect(resultado.horasZvizzer).toBeCloseTo(1.5, 5);
    expect(resultado.numeroPessoas).toBe(2);
    expect(resultado.custoMaoDeObraAtual).toBeCloseTo(custoHoraEsperado * 4, 5);
    expect(resultado.custoMaoDeObraZvizzer).toBeCloseTo(custoHoraEsperado * 1.5, 5);
  });

  it("tempo do processo Zvizzer diminui proporcionalmente ao número de pessoas na equipe", () => {
    const baseInput = {
      polimentosMes: 10,
      precoMedioPolimento: 500,
      horasAtuais: 6,
      compostos: [],
      boinas: [],
    };

    const umaPessoa = calcular(
      { ...baseInput, equipe: [{ papel: "proprietario" as const, proLabore: 5000, horasSemanais: 44 }] },
      zvizzer,
      labor
    );
    const duasPessoas = calcular(
      {
        ...baseInput,
        equipe: [
          { papel: "proprietario" as const, proLabore: 5000, horasSemanais: 44 },
          { papel: "colaborador" as const, salarioBruto: 2000, beneficios: 0, horasSemanais: 44 },
        ],
      },
      zvizzer,
      labor
    );
    const tresPessoas = calcular(
      {
        ...baseInput,
        equipe: [
          { papel: "proprietario" as const, proLabore: 5000, horasSemanais: 44 },
          { papel: "colaborador" as const, salarioBruto: 2000, beneficios: 0, horasSemanais: 44 },
          { papel: "colaborador" as const, salarioBruto: 2000, beneficios: 0, horasSemanais: 44 },
        ],
      },
      zvizzer,
      labor
    );

    // tempoProcessoMinutos = 180 (referência: 1 pessoa sozinha) → 3h.
    expect(umaPessoa.horasZvizzer).toBeCloseTo(3, 5);
    expect(duasPessoas.horasZvizzer).toBeCloseTo(1.5, 5); // metade
    expect(tresPessoas.horasZvizzer).toBeCloseTo(1, 5); // um terço
  });
});

describe("cenário 'empresa com vários funcionários'", () => {
  it("custo-hora = custo fixo mensal / horas base configuradas no admin", () => {
    const custo = custoHoraEmpresa({ papel: "empresa", custoFixoMensal: 20000 }, labor);
    expect(custo).toBeCloseTo(20000 / 220, 5); // ≈ R$90,91/h
  });

  it("retorna 0 em vez de dividir por zero se a referência de horas for 0", () => {
    const custo = custoHoraEmpresa(
      { papel: "empresa", custoFixoMensal: 20000 },
      { ...labor, horasBaseMensalEmpresa: 0 }
    );
    expect(custo).toBe(0);
  });

  it("numeroPessoasPolimento informado explicitamente substitui equipe.length no tempo Zvizzer", () => {
    const resultado = calcular(
      {
        polimentosMes: 30,
        precoMedioPolimento: 1000,
        horasAtuais: 4,
        equipe: [{ papel: "empresa", custoFixoMensal: 20000 }],
        numeroPessoasPolimento: 4, // "empresa" não decompõe pessoa a pessoa
        compostos: [],
        boinas: [],
      },
      zvizzer,
      labor
    );

    expect(resultado.numeroPessoas).toBe(4);
    // tempoProcessoMinutos = 180min = 3h; com 4 pessoas, 3h/4 = 0,75h.
    expect(resultado.horasZvizzer).toBeCloseTo(0.75, 5);
    const custoHoraEsperado = custoHoraEmpresa({ papel: "empresa", custoFixoMensal: 20000 }, labor);
    expect(resultado.custoMaoDeObraZvizzer).toBeCloseTo(custoHoraEsperado * 0.75, 5);
  });

  it("sem numeroPessoasPolimento, cai de volta para equipe.length (1, no modo empresa)", () => {
    const resultado = calcular(
      {
        polimentosMes: 30,
        precoMedioPolimento: 1000,
        horasAtuais: 4,
        equipe: [{ papel: "empresa", custoFixoMensal: 20000 }],
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
