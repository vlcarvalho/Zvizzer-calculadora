"use client";

import { useEffect, useState } from "react";

interface MasterTrainer {
  id: string;
  nome: string;
  fotoUrl: string | null;
  miniCv: string;
}

/** Vitrine dos Master Trainers — nome, foto e mini-CV vêm do painel admin. */
export function MasterTrainers() {
  const [trainers, setTrainers] = useState<MasterTrainer[]>([]);

  useEffect(() => {
    fetch("/api/master-trainers")
      .then((r) => r.json())
      .then((data) => setTrainers(data.trainers ?? []))
      .catch(() => setTrainers([]));
  }, []);

  if (trainers.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">
        Master Trainers oficiais
      </p>

      <ul className="flex flex-col gap-3">
        {trainers.map((trainer) => (
          <li
            key={trainer.id}
            className="flex items-start gap-4 rounded-2xl border border-border bg-surface/70 p-4"
          >
            <Avatar nome={trainer.nome} fotoUrl={trainer.fotoUrl} />
            <div className="min-w-0">
              <p className="font-semibold leading-tight">{trainer.nome}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{trainer.miniCv}</p>
            </div>
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
        className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
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
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-sm font-bold text-muted">
      {iniciais}
    </span>
  );
}
