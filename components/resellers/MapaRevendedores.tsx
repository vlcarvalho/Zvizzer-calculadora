"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { carregarGoogleMaps } from "@/lib/google-maps-loader";
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
const CENTRO_BRASIL = { lat: -14.235, lng: -51.9253 };

/** Tema escuro para casar com o resto do app — a Maps JavaScript API aceita
 * um array de regras de estilo em vez de um mapa claro padrão. */
const ESTILO_ESCURO: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1c1c1c" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9a9a9a" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#141414" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f1a10" }] },
];

const ICONE_PINO = {
  path: "M0,0 m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0",
  fillColor: "#a6e22e",
  fillOpacity: 1,
  strokeColor: "#0a0a0a",
  strokeWeight: 3,
  scale: 1,
};

/**
 * Mapa com um pino por revendedor, via Google Maps JavaScript API (chave
 * restrita por domínio no Google Cloud Console). Clicar no pino abre um
 * balão com os dados da loja e o botão de WhatsApp.
 */
export function MapaRevendedores({
  revendedores,
  dadosMensagem,
  onWhatsappClick,
}: MapaRevendedoresProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<google.maps.Map | null>(null);
  const marcadoresRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [erro, setErro] = useState<string | null>(null);

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
    let cancelado = false;

    carregarGoogleMaps()
      .then((maps) => {
        if (cancelado || !containerRef.current || mapaRef.current) return;

        mapaRef.current = new maps.Map(containerRef.current, {
          center: CENTRO_BRASIL,
          zoom: 4,
          gestureHandling: "cooperative", // não sequestra o scroll da página
          styles: ESTILO_ESCURO,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        infoWindowRef.current = new maps.InfoWindow();
        // Força o redesenho: às vezes o mapa nasce numa coluna ainda com
        // largura 0 (ex.: layout em transição) e fica com metade cinza.
        setTimeout(() => {
          if (mapaRef.current) maps.event.trigger(mapaRef.current, "resize");
        }, 0);
      })
      .catch((e: Error) => {
        if (!cancelado) setErro(e.message);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Redesenha os pinos sempre que a lista filtrada muda.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !window.google?.maps) return;
    const maps = window.google.maps;

    marcadoresRef.current.forEach((m) => m.setMap(null));
    marcadoresRef.current = comCoordenadas.map((revendedor) => {
      const marcador = new maps.Marker({
        position: { lat: revendedor.latitude, lng: revendedor.longitude },
        map: mapa,
        icon: ICONE_PINO,
        title: revendedor.nome,
      });

      marcador.addListener("click", () => {
        const infoWindow = infoWindowRef.current;
        if (!infoWindow) return;

        const link = montarLinkWhatsapp(revendedor.whatsapp, dadosMensagem);
        const logo = revendedor.logoUrl
          ? `<img src="${escaparHtml(revendedor.logoUrl)}" alt="${escaparHtml(revendedor.nome)}" class="logo-revendedor" />`
          : "";

        infoWindow.setContent(`
          <div class="popup-revendedor">
            ${logo}
            <strong>${escaparHtml(revendedor.nome)}</strong>
            <span>${escaparHtml(revendedor.cidade)} — ${escaparHtml(revendedor.estado)}</span>
            <a href="${link}" target="_blank" rel="noopener noreferrer" data-revendedor="${revendedor.id}">
              Falar no WhatsApp
            </a>
          </div>
        `);
        infoWindow.open({ map: mapa, anchor: marcador });

        maps.event.addListenerOnce(infoWindow, "domready", () => {
          const el = document.querySelector<HTMLAnchorElement>(
            `a[data-revendedor="${revendedor.id}"]`
          );
          el?.addEventListener("click", () => onWhatsappClick?.(revendedor), { once: true });
        });
      });

      return marcador;
    });

    if (comCoordenadas.length === 1) {
      const unico = comCoordenadas[0];
      mapa.setCenter({ lat: unico.latitude, lng: unico.longitude });
      mapa.setZoom(11);
    } else if (comCoordenadas.length > 1) {
      const bounds = new maps.LatLngBounds();
      comCoordenadas.forEach((r) => bounds.extend({ lat: r.latitude, lng: r.longitude }));
      mapa.fitBounds(bounds, 40);
    } else {
      mapa.setCenter(CENTRO_BRASIL);
      mapa.setZoom(4);
    }
  }, [comCoordenadas, dadosMensagem, onWhatsappClick]);

  if (erro) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-border bg-surface px-6 text-center text-sm text-muted sm:h-[420px]">
        Não foi possível carregar o mapa agora. A lista de revendedores abaixo continua
        funcionando normalmente.
      </div>
    );
  }

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
