"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const CHAVE = "zvizzer-aviso-privacidade-visto";

// O "visto" mora no localStorage, que é estado externo ao React — daí o
// useSyncExternalStore em vez de ler dentro de um efeito.
let ouvintes: (() => void)[] = [];

function inscrever(ouvinte: () => void) {
  ouvintes.push(ouvinte);
  return () => {
    ouvintes = ouvintes.filter((o) => o !== ouvinte);
  };
}

function lerNoCliente(): string {
  try {
    return window.localStorage.getItem(CHAVE) ?? "";
  } catch {
    // Navegador com armazenamento bloqueado: trata como já visto.
    return "1";
  }
}

/** No servidor assumimos "já visto" para não piscar o aviso na hidratação. */
function lerNoServidor(): string {
  return "1";
}

function marcarComoVisto() {
  try {
    window.localStorage.setItem(CHAVE, "1");
  } catch {
    // Sem armazenamento, o aviso volta na próxima visita — tudo bem.
  }
  ouvintes.forEach((o) => o());
}

/**
 * Aviso discreto sobre armazenamento local e métricas anônimas. Não é um
 * muro de cookies: a ferramenta não usa cookies de rastreamento nem
 * ferramentas de terceiros, então basta informar de forma clara e deixar o
 * usuário seguir.
 */
export function AvisoPrivacidade() {
  const visto = useSyncExternalStore(inscrever, lerNoCliente, lerNoServidor);

  if (visto) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-2xl border border-border bg-surface/95 p-4 shadow-lg backdrop-blur">
      <p className="text-[13px] leading-relaxed text-muted">
        Guardamos o seu preenchimento{" "}
        <strong className="text-foreground">no seu próprio navegador</strong> e medimos o uso da
        ferramenta de forma anônima. Nenhum valor financeiro que você digitar é enviado para nós.{" "}
        <Link href="/privacidade" className="text-accent underline underline-offset-2">
          Saiba mais
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={marcarComoVisto}
        className="mt-3 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        Entendi
      </button>
    </div>
  );
}
