interface ProgressBarProps {
  etapaAtual: number;
  totalEtapas: number;
}

export function ProgressBar({ etapaAtual, totalEtapas }: ProgressBarProps) {
  const percentual = Math.min(100, Math.round((etapaAtual / totalEtapas) * 100));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 text-xs text-muted">
        <span>
          Etapa {etapaAtual} de {totalEtapas}
        </span>
        <span>{percentual}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}
