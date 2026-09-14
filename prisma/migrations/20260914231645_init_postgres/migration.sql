-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZvizzerSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "compostoNome" TEXT NOT NULL DEFAULT 'Composto Zvizzer',
    "compostoPreco" DOUBLE PRECISION NOT NULL,
    "compostoPesoG" DOUBLE PRECISION NOT NULL,
    "compostoConsumoG" DOUBLE PRECISION NOT NULL,
    "boinaNome" TEXT NOT NULL DEFAULT 'Boina Zvizzer',
    "boinaPreco" DOUBLE PRECISION NOT NULL,
    "boinaQuantidade" DOUBLE PRECISION NOT NULL,
    "boinaDurabilidadeCarros" DOUBLE PRECISION NOT NULL,
    "tempoProcessoMinutos" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ZvizzerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaborSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "horasBaseMensais" DOUBLE PRECISION NOT NULL DEFAULT 220,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterTrainer" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "miniCv" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterTrainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "consentimentoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "politicaVersao" TEXT NOT NULL,
    "consentimentoTexto" TEXT NOT NULL,
    "polimentosMes" INTEGER NOT NULL,
    "custoAtualPorCarro" DOUBLE PRECISION NOT NULL,
    "custoZvizzerPorCarro" DOUBLE PRECISION NOT NULL,
    "economiaMensal" DOUBLE PRECISION NOT NULL,
    "horasLiberadasMes" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reseller" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "cep" TEXT,
    "logoUrl" TEXT,
    "logoData" BYTEA,
    "logoTipo" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reseller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSession" (
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedCalculation" BOOLEAN NOT NULL DEFAULT false,
    "whatsappClicked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AnalyticsSession_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "step" INTEGER,
    "resellerId" TEXT,
    "estado" TEXT,
    "cidade" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Reseller_estado_cidade_idx" ON "Reseller"("estado", "cidade");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "Reseller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
