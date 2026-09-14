"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

interface MasterTrainer {
  id: string;
  nome: string;
  fotoUrl: string | null;
  miniCv: string;
  ordem: number;
  ativo: boolean;
}

const FORM_VAZIO = { nome: "", miniCv: "", ordem: 0, ativo: true };

export default function AdminMasterTrainersPage() {
  const [trainers, setTrainers] = useState<MasterTrainer[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    setCarregando(true);
    fetch("/api/admin/master-trainers")
      .then((r) => r.json())
      .then((data) => setTrainers(data.trainers ?? []))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    fetch("/api/admin/master-trainers")
      .then((r) => r.json())
      .then((data) => setTrainers(data.trainers ?? []))
      .finally(() => setCarregando(false));
  }, []);

  function iniciarNovo() {
    setEditandoId(null);
    setForm({ ...FORM_VAZIO, ordem: trainers.length });
    setErro(null);
    setMostrarForm(true);
  }

  function iniciarEdicao(t: MasterTrainer) {
    setEditandoId(t.id);
    setForm({
      nome: t.nome,
      miniCv: t.miniCv,
      ordem: t.ordem,
      ativo: t.ativo,
    });
    setErro(null);
    setMostrarForm(true);
  }

  async function handleSalvar() {
    setErro(null);
    const res = await fetch("/api/admin/master-trainers", {
      method: editandoId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editandoId ? { id: editandoId, ...form } : form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error ?? "Não foi possível salvar.");
      return;
    }

    setMostrarForm(false);
    carregar();
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este Master Trainer?")) return;
    await fetch("/api/admin/master-trainers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    carregar();
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Master Trainers</h1>
        <Button onClick={iniciarNovo} fullWidth={false} className="w-fit px-6">
          + Novo
        </Button>
      </div>

      <p className="text-sm text-muted">
        Os nomes aparecem no fim do resultado da calculadora, embaixo da foto do time. A foto é
        única para todos e fica em{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 text-xs">
          public/master-trainers/grupo.jpg
        </code>
        ; para trocá-la, basta substituir esse arquivo.
      </p>

      {mostrarForm && (
        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
          <h2 className="mb-4 font-bold">
            {editandoId ? "Editar Master Trainer" : "Novo Master Trainer"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome">
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-foreground focus:border-accent focus:outline-none"
              />
            </Field>
            <Field label="Ordem de exibição">
              <input
                type="number"
                value={form.ordem}
                onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 tabular-nums text-foreground focus:border-accent focus:outline-none"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Mini-CV (até ~4 linhas)">
              <textarea
                rows={4}
                value={form.miniCv}
                onChange={(e) => setForm({ ...form, miniCv: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </Field>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            Ativo (visível na calculadora)
          </label>

          {erro && <p className="mt-3 text-sm text-danger">{erro}</p>}

          <div className="mt-5 flex gap-3">
            <Button onClick={handleSalvar} fullWidth={false} className="px-8">
              Salvar
            </Button>
            <Button
              variant="secondary"
              fullWidth={false}
              className="px-8"
              onClick={() => setMostrarForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {carregando ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {trainers.map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {t.nome}{" "}
                  <span className={`ml-2 text-xs ${t.ativo ? "text-accent" : "text-muted"}`}>
                    {t.ativo ? "Ativo" : "Inativo"}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted">{t.miniCv}</p>
              </div>
              <div className="shrink-0 text-right text-sm">
                <button
                  onClick={() => iniciarEdicao(t)}
                  className="mr-3 text-muted hover:text-foreground"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(t.id)}
                  className="text-danger hover:underline"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
