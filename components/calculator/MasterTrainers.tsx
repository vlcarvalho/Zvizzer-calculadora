"use client";

import { useEffect, useState } from "react";

interface MasterTrainer {
  id: string;
  nome: string;
}

/** Foto única do time, com os nomes logo abaixo. */
const FOTO_GRUPO = "/master-trainers/grupo.jpg";

// A lista aparece duas vezes na tela do resultado (celular e desktop).
// Guardar a resposta evita buscar a mesma coisa duas vezes.
let cache: MasterTrainer[] | null = null;
let buscaEmAndamento: Promise<MasterTrainer[]> | null = null;

function buscarTrainers(): Promise<MasterTrainer[]> {
  if (cache) return Promise.resolve(cache);
  if (!buscaEmAndamento) {
    buscaEmAndamento = fetch("/api/master-trainers")
      .then((r) => r.json())
      .then((data: { trainers?: MasterTrainer[] }) => {
        cache = data.trainers ?? [];
        return cache;
      })
      .catch(() => [])
      .finally(() => {
        buscaEmAndamento = null;
      });
  }
  return buscaEmAndamento;
}

/**
 * Vitrine dos Master Trainers: uma foto do time e os nomes embaixo.
 *
 * `variante="coluna"` é a coluna do desktop, que acompanha a rolagem do
 * resultado; `variante="faixa"` é a versão do celular, junto do formulário.
 */
export function MasterTrainers({
  variante = "faixa",
}: {
  variante?: "faixa" | "coluna";
}) {
  const [trainers, setTrainers] = useState<MasterTrainer[]>(cache ?? []);

  useEffect(() => {
    let ativo = true;
    buscarTrainers().then((lista) => {
      if (ativo) setTrainers(lista);
    });
    return () => {
      ativo = false;
    };
  }, []);

  if (trainers.length === 0) return null;

  const coluna = variante === "coluna";

  return (
    <div className={coluna ? "sticky top-6" : ""}>
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-widest text-muted ${
          coluna ? "text-left" : "text-center"
        }`}
      >
        Master Trainers oficiais
      </p>

      {/* Foto do time, servida da pasta public. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FOTO_GRUPO}
        alt={`Master Trainers Zvizzer: ${trainers.map((t) => t.nome).join(", ")}`}
        className="w-full rounded-2xl border border-border object-cover"
      />

      <ul
        className={`mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs leading-snug text-muted ${
          coluna ? "justify-start" : "justify-center"
        }`}
      >
        {trainers.map((trainer, i) => (
          <li key={trainer.id} className="flex items-center gap-2">
            <span className="font-medium text-foreground">{trainer.nome}</span>
            {i < trainers.length - 1 && (
              <span aria-hidden className="text-accent/60">
                •
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
