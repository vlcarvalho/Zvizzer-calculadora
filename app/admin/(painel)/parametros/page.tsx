"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

interface ZvizzerSettings {
  compostoNome: string;
  compostoPreco: number;
  compostoPesoG: number;
  compostoConsumoG: number;
  boinaNome: string;
  boinaPreco: number;
  boinaQuantidade: number;
  boinaDurabilidadeCarros: number;
  tempoProcessoMinutos: number;
}

interface LaborSettings {
  horasBaseMensais: number;
}

export default function AdminParametrosPage() {
  const [zvizzer, setZvizzer] = useState<ZvizzerSettings | null>(null);
  const [labor, setLabor] = useState<LaborSettings | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setZvizzer(data.zvizzer);
        setLabor(data.labor);
      })
      .finally(() => setCarregando(false));
  }, []);

  async function handleSalvar() {
    if (!zvizzer || !labor) return;
    setSalvando(true);
    setMensagem(null);

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zvizzer, labor }),
    });

    setSalvando(false);
    setMensagem(res.ok ? "Parâmetros salvos com sucesso." : "Erro ao salvar. Verifique os valores.");
  }

  if (carregando) return <p className="text-muted">Carregando…</p>;
  if (!zvizzer || !labor) return <p className="text-danger">Não foi possível carregar.</p>;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <div>
        <h1 className="text-2xl font-bold">Parâmetros</h1>
        <p className="mt-1 text-sm text-muted">
          Estes valores alimentam o cenário &quot;Processo Zvizzer&quot; e o custo de
          colaboradores em toda a calculadora. Revise com cuidado antes de salvar.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Processo Zvizzer</h2>
        <p className="text-xs text-muted">
          Os nomes dos produtos aparecem na tabela comparativa mostrada ao usuário no resultado
          da calculadora.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextoField
            label="Nome do composto"
            value={zvizzer.compostoNome}
            onChange={(v) => setZvizzer({ ...zvizzer, compostoNome: v })}
          />
          <TextoField
            label="Nome da boina"
            value={zvizzer.boinaNome}
            onChange={(v) => setZvizzer({ ...zvizzer, boinaNome: v })}
          />
          <NumeroField
            label="Preço do composto (R$)"
            value={zvizzer.compostoPreco}
            onChange={(v) => setZvizzer({ ...zvizzer, compostoPreco: v })}
          />
          <NumeroField
            label="Peso da embalagem (g)"
            value={zvizzer.compostoPesoG}
            onChange={(v) => setZvizzer({ ...zvizzer, compostoPesoG: v })}
          />
          <NumeroField
            label="Consumo médio por carro (g)"
            value={zvizzer.compostoConsumoG}
            onChange={(v) => setZvizzer({ ...zvizzer, compostoConsumoG: v })}
          />
          <NumeroField
            label="Preço da boina (R$)"
            value={zvizzer.boinaPreco}
            onChange={(v) => setZvizzer({ ...zvizzer, boinaPreco: v })}
          />
          <NumeroField
            label="Quantidade de boinas"
            value={zvizzer.boinaQuantidade}
            onChange={(v) => setZvizzer({ ...zvizzer, boinaQuantidade: v })}
          />
          <NumeroField
            label="Durabilidade (carros)"
            value={zvizzer.boinaDurabilidadeCarros}
            onChange={(v) => setZvizzer({ ...zvizzer, boinaDurabilidadeCarros: v })}
          />
          <NumeroField
            label="Tempo médio do processo (min)"
            value={zvizzer.tempoProcessoMinutos}
            onChange={(v) => setZvizzer({ ...zvizzer, tempoProcessoMinutos: v })}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Custo-hora da operação</h2>
        <p className="text-xs text-muted">
          O usuário informa os custos fixos mensais (pró-labore, aluguel, funcionários e demais
          despesas) e o custo-hora sai da soma dividida por esta referência de horas/mês.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumeroField
            label="Horas/mês de referência"
            value={labor.horasBaseMensais}
            onChange={(v) => setLabor({ ...labor, horasBaseMensais: v })}
          />
        </div>
      </section>

      {mensagem && <p className="text-sm text-accent">{mensagem}</p>}

      <Button onClick={handleSalvar} disabled={salvando} fullWidth={false} className="w-fit px-10">
        {salvando ? "Salvando…" : "Salvar parâmetros"}
      </Button>
    </div>
  );
}

function TextoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-foreground focus:border-accent focus:outline-none"
      />
    </Field>
  );
}

function NumeroField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base tabular-nums text-foreground focus:border-accent focus:outline-none"
      />
    </Field>
  );
}
