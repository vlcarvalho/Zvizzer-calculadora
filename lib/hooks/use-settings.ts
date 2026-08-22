"use client";

import { useEffect, useState } from "react";
import type { LaborParams, ZvizzerParams } from "@/lib/calculations";

interface SettingsResponse {
  zvizzer: ZvizzerParams;
  labor: LaborParams;
}

interface UseSettingsResult {
  settings: SettingsResponse | null;
  carregando: boolean;
  erro: string | null;
}

/** Busca uma única vez os parâmetros públicos (Zvizzer + mão de obra) usados
 * pelo motor de cálculo no client (spec §18: cálculo no cliente). */
export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch("/api/settings")
      .then(async (res) => {
        if (!res.ok) throw new Error("Não foi possível carregar os parâmetros.");
        return res.json();
      })
      .then((data: SettingsResponse) => {
        if (ativo) setSettings(data);
      })
      .catch((e: Error) => {
        if (ativo) setErro(e.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return { settings, carregando, erro };
}
