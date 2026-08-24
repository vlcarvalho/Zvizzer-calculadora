"use client";

import { useCalculatorStore, type TipoMaoDeObra } from "@/lib/store/calculator-store";
import type { MembroInput } from "@/lib/calculations";
import { Field } from "@/components/ui/Field";
import { NumericInput } from "@/components/ui/NumericInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

const OPCOES: { valor: TipoMaoDeObra; label: string }[] = [
  { valor: "proprietario", label: "Eu mesmo, proprietário" },
  { valor: "colaborador", label: "Um colaborador" },
  { valor: "equipe", label: "Eu e minha equipe" },
  { valor: "empresa", label: "Empresa com vários funcionários" },
];

interface StepMaoDeObraProps {
  erros: Record<string, string>;
}

export function StepMaoDeObra({ erros }: StepMaoDeObraProps) {
  const {
    tipoMaoDeObra,
    setTipoMaoDeObra,
    membros,
    setMembro,
    adicionarMembro,
    removerMembro,
    numeroPessoasEmpresa,
    setNumeroPessoasEmpresa,
  } = useCalculatorStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Mão de obra</h2>
        <p className="mt-1 text-muted">Quem normalmente realiza o polimento?</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {OPCOES.map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            onClick={() => setTipoMaoDeObra(opcao.valor)}
            className={clsx(
              "rounded-2xl border px-5 py-4 text-left text-base font-medium transition-colors",
              tipoMaoDeObra === opcao.valor
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border bg-surface text-muted hover:border-chrome-2"
            )}
          >
            {opcao.label}
          </button>
        ))}
      </div>

      {tipoMaoDeObra === "empresa" && (
        <Field
          label="Quantas pessoas trabalham na etapa de polimento, em média?"
          hint="Usado só para dividir o tempo do processo Zvizzer entre a equipe — o custo já vem do valor fixo abaixo."
          error={erros.numeroPessoasEmpresa}
        >
          <NumericInput
            value={numeroPessoasEmpresa || ""}
            onChange={setNumeroPessoasEmpresa}
            placeholder="Ex.: 4"
            suffix="pessoas"
          />
        </Field>
      )}

      {tipoMaoDeObra !== "equipe" ? (
        <MembroCampos
          membro={membros[0]}
          onChange={(m) => setMembro(0, m)}
          erros={erros}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {membros.map((membro, i) => (
            <div key={i} className="rounded-2xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">
                  Pessoa {i + 1}
                </span>
                {membros.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerMembro(i)}
                    className="text-xs text-danger"
                  >
                    Remover
                  </button>
                )}
              </div>
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMembro(i, { papel: "proprietario", proLabore: 0, horasSemanais: 44 })
                  }
                  className={clsx(
                    "flex-1 rounded-xl border px-3 py-2 text-sm",
                    membro.papel === "proprietario"
                      ? "border-accent text-foreground"
                      : "border-border text-muted"
                  )}
                >
                  Proprietário
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMembro(i, {
                      papel: "colaborador",
                      salarioBruto: 0,
                      beneficios: 0,
                      horasSemanais: 44,
                    })
                  }
                  className={clsx(
                    "flex-1 rounded-xl border px-3 py-2 text-sm",
                    membro.papel === "colaborador"
                      ? "border-accent text-foreground"
                      : "border-border text-muted"
                  )}
                >
                  Colaborador
                </button>
              </div>
              <MembroCampos
                membro={membro}
                onChange={(m) => setMembro(i, m)}
                erros={{}}
              />
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={adicionarMembro}>
            + Adicionar pessoa
          </Button>
        </div>
      )}
    </div>
  );
}

function MembroCampos({
  membro,
  onChange,
  erros,
}: {
  membro: MembroInput;
  onChange: (m: MembroInput) => void;
  erros: Record<string, string>;
}) {
  if (membro.papel === "proprietario") {
    return (
      <div className="flex flex-col gap-4">
        <Field
          label="Quanto você precisa retirar por mês como pró-labore/remuneração?"
          error={erros.proLabore}
        >
          <CurrencyInput
            value={membro.proLabore}
            onChange={(v) => onChange({ ...membro, proLabore: v })}
          />
        </Field>
        <Field
          label="Quantas horas você trabalha, em média, por semana?"
          error={erros.horasSemanais}
        >
          <NumericInput
            value={membro.horasSemanais || ""}
            onChange={(v) => onChange({ ...membro, horasSemanais: v })}
            suffix="horas/semana"
          />
        </Field>
      </div>
    );
  }

  if (membro.papel === "empresa") {
    return (
      <Field
        label="Qual o custo fixo mensal da operação?"
        hint="Some tudo: folha, aluguel, insumos fixos etc."
        error={erros.custoFixoMensal}
      >
        <CurrencyInput
          value={membro.custoFixoMensal}
          onChange={(v) => onChange({ ...membro, custoFixoMensal: v })}
        />
      </Field>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Salário bruto mensal" error={erros.salarioBruto}>
        <CurrencyInput
          value={membro.salarioBruto}
          onChange={(v) => onChange({ ...membro, salarioBruto: v })}
        />
      </Field>
      <Field label="Benefícios mensais pagos pela empresa" error={erros.beneficios}>
        <CurrencyInput
          value={membro.beneficios}
          onChange={(v) => onChange({ ...membro, beneficios: v })}
        />
      </Field>
      <Field label="Jornada semanal" error={erros.horasSemanais}>
        <NumericInput
          value={membro.horasSemanais || ""}
          onChange={(v) => onChange({ ...membro, horasSemanais: v })}
          suffix="horas/semana"
        />
      </Field>
    </div>
  );
}
