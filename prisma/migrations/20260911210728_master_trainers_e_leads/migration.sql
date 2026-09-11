-- CreateTable
CREATE TABLE "MasterTrainer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "miniCv" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "polimentosMes" INTEGER NOT NULL,
    "custoAtualPorCarro" REAL NOT NULL,
    "custoZvizzerPorCarro" REAL NOT NULL,
    "economiaMensal" REAL NOT NULL,
    "horasLiberadasMes" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
