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
      compostoPreco: 700,
      compostoPesoG: 750,
      compostoConsumoG: 40,
      boinaNome: "Boina Zvizzer",
      boinaPreco: 150,
      boinaQuantidade: 1,
      boinaDurabilidadeCarros: 10,
      tempoProcessoMinutos: 180,
    },
  });

  // Referência de horas/mês usada para converter o custo fixo mensal da
  // operação em custo-hora (configurável no admin, nunca hardcoded).
  await prisma.laborSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      horasBaseMensais: 220, // referência de mercado
    },
  });

  // Rede credenciada real (planilha "Dados Revendedores"). Coordenadas obtidas
  // do CEP via ViaCEP + Nominatim; onde o CEP não resolveu no nível da rua, o
  // pino cai no centro da cidade.
  //
  // ATENÇÃO: quatro WhatsApps vieram da planilha com 8 dígitos (formato antigo,
  // sem o 9 inicial) — marcados abaixo. Enquanto não forem confirmados, o link
  // do wa.me não abre conversa. Preferi manter o número como veio a chutar um
  // dígito e mandar o cliente para a pessoa errada.
  const revendedores = [
    { nome: "Arruda Comércio", cidade: "Boa Vista", estado: "RR", whatsapp: "5595991178787", cep: "69304-360", logoUrl: "/revendedores/arruda-comercio.png", latitude: 2.8201816, longitude: -60.6892065 },
    { nome: "Estudio Car Detalhamento", cidade: "Juiz de Fora", estado: "MG", whatsapp: "5511940835411", cep: "36025-430", logoUrl: null, latitude: -21.7765957, longitude: -43.3615425 },
    { nome: "Cris Car Care", cidade: "Novo Hamburgo", estado: "RS", whatsapp: "5551991657705", cep: "93344-460", logoUrl: "/revendedores/cris-car-care.png", latitude: -29.6835575, longitude: -51.1467416 },
    { nome: "Breves Detail", cidade: "Rio de Janeiro", estado: "RJ", whatsapp: "5521980923793", cep: "23942-345", logoUrl: "/revendedores/breves-detail.png", latitude: -22.9110137, longitude: -43.2093727 },
    { nome: "NR Estética", cidade: "São Paulo", estado: "SP", whatsapp: "5511953270065", cep: "08011-310", logoUrl: null, latitude: -23.4944119, longitude: -46.4444514 },
    // WhatsApp com 8 dígitos na planilha: (47) 9907-1432
    { nome: "Confraria do Detailing", cidade: "Blumenau", estado: "SC", whatsapp: "554799071432", cep: "89035-200", logoUrl: "/revendedores/confraria-do-detailing.png", latitude: -26.908409, longitude: -49.082358 },
    { nome: "Neri Store", cidade: "Sorocaba", estado: "SP", whatsapp: "5511997271303", cep: "18040-000", logoUrl: "/revendedores/neri-store.png", latitude: -23.5003451, longitude: -47.4582864 },
    // WhatsApp com 8 dígitos na planilha: (48) 9615-9317
    { nome: "Maju Produtos", cidade: "Biguaçu", estado: "SC", whatsapp: "554896159317", cep: "88161-708", logoUrl: "/revendedores/maju-produtos.png", latitude: -27.508885, longitude: -48.6524613 },
    // WhatsApp com 8 dígitos na planilha: (54) 9908-2103
    { nome: "Dandi Produtos", cidade: "Caxias do Sul", estado: "RS", whatsapp: "545499082103", cep: "95041-423", logoUrl: "/revendedores/dandi-produtos.png", latitude: -29.1495217, longitude: -51.1738036 },
    // WhatsApp com 8 dígitos na planilha: (61) 8502-0239
    { nome: "Atual Comércio", cidade: "Brasília", estado: "DF", whatsapp: "556185020239", cep: "72035-502", logoUrl: null, latitude: -15.7939869, longitude: -47.8828 },
    { nome: "MCC", cidade: "Londrina", estado: "PR", whatsapp: "5543991927409", cep: "86046-010", logoUrl: "/revendedores/mcc.png", latitude: -23.3112878, longitude: -51.1595023 },
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
