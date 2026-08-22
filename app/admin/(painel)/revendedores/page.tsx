"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

interface Reseller {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  whatsapp: string;
  ativo: boolean;
}

const FORM_VAZIO = { nome: "", cidade: "", estado: "", whatsapp: "", ativo: true };

export default function AdminRevendedoresPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    setCarregando(true);
    fetch("/api/admin/resellers")
      .then((r) => r.json())
      .then((data) => setResellers(data.resellers ?? []))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    // Carga inicial: `carregando` já começa `true`, então não precisamos
    // chamar setState síncrono aqui dentro do efeito (regra
    // react-hooks/set-state-in-effect) — só disparamos o fetch.
    fetch("/api/admin/resellers")
      .then((r) => r.json())
      .then((data) => setResellers(data.resellers ?? []))
      .finally(() => setCarregando(false));
  }, []);

  function iniciarNovo() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro(null);
    setMostrarForm(true);
  }

  function iniciarEdicao(r: Reseller) {
    setEditandoId(r.id);
    setForm({ nome: r.nome, cidade: r.cidade, estado: r.estado, whatsapp: r.whatsapp, ativo: r.ativo });
    setErro(null);
    setMostrarForm(true);
  }

  async function handleSalvar() {
    setErro(null);
    const res = await fetch("/api/admin/resellers", {
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
    if (!confirm("Excluir este revendedor?")) return;
    await fetch("/api/admin/resellers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    carregar();
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Revendedores</h1>
        <Button onClick={iniciarNovo} fullWidth={false} className="w-fit px-6">
          + Novo
        </Button>
      </div>

      {mostrarForm && (
        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
          <h2 className="mb-4 font-bold">{editandoId ? "Editar revendedor" : "Novo revendedor"}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome da loja">
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-foreground focus:border-accent focus:outline-none"
              />
            </Field>
            <Field label="Cidade">
              <input
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-foreground focus:border-accent focus:outline-none"
              />
            </Field>
            <Field label="Estado (UF)">
              <input
                value={form.estado}
                maxLength={2}
                onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 uppercase text-foreground focus:border-accent focus:outline-none"
              />
            </Field>
            <Field label="WhatsApp (com DDI+DDD, só números)">
              <input
                value={form.whatsapp}
                placeholder="5511999999999"
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-foreground focus:border-accent focus:outline-none"
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
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Loja</th>
                <th className="px-4 py-3 font-medium">Cidade/UF</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {resellers.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">{r.nome}</td>
                  <td className="px-4 py-3">
                    {r.cidade}/{r.estado}
                  </td>
                  <td className="px-4 py-3">{r.whatsapp}</td>
                  <td className="px-4 py-3">
                    <span className={r.ativo ? "text-accent" : "text-muted"}>
                      {r.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => iniciarEdicao(r)}
                      className="mr-3 text-muted hover:text-foreground"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(r.id)}
                      className="text-danger hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
