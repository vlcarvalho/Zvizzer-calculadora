"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { montarLinkWhatsapp, type DadosMensagemWhatsapp } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

// O Leaflet mexe direto no DOM, então só pode carregar no navegador.
const MapaRevendedores = dynamic(
  () => import("@/components/resellers/MapaRevendedores").then((m) => m.MapaRevendedores),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-border bg-surface text-sm text-muted sm:h-[420px]">
        Carregando mapa…
      </div>
    ),
  }
);

interface Reseller {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  whatsapp: string;
  logoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ResellerListProps {
  dadosMensagem?: DadosMensagemWhatsapp;
}

export function ResellerList({ dadosMensagem }: ResellerListProps) {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [cidadeFiltro, setCidadeFiltro] = useState("");

  useEffect(() => {
    fetch("/api/resellers")
      .then((r) => r.json())
      .then((data) => setResellers(data.resellers ?? []))
      .finally(() => setCarregando(false));
    track("reseller_list_viewed");
  }, []);

  const estados = useMemo(
    () => Array.from(new Set(resellers.map((r) => r.estado))).sort(),
    [resellers]
  );

  const cidadesDisponiveis = useMemo(() => {
    const base = estadoFiltro ? resellers.filter((r) => r.estado === estadoFiltro) : resellers;
    return Array.from(new Set(base.map((r) => r.cidade))).sort();
  }, [resellers, estadoFiltro]);

  const filtrados = useMemo(() => {
    return resellers.filter((r) => {
      if (estadoFiltro && r.estado !== estadoFiltro) return false;
      if (cidadeFiltro && r.cidade !== cidadeFiltro) return false;
      if (busca && !r.nome.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [resellers, estadoFiltro, cidadeFiltro, busca]);

  const handleWhatsappClick = useCallback((r: Reseller) => {
    track("whatsapp_clicked", { resellerId: r.id, estado: r.estado, cidade: r.cidade });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Encontre um revendedor Zvizzer</h2>
        <p className="mt-1 text-muted">Filtre por estado, cidade ou nome da loja.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value);
            setCidadeFiltro("");
          }}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">Todos os estados</option>
          {estados.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>

        <select
          value={cidadeFiltro}
          onChange={(e) => setCidadeFiltro(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">Todas as cidades</option>
          {cidadesDisponiveis.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome da loja"
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
        />
      </div>

      {!carregando && filtrados.length > 0 && (
        <MapaRevendedores
          revendedores={filtrados}
          dadosMensagem={dadosMensagem}
          onWhatsappClick={handleWhatsappClick}
        />
      )}

      {carregando ? (
        <p className="text-center text-muted">Carregando revendedores…</p>
      ) : filtrados.length === 0 ? (
        <p className="text-center text-muted">Nenhum revendedor encontrado com esse filtro.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                {r.logoUrl && (
                  // Logo da loja, servida da pasta public.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.logoUrl}
                    alt={r.nome}
                    className="h-12 w-12 shrink-0 rounded-xl border border-border bg-white/5 object-contain p-1"
                  />
                )}
                <div>
                  <p className="font-semibold">{r.nome}</p>
                  <p className="text-sm text-muted">
                    {r.cidade} — {r.estado}
                  </p>
                </div>
              </div>
              <a
                href={montarLinkWhatsapp(r.whatsapp, dadosMensagem)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleWhatsappClick(r)}
                className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-strong"
              >
                Falar no WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
