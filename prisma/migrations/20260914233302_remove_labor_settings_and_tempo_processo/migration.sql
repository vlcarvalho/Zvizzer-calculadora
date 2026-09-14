-- Regra de negócio (2026-09-14): a referência de horas/mês (220h) e o fator
-- de tempo Zvizzer (60% do tempo atual) passam a ser constantes fixas do
-- motor de cálculo, deixando de ser configuráveis pelo admin.

-- Remove o tempo de processo configurável do ZvizzerSettings.
ALTER TABLE "ZvizzerSettings" DROP COLUMN "tempoProcessoMinutos";

-- Remove a tabela de referência de horas/mês (LaborSettings).
DROP TABLE "LaborSettings";
