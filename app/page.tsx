"use client";

import { useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";

const BENEFICIOS = ["Gratuito", "Resultado personalizado", "Leva poucos minutos", "Sem cadastro"];

export default function LandingPage() {
  useEffect(() => {
    track("calculator_view");
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="chrome-text mb-8 text-sm font-black uppercase tracking-[0.3em]">
        Zvizzer
      </p>

      <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
        Você sabe quanto custa o seu polimento?
      </h1>

      <p className="mt-5 max-w-md text-lg text-muted">
        Descubra quanto sua operação pode economizar e faturar com as horas que você pode
        liberar.
      </p>

      <div className="mt-10 w-full max-w-sm">
        <Link href="/calculadora" onClick={() => track("calculator_start")}>
          <Button>Calcular gratuitamente</Button>
        </Link>
      </div>

      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
        {BENEFICIOS.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <span className="text-accent">✓</span>
            {b}
          </li>
        ))}
      </ul>
    </main>
  );
}
