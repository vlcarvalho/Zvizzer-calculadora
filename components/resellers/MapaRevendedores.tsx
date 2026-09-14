"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { montarLinkWhatsapp, type DadosMensagemWhatsapp } from "@/lib/whatsapp";

export interface RevendedorNoMapa {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  whatsapp: string;
  logoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface MapaRevendedoresProps {
  revendedores: RevendedorNoMapa[];
  dadosMensagem?: DadosMensagemWhatsapp;
  onWhatsappClick?: (revendedor: RevendedorNoMapa) => void;
}

/** Enquadra o Brasil inteiro quando não dá para calcular os limites. */
const CENTRO_BRASIL: L.LatLngExpression = [-14.235, -51.9253];

/**
 * Mapa com um pino por revendedor. Usa Leaflet + OpenStreetMap: gratuito e
 * sem chave de API. Ao clicar no pino abre um balão com os dados da loja e o
 * botão de WhatsApp.
 */
export function MapaRevendedores({
  revendedores,
  dadosMensagem,
  onWhatsappClick,
}: MapaRevendedoresProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const camadaPinosRef = useRef<L.LayerGroup | null>(null);

  const comCoordenadas = useMemo(
    () =>
      revendedores.filter(
        (r): r is RevendedorNoMapa & { latitude: number; longitude: number } =>
          r.latitude != null && r.longitude != null
      ),
    [revendedores]
  );

  // Cria o mapa uma única vez.
  useEffect(() => {
    if (!containerRef.current || mapaRef.current) return;

    const mapa = L.map(containerRef.current, {
      center: CENTRO_BRASIL,
      zoom: 4,
      scrollWheelZoom: false, // não sequestra o scroll da página no mobile
      attributionControl: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap",
    }).addTo(mapa);

    camadaPinosRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;

    return () => {
      mapa.remove();
      mapaRef.current = null;
      camadaPinosRef.current = null;
    };
  }, []);

  // Redesenha os pinos sempre que a lista filtrada muda.
  useEffect(() => {
    const mapa = mapaRef.current;
    const camada = camadaPinosRef.current;
    if (!mapa || !camada) return;

    camada.clearLayers();

    comCoordenadas.forEach((revendedor) => {
      const pino = L.divIcon({
        className: "",
        html: `<span class="pino-revendedor"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
      });

      const link = montarLinkWhatsapp(revendedor.whatsapp, dadosMensagem);
      const logo = revendedor.logoUrl
        ? `<img src="${escaparHtml(revendedor.logoUrl)}" alt="${escaparHtml(revendedor.nome)}" class="logo-revendedor" />`
        : "";

      const popup = `
        <div class="popup-revendedor">
          ${logo}
          <strong>${escaparHtml(revendedor.nome)}</strong>
          <span>${escaparHtml(revendedor.cidade)} — ${escaparHtml(revendedor.estado)}</span>
          <a href="${link}" target="_blank" rel="noopener noreferrer" data-revendedor="${revendedor.id}">
            Falar no WhatsApp
          </a>
        </div>
      `;

      L.marker([revendedor.latitude, revendedor.longitude], { icon: pino })
        .bindPopup(popup)
        .on("popupopen", (evento) => {
          const link = evento.popup
            .getElement()
            ?.querySelector<HTMLAnchorElement>("a[data-revendedor]");
          link?.addEventListener("click", () => onWhatsappClick?.(revendedor), { once: true });
        })
        .addTo(camada);
    });

    if (comCoordenadas.length === 1) {
      const unico = comCoordenadas[0];
      mapa.setView([unico.latitude, unico.longitude], 11);
    } else if (comCoordenadas.length > 1) {
      mapa.fitBounds(
        L.latLngBounds(comCoordenadas.map((r) => [r.latitude, r.longitude] as [number, number])),
        { padding: [40, 40], maxZoom: 12 }
      );
    } else {
      mapa.setView(CENTRO_BRASIL, 4);
    }
  }, [comCoordenadas, dadosMensagem, onWhatsappClick]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div ref={containerRef} className="h-[320px] w-full sm:h-[420px]" />
      {comCoordenadas.length < revendedores.length && (
        <p className="border-t border-border bg-surface px-4 py-2 text-xs text-muted">
          {revendedores.length - comCoordenadas.length} revendedor(es) ainda sem localização no
          mapa — aparecem na lista abaixo.
        </p>
      )}
    </div>
  );
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
