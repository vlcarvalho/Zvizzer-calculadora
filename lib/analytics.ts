"use client";

/**
 * Analytics interno (spec §18). Sem Meta Pixel/GA. Sessão anônima gerada no
 * client e persistida em localStorage; eventos disparados fire-and-forget
 * para /api/events, sem bloquear a UI nem guardar PII.
 */

const SESSION_KEY = "zvizzer_analytics_session_id";

export type EventoAnalytics =
  | "calculator_view"
  | "calculator_start"
  | "step_1_completed"
  | "step_2_completed"
  | "step_3_completed"
  | "step_4_completed"
  | "step_5_completed"
  | "calculation_completed"
  | "results_viewed"
  | "reseller_list_viewed"
  | "whatsapp_clicked";

function gerarSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function obterSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = gerarSessionId();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export interface DetalhesEvento {
  step?: number;
  resellerId?: string;
  estado?: string;
  cidade?: string;
}

export function track(eventName: EventoAnalytics, detalhes: DetalhesEvento = {}) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    sessionId: obterSessionId(),
    eventName,
    ...detalhes,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
      return;
    }
  } catch {
    // sendBeacon indisponível — cai para fetch abaixo
  }

  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics nunca deve quebrar a experiência do usuário.
  });
}
