interface ProgressBarProps {
  etapaAtual: number;
  totalEtapas: number;
}

/** Andamento do wizard: compacto e alinhado à esquerda, no topo da tela. */
export function ProgressBar({ etapaAtual, totalEtapas }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        Etapa {etapaAtual} de {totalEtapas}
      </span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalEtapas }, (_, i) => i + 1).map((etapa) => (
          <span
            key={etapa}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              etapa === etapaAtual
                ? "w-7 bg-accent"
                : etapa < etapaAtual
                  ? "w-4 bg-accent/50"
                  : "w-4 bg-surface-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
