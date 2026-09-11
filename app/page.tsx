"use client";

import { useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

export default function LandingPage() {
  useEffect(() => {
    track("calculator_view");
  }, []);

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <FundoDecorativo />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <h1 className="text-balance text-[2.15rem] font-black leading-[1.12] tracking-tight text-white sm:text-5xl">
          Você sabe qual o custo operacional do seu polimento?
        </h1>

        <Link
          href="/calculadora"
          onClick={() => track("calculator_start")}
          className="mt-12 inline-flex w-full max-w-sm items-center justify-center rounded-2xl bg-accent px-8 py-5 text-base font-bold text-accent-foreground shadow-[0_10px_40px_-10px_rgba(166,226,46,0.55)] transition-all duration-150 hover:bg-accent-strong active:scale-[0.98] sm:text-lg"
        >
          Calcule Agora Gratuitamente!
        </Link>
      </div>
    </main>
  );
}

/**
 * Fundo da abertura: sem logo e sem viés de marca (a ferramenta se apresenta
 * como independente). O movimento circular lento remete à politriz, dando
 * vida à tela sem competir com a pergunta.
 */
function FundoDecorativo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Brilho central suave */}
      <div className="absolute left-1/2 top-1/2 h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(166,226,46,0.12)_0%,rgba(166,226,46,0.035)_38%,transparent_70%)]" />

      {/* Malha fina de pontos */}
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Anéis concêntricos girando devagar */}
      <div className="absolute left-1/2 top-1/2 h-[115vmin] w-[115vmin] -translate-x-1/2 -translate-y-1/2">
        <div className="anel-girando absolute inset-0">
          <div className="absolute inset-0 rounded-full border border-white/[0.055]" />
          <div className="absolute inset-[13%] rounded-full border border-white/[0.045]" />
          <div className="absolute inset-[27%] rounded-full border border-white/[0.05]" />
          <div className="absolute inset-[41%] rounded-full border border-dashed border-accent/[0.14]" />
          <div className="absolute left-1/2 top-[41%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/60 blur-[1px]" />
        </div>
      </div>

      {/* Vinheta: escurece as bordas e joga o foco para o centro */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_88%)]" />
    </div>
  );
}
