-- LaborSettings passa a guardar apenas a referência de horas/mês usada para
-- converter o custo fixo mensal da operação em custo-hora. Os percentuais de
-- encargos saíram: o usuário agora informa "Custo Funcionários" já fechado.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_LaborSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "horasBaseMensais" REAL NOT NULL DEFAULT 220,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_LaborSettings" ("id", "horasBaseMensais", "updatedAt")
SELECT "id", "horasBaseMensalEmpresa", "updatedAt" FROM "LaborSettings";

DROP TABLE "LaborSettings";
ALTER TABLE "new_LaborSettings" RENAME TO "LaborSettings";

PRAGMA foreign_keys=ON;
