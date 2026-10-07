import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Parâmetros do processo padrão Zvizzer (spec §9 — valores de referência iniciais).
  await prisma.zvizzerSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      compostoNome: "Composto Zvizzer",
      compostoPreco: 650,
      compostoPesoG: 750,
      compostoConsumoG: 40,
      boinaNome: "Boina Zvizzer",
      boinaPreco: 130,
      boinaQuantidade: 1,
      boinaDurabilidadeCarros: 10,
    },
  });

  // Referência de horas/mês (220h) e o fator de tempo Zvizzer (60% do tempo
  // atual) são constantes fixas do motor de cálculo (lib/calculations.ts),
  // não configuráveis no admin — não há seed para elas.

  // Rede credenciada real (planilha "Dados Revendedores"). Coordenadas obtidas
  // do CEP via ViaCEP + Nominatim; onde o CEP não resolveu no nível da rua, o
  // pino cai no centro da cidade.
  //
  // WhatsApps em E.164 (55 + DDD + 9 dígitos). Quatro deles vieram da planilha
  // no formato antigo de 8 dígitos e receberam o 9 após o DDD, confirmado pela
  // Zvizzer: Confraria do Detailing, Maju, Dandi e Atual Comércio.
  const revendedores = [
    { nome: "Arruda Comércio", cidade: "Boa Vista", estado: "RR", whatsapp: "5595991178787", cep: "69304-360", logoUrl: "/revendedores/arruda-comercio.png", latitude: 2.8201816, longitude: -60.6892065 },
    { nome: "Estudio Car Detalhamento", cidade: "Juiz de Fora", estado: "MG", whatsapp: "5511940835411", cep: "36025-430", logoUrl: "/revendedores/estudio-car.png", latitude: -21.7765957, longitude: -43.3615425 },
    { nome: "Cris Car Care", cidade: "Novo Hamburgo", estado: "RS", whatsapp: "5551991657705", cep: "93344-460", logoUrl: "/revendedores/cris-car-care.png", latitude: -29.6835575, longitude: -51.1467416 },
    { nome: "Breves Detail", cidade: "Rio de Janeiro", estado: "RJ", whatsapp: "5521980923793", cep: "23942-345", logoUrl: "/revendedores/breves-detail.png", latitude: -22.9110137, longitude: -43.2093727 },
    { nome: "NR Estética", cidade: "São Paulo", estado: "SP", whatsapp: "5511953270065", cep: "08011-310", logoUrl: "/revendedores/nr-estetica.png", latitude: -23.4944119, longitude: -46.4444514 },
    { nome: "Confraria do Detailing", cidade: "Blumenau", estado: "SC", whatsapp: "5547999071432", cep: "89035-200", logoUrl: "/revendedores/confraria-do-detailing.png", latitude: -26.908409, longitude: -49.082358 },
    { nome: "Neri Store", cidade: "Sorocaba", estado: "SP", whatsapp: "5511997271303", cep: "18040-000", logoUrl: "/revendedores/neri-store.png", latitude: -23.5003451, longitude: -47.4582864 },
    { nome: "Maju Produtos", cidade: "Biguaçu", estado: "SC", whatsapp: "5548996159317", cep: "88161-708", logoUrl: "/revendedores/maju-produtos.png", latitude: -27.508885, longitude: -48.6524613 },
    { nome: "Dandi Produtos", cidade: "Caxias do Sul", estado: "RS", whatsapp: "5554999082103", cep: "95041-423", logoUrl: "/revendedores/dandi-produtos.png", latitude: -29.1495217, longitude: -51.1738036 },
    { nome: "Atual Comércio", cidade: "Brasília", estado: "DF", whatsapp: "5561985020239", cep: "72035-502", logoUrl: "/revendedores/atual-comercio.png", latitude: -15.7939869, longitude: -47.8828 },
    { nome: "MCC", cidade: "Londrina", estado: "PR", whatsapp: "5543991927409", cep: "86046-010", logoUrl: "/revendedores/mcc.png", latitude: -23.3112878, longitude: -51.1595023 },
    { nome: "Milano", cidade: "Goiânia", estado: "GO", whatsapp: "5562985749737", cep: "74835-605", logoUrl: "/revendedores/milano.png", latitude: -16.7251864, longitude: -49.279322 },
  ];

  // Tira da base os revendedores fictícios usados enquanto a lista real não
  // existia, para não misturar com a rede credenciada de verdade.
  await prisma.reseller.deleteMany({
    where: { nome: { notIn: revendedores.map((r) => r.nome) } },
  });

  for (const r of revendedores) {
    const existente = await prisma.reseller.findFirst({ where: { nome: r.nome } });
    if (existente) {
      await prisma.reseller.update({ where: { id: existente.id }, data: r });
    } else {
      await prisma.reseller.create({ data: r });
    }
  }

  // Master Trainers: nomes reais informados pela Zvizzer; foto e mini-CV
  // ficam para a equipe preencher no painel admin (o texto abaixo é
  // propositalmente marcado como exemplo, para ninguém confundir com
  // credencial real).
  // A foto é única do time (public/master-trainers/grupo.jpg); aqui ficam só
  // os nomes, na ordem em que aparecem embaixo dela.
  const masterTrainers = [
    "Pablo Neves",
    "Nivaldo Habache",
    "Priscila Breves",
    "Márcio King",
    "Diego Rafael",
    "Marcos Cogorne",
  ];

  const miniCvExemplo =
    "Master Trainer oficial Zvizzer. (Texto de exemplo — substituir pelo mini-CV real no painel admin.)";

  for (const [i, nome] of masterTrainers.entries()) {
    const existente = await prisma.masterTrainer.findFirst({ where: { nome } });
    if (existente) {
      // Mantém o mini-CV que a equipe já tiver escrito; só garante a ordem.
      await prisma.masterTrainer.update({ where: { id: existente.id }, data: { ordem: i } });
    } else {
      await prisma.masterTrainer.create({
        data: { nome, ordem: i, miniCv: miniCvExemplo },
      });
    }
  }

  // Cadastros antigos que viraram outra coisa ao longo dos ajustes.
  await prisma.masterTrainer.deleteMany({
    where: {
      nome: { in: ["Diego", "Marcos", "Diego e Marcos", "Diego Rafael e Marcos Cogorne"] },
    },
  });

  console.log(
    "Seed concluído: parâmetros Zvizzer, horas de referência, revendedores e Master Trainers."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
