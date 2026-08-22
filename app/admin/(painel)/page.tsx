"use client";

import { useEffect, useState } from "react";
import { formatarPercentual } from "@/lib/format";

interface Funil {
  visitas: number;
  iniciaram: number;
  concluiram: number;
  clicaramWhatsapp: number;
  percentualIniciaram: number;
  percentualConcluiram: number;
  percentualClicaramWhatsapp: number;
}

interface CliqueRevendedor {
  resellerId: string | null;
  nome: string;
  cidade: string;
  estado: string;
  cliques: number;
}

export default function AdminDashboardPage() {
  const [funil, setFunil] = useState<Funil | null>(null);
  const [cliques, setCliques] = useState<CliqueRevendedor[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((data) => {
        setFunil(data.funil);
        setCliques(data.cliquesPorRevendedor ?? []);
      })
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p className="text-muted">Carregando…</p>;
  if (!funil) return <p className="text-danger">Não foi possível carregar o funil.</p>;

  const etapas = [
    { label: "Visitas à calculadora", valor: funil.visitas, percentual: 1 },
    { label: "Iniciaram o cálculo", valor: funil.iniciaram, percentual: funil.percentualIniciaram },
    { label: "Concluíram o cálculo", valor: funil.concluiram, percentual: funil.percentualConcluiram },
    {
      label: "Clicaram no WhatsApp",
      valor: funil.clicaramWhatsapp,
      percentual: funil.percentualClicaramWhatsapp,
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">Funil de conversão</h1>
        <p className="mt-1 text-sm text-muted">
          O clique no WhatsApp é a conversão final mensurável — não confirma que a mensagem foi
          enviada de fato (sem integração com a API do WhatsApp).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {etapas.map((etapa, i) => (
          <div key={etapa.label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs text-muted">{etapa.label}</p>
            <p className="mt-2 text-3xl font-black tabular-nums">{etapa.valor}</p>
            {i > 0 && (
              <p className="mt-1 text-xs text-accent">{formatarPercentual(etapa.percentual)}</p>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold">Cliques por revendedor</h2>
        {cliques.length === 0 ? (
          <p className="text-sm text-muted">Ainda não há cliques registrados.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Loja</th>
                  <th className="px-4 py-3 font-medium">Cidade</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Cliques</th>
                </tr>
              </thead>
              <tbody>
                {cliques.map((c) => (
                  <tr key={c.resellerId ?? c.nome} className="border-t border-border">
                    <td className="px-4 py-3">{c.nome}</td>
                    <td className="px-4 py-3">{c.cidade}</td>
                    <td className="px-4 py-3">{c.estado}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.cliques}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
