-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ZvizzerSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "compostoNome" TEXT NOT NULL DEFAULT 'Composto Zvizzer',
    "compostoPreco" REAL NOT NULL,
    "compostoPesoG" REAL NOT NULL,
    "compostoConsumoG" REAL NOT NULL,
    "boinaNome" TEXT NOT NULL DEFAULT 'Boina Zvizzer',
    "boinaPreco" REAL NOT NULL,
    "boinaQuantidade" REAL NOT NULL,
    "boinaDurabilidadeCarros" REAL NOT NULL,
    "tempoProcessoMinutos" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);
INSERT INTO "new_ZvizzerSettings" ("boinaDurabilidadeCarros", "boinaPreco", "boinaQuantidade", "compostoConsumoG", "compostoPesoG", "compostoPreco", "id", "tempoProcessoMinutos", "updatedAt", "updatedBy") SELECT "boinaDurabilidadeCarros", "boinaPreco", "boinaQuantidade", "compostoConsumoG", "compostoPesoG", "compostoPreco", "id", "tempoProcessoMinutos", "updatedAt", "updatedBy" FROM "ZvizzerSettings";
DROP TABLE "ZvizzerSettings";
ALTER TABLE "new_ZvizzerSettings" RENAME TO "ZvizzerSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
