import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Parâmetros do processo padrão Zvizzer (spec §9 — valores de referência iniciais).
  await prisma.zvizzerSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      compostoPreco: 700,
      compostoPesoG: 750,
      compostoConsumoG: 40,
      boinaPreco: 150,
      boinaQuantidade: 1,
      boinaDurabilidadeCarros: 10,
      tempoProcessoMinutos: 180,
    },
  });

  // Parâmetros de encargos/provisões trabalhistas (percentuais configuráveis,
  // nunca hardcoded na aplicação — spec §5). Valores iniciais de referência;
  // revisar com contabilidade antes da publicação definitiva.
  await prisma.laborSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      encargosPatronaisPct: 0.28, // INSS patronal + terceiros (referência)
      fgtsPct: 0.08,
      decimoTerceiroPct: 0.0833, // 1/12
      feriasPct: 0.0833, // 1/12
      adicionalFeriasPct: 0.0278, // 1/3 de férias, prorateado (1/12 * 1/3)
      outrosEncargosPct: 0,
    },
  });

  // Revendedores de exemplo (fictícios) — o usuário substitui pela lista real
  // via painel admin antes de publicar.
  const revendedoresExemplo = [
    { nome: "Auto Shine Detailing", cidade: "São Paulo", estado: "SP", whatsapp: "5511987654321" },
    { nome: "Prime Car Care", cidade: "Campinas", estado: "SP", whatsapp: "5519987654321" },
    { nome: "Detail House RJ", cidade: "Rio de Janeiro", estado: "RJ", whatsapp: "5521987654321" },
    { nome: "Sul Detailing Studio", cidade: "Porto Alegre", estado: "RS", whatsapp: "5551987654321" },
    { nome: "Paraná Polimentos", cidade: "Curitiba", estado: "PR", whatsapp: "5541987654321" },
    { nome: "Bahia Car Detail", cidade: "Salvador", estado: "BA", whatsapp: "5571987654321" },
    { nome: "Nordeste Shine", cidade: "Recife", estado: "PE", whatsapp: "5581987654321" },
    { nome: "Central Detailing DF", cidade: "Brasília", estado: "DF", whatsapp: "5561987654321" },
  ];

  for (const r of revendedoresExemplo) {
    const existente = await prisma.reseller.findFirst({ where: { nome: r.nome } });
    if (!existente) {
      await prisma.reseller.create({ data: r });
    }
  }

  console.log("Seed concluído: parâmetros Zvizzer, mão de obra e revendedores de exemplo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
