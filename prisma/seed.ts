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

  // Revendedores de exemplo (fictícios) — o usuário substitui pela lista real
  // via painel admin antes de publicar.
  const revendedoresExemplo = [
    { nome: "Auto Shine Detailing", cidade: "São Paulo", estado: "SP", whatsapp: "5511987654321", latitude: -23.5505, longitude: -46.6333 },
    { nome: "Prime Car Care", cidade: "Campinas", estado: "SP", whatsapp: "5519987654321", latitude: -22.9056, longitude: -47.0608 },
    { nome: "Detail House RJ", cidade: "Rio de Janeiro", estado: "RJ", whatsapp: "5521987654321", latitude: -22.9068, longitude: -43.1729 },
    { nome: "Sul Detailing Studio", cidade: "Porto Alegre", estado: "RS", whatsapp: "5551987654321", latitude: -30.0346, longitude: -51.2177 },
    { nome: "Paraná Polimentos", cidade: "Curitiba", estado: "PR", whatsapp: "5541987654321", latitude: -25.4284, longitude: -49.2733 },
    { nome: "Bahia Car Detail", cidade: "Salvador", estado: "BA", whatsapp: "5571987654321", latitude: -12.9777, longitude: -38.5016 },
    { nome: "Nordeste Shine", cidade: "Recife", estado: "PE", whatsapp: "5581987654321", latitude: -8.0476, longitude: -34.877 },
    { nome: "Central Detailing DF", cidade: "Brasília", estado: "DF", whatsapp: "5561987654321", latitude: -15.7939, longitude: -47.8828 },
  ];

  for (const r of revendedoresExemplo) {
    const existente = await prisma.reseller.findFirst({ where: { nome: r.nome } });
    if (existente) {
      // Garante as coordenadas nos cadastros criados antes do mapa existir.
      await prisma.reseller.update({
        where: { id: existente.id },
        data: { latitude: r.latitude, longitude: r.longitude },
      });
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
