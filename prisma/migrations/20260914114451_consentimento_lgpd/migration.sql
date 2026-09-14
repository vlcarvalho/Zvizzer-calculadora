-- Registro da prova de consentimento (LGPD art. 8º, §1º: cabe ao controlador
-- demonstrar que o consentimento foi obtido). Os contatos criados antes desta
-- mudança ficam marcados como anteriores ao consentimento explícito.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "consentimentoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "politicaVersao" TEXT NOT NULL,
    "consentimentoTexto" TEXT NOT NULL,
    "polimentosMes" INTEGER NOT NULL,
    "custoAtualPorCarro" REAL NOT NULL,
    "custoZvizzerPorCarro" REAL NOT NULL,
    "economiaMensal" REAL NOT NULL,
    "horasLiberadasMes" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_Lead" (
    "id", "email", "whatsapp", "consentimentoEm", "politicaVersao", "consentimentoTexto",
    "polimentosMes", "custoAtualPorCarro", "custoZvizzerPorCarro", "economiaMensal",
    "horasLiberadasMes", "createdAt"
)
SELECT
    "id", "email", "whatsapp", "createdAt", 'pre-consentimento',
    'Registro anterior à implementação do consentimento explícito (teste interno).',
    "polimentosMes", "custoAtualPorCarro", "custoZvizzerPorCarro", "economiaMensal",
    "horasLiberadasMes", "createdAt"
FROM "Lead";

DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";

CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

PRAGMA foreign_keys=ON;
