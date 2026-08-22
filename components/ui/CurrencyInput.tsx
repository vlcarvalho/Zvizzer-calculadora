"use client";

import { useId, useState } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** Máscara monetária brasileira (spec §23/§24): usuário digita apenas
 * números, que são interpretados como centavos (padrão de app bancário). */
function formatarCentavosParaReais(digitos: string): string {
  const centavos = parseInt(digitos || "0", 10);
  const reais = centavos / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(reais);
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  autoFocus,
}: CurrencyInputProps) {
  const id = useId();
  const [digitos, setDigitos] = useState(() =>
    value > 0 ? Math.round(value * 100).toString() : ""
  );

  // Ajusta o estado local quando o `value` externo muda (ex.: reset do
  // wizard) durante o próprio render, sem useEffect — padrão recomendado
  // pelo React para "adjusting state when a prop changes".
  const [valorAnterior, setValorAnterior] = useState(value);
  if (value !== valorAnterior) {
    setValorAnterior(value);
    const centavosExternos = Math.round(value * 100);
    setDigitos(centavosExternos > 0 ? centavosExternos.toString() : "");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const somenteDigitos = e.target.value.replace(/\D/g, "").slice(0, 12);
    setDigitos(somenteDigitos);
    onChange(parseInt(somenteDigitos || "0", 10) / 100);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoFocus={autoFocus}
      value={digitos ? formatarCentavosParaReais(digitos) : ""}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-2xl font-semibold tabular-nums text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
    />
  );
}
