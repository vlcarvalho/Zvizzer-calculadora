"use client";

import { useEffect, useState } from "react";
import { formatarHoras, formatarMoeda } from "@/lib/format";

interface Lead {
  id: string;
  email: string;
  whatsapp: string;
  consentimentoEm: string;
  politicaVersao: string;
  polimentosMes: number;
  custoAtualPorCarro: number;
  custoZvizzerPorCarro: number;
  economiaMensal: number;
  horasLiberadasMes: number;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);

  function carregar() {
    setCarregando(true);
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((data) => setLeads(data.leads ?? []))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((data) => setLeads(data.leads ?? []))
      .finally(() => setCarregando(false));
  }, []);

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este contato? (use para atender pedidos de exclusão de dados)")) return;
    await fetch("/api/admin/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    carregar();
  }

  if (carregando) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contatos</h1>
          <p className="mt-1 text-sm text-muted">
            Deixados voluntariamente no fim da calculadora, com o retrato do cálculo de cada um.
          </p>
        </div>
        {leads.length > 0 && (
          <a
            href="/api/admin/leads/export"
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:border-accent"
          >
            Baixar CSV
          </a>
        )}
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-muted">Ainda não há contatos.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Polim./mês</th>
                <th className="px-4 py-3 font-medium">Custo atual</th>
                <th className="px-4 py-3 font-medium">Economia/mês</th>
                <th className="px-4 py-3 font-medium">Horas/mês</th>
                <th className="px-4 py-3 font-medium">Consentimento</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">{lead.email}</td>
                  <td className="px-4 py-3">{lead.whatsapp}</td>
                  <td className="px-4 py-3 tabular-nums">{lead.polimentosMes}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatarMoeda(lead.custoAtualPorCarro, true)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-accent">
                    {formatarMoeda(lead.economiaMensal)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatarHoras(lead.horasLiberadasMes)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {lead.politicaVersao === "pre-consentimento" ? (
                      <span className="text-danger">sem registro</span>
                    ) : (
                      <>
                        {new Date(lead.consentimentoEm).toLocaleString("pt-BR")}
                        <br />
                        política {lead.politicaVersao}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleExcluir(lead.id)}
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
