"use client";

interface HoursInputProps {
  horas: number;
  minutos: number;
  onChange: (horas: number, minutos: number) => void;
}

/** Entrada de tempo em horas + minutos (spec §4: "5 horas", "2h30"). */
export function HoursInput({ horas, minutos, onChange }: HoursInputProps) {
  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={horas === 0 ? "" : horas}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value), minutos)}
          placeholder="0"
          className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-2xl font-semibold tabular-nums text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-muted">
          horas
        </span>
      </div>
      <div className="relative flex-1">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={minutos === 0 ? "" : minutos}
          onChange={(e) => {
            const v = Math.min(59, Math.max(0, Number(e.target.value) || 0));
            onChange(horas, v);
          }}
          placeholder="0"
          className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-2xl font-semibold tabular-nums text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-muted">
          min
        </span>
      </div>
    </div>
  );
}
