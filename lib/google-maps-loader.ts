"use client";

/**
 * Carrega o script da Maps JavaScript API uma única vez, mesmo que o
 * componente do mapa monte/desmonte várias vezes (ex.: trocar de etapa no
 * wizard). Chamadas repetidas reaproveitam a mesma Promise.
 *
 * Usa o parâmetro `callback` (padrão clássico da API) em vez de
 * `loading=async`: esse último só carrega um shim que exige chamar
 * `google.maps.importLibrary()` biblioteca por biblioteca antes de usar
 * qualquer classe — o `callback` garante que Map, Marker, InfoWindow etc.
 * já existem de verdade quando a Promise resolve.
 */

declare global {
  interface Window {
    google?: typeof google;
    __inicializarGoogleMaps__?: () => void;
  }
}

let carregamento: Promise<typeof google.maps> | null = null;

export function carregarGoogleMaps(): Promise<typeof google.maps> {
  if (carregamento) return carregamento;

  carregamento = new Promise((resolve, reject) => {
    if (window.google?.maps?.Map) {
      resolve(window.google.maps);
      return;
    }

    const chave = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!chave) {
      reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY não configurada."));
      return;
    }

    window.__inicializarGoogleMaps__ = () => {
      resolve(window.google!.maps);
      delete window.__inicializarGoogleMaps__;
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(chave)}&language=pt-BR&region=BR&callback=__inicializarGoogleMaps__`;
    script.async = true;
    script.onerror = () => reject(new Error("Falha ao carregar o Google Maps."));
    document.head.appendChild(script);
  });

  return carregamento;
}
