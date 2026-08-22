-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ZvizzerSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "compostoPreco" REAL NOT NULL,
    "compostoPesoG" REAL NOT NULL,
    "compostoConsumoG" REAL NOT NULL,
    "boinaPreco" REAL NOT NULL,
    "boinaQuantidade" REAL NOT NULL,
    "boinaDurabilidadeCarros" REAL NOT NULL,
    "tempoProcessoMinutos" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "LaborSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "encargosPatronaisPct" REAL NOT NULL,
    "fgtsPct" REAL NOT NULL,
    "decimoTerceiroPct" REAL NOT NULL,
    "feriasPct" REAL NOT NULL,
    "adicionalFeriasPct" REAL NOT NULL,
    "outrosEncargosPct" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reseller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalyticsSession" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedCalculation" BOOLEAN NOT NULL DEFAULT false,
    "whatsappClicked" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "step" INTEGER,
    "resellerId" TEXT,
    "estado" TEXT,
    "cidade" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnalyticsEvent_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "Reseller" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "Reseller_estado_cidade_idx" ON "Reseller"("estado", "cidade");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");
