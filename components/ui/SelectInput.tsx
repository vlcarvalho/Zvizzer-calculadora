"use client";

import { useId } from "react";
import type { OpcaoNumerica } from "@/lib/opcoes";

interface SelectInputProps {
  value: number;
  onChange: (value: number) => void;
  opcoes: OpcaoNumerica[];
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Lista de seleção numérica. Usa o `<select>` nativo de propósito: no celular
 * ele abre o seletor do próprio sistema, que é bem mais confortável do que
 * digitar (spec §23: inputs fáceis no mobile).
 */
export function SelectInput({
  value,
  onChange,
  opcoes,
  placeholder = "Selecione",
  autoFocus,
}: SelectInputProps) {
  const id = useId();
  const vazio = !value;

  return (
    <div className="relative">
      <select
        id={id}
        autoFocus={autoFocus}
        value={vazio ? "" : String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full appearance-none rounded-2xl border border-border bg-surface px-5 py-4 pr-14 text-xl font-semibold tabular-nums focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${
          vazio ? "text-muted/60" : "text-foreground"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.label}
          </option>
        ))}
      </select>

      <svg
        aria-hidden
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
