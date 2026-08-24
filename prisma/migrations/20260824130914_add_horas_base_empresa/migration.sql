-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LaborSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "encargosPatronaisPct" REAL NOT NULL,
    "fgtsPct" REAL NOT NULL,
    "decimoTerceiroPct" REAL NOT NULL,
    "feriasPct" REAL NOT NULL,
    "adicionalFeriasPct" REAL NOT NULL,
    "outrosEncargosPct" REAL NOT NULL,
    "horasBaseMensalEmpresa" REAL NOT NULL DEFAULT 220,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LaborSettings" ("adicionalFeriasPct", "decimoTerceiroPct", "encargosPatronaisPct", "feriasPct", "fgtsPct", "id", "outrosEncargosPct", "updatedAt") SELECT "adicionalFeriasPct", "decimoTerceiroPct", "encargosPatronaisPct", "feriasPct", "fgtsPct", "id", "outrosEncargosPct", "updatedAt" FROM "LaborSettings";
DROP TABLE "LaborSettings";
ALTER TABLE "new_LaborSettings" RENAME TO "LaborSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
