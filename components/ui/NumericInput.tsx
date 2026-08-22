"use client";

import { useId } from "react";

interface NumericInputProps {
  value: number | "";
  onChange: (value: number) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
  step?: number;
  autoFocus?: boolean;
}

export function NumericInput({
  value,
  onChange,
  placeholder,
  suffix,
  min = 0,
  step = 1,
  autoFocus,
}: NumericInputProps) {
  const id = useId();

  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        autoFocus={autoFocus}
        value={value}
        min={min}
        step={step}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? 0 : Number(v));
        }}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-2xl font-semibold tabular-nums text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      {suffix && (
        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-muted">
          {suffix}
        </span>
      )}
    </div>
  );
}
