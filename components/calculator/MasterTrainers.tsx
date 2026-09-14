"use client";

import { useEffect, useState } from "react";

interface MasterTrainer {
  id: string;
  nome: string;
  fotoUrl: string | null;
}

// A lista aparece duas vezes na tela do resultado (faixa no celular, coluna
// fixa no desktop). Guardar a resposta evita buscar a mesma coisa duas vezes.
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
 * Vitrine dos Master Trainers: foto + nome, sem mini-CV.
 *
 * `variante="coluna"` é a coluna fixa do desktop, que acompanha a rolagem do
 * resultado; `variante="faixa"` é a versão do celular, uma tira horizontal
 * deslizável junto do formulário.
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

      <ul
        className={
          coluna
            ? "flex flex-col gap-4"
            : "-mx-1 flex gap-4 overflow-x-auto px-1 pb-2"
        }
      >
        {trainers.map((trainer) => (
          <li
            key={trainer.id}
            className={
              coluna
                ? "flex items-center gap-3"
                : "flex w-20 shrink-0 flex-col items-center gap-2"
            }
          >
            <Avatar nome={trainer.nome} fotoUrl={trainer.fotoUrl} />
            <span
              className={`font-medium leading-tight ${
                coluna ? "text-sm" : "text-center text-[11px]"
              }`}
            >
              {trainer.nome}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Avatar({ nome, fotoUrl }: { nome: string; fotoUrl: string | null }) {
  if (fotoUrl) {
    return (
      // Foto vem do admin (pode ser URL externa), por isso <img> e não next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt={nome}
        className="h-16 w-16 shrink-0 rounded-full border-2 border-accent/30 object-cover"
      />
    );
  }

  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-accent/30 bg-surface-2 text-sm font-bold text-muted">
      {iniciais}
    </span>
  );
}
