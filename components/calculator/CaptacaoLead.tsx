"use client";

import { useState } from "react";
import Link from "next/link";
import type { CalculatorResult } from "@/lib/calculations";
import { POLITICA_VERSAO, TEXTO_CONSENTIMENTO } from "@/lib/privacidade";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { MasterTrainers } from "@/components/calculator/MasterTrainers";

interface CaptacaoLeadProps {
  resultado: CalculatorResult;
  polimentosMes: number;
  /** Chamado depois de enviar (ou de pular) — leva o usuário aos revendedores. */
  onConcluir: () => void;
}

/**
 * Captação opcional de contato no fim do resultado. Preencher não é
 * obrigatório: nos dois caminhos o usuário segue para os revendedores.
 */
export function CaptacaoLead({ resultado, polimentosMes, onConcluir }: CaptacaoLeadProps) {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [aceitou, setAceitou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();

    // O consentimento precisa ser um ato afirmativo — nada de caixa
    // pré-marcada ou aceite implícito ao enviar (LGPD art. 8º).
    if (!aceitou) {
      setErro("Para receber o contato, marque a autorização de uso dos seus dados.");
      return;
    }

    setEnviando(true);
    setErro(null);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        whatsapp,
        politicaVersao: POLITICA_VERSAO,
        consentimentoTexto: TEXTO_CONSENTIMENTO,
        polimentosMes,
        custoAtualPorCarro: resultado.custoOperacionalAtual,
        custoZvizzerPorCarro: resultado.custoOperacionalZvizzer,
        economiaMensal: resultado.economiaMensal,
        horasLiberadasMes: resultado.horasLiberadasMes,
      }),
    }).catch(() => null);

    setEnviando(false);

    if (!res || !res.ok) {
      const data = await res?.json().catch(() => ({}));
      setErro(data?.error ?? "Não foi possível enviar agora. Tente novamente.");
      return;
    }

    onConcluir();
  }

  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-accent/30 bg-gradient-to-b from-accent/[0.08] to-transparent p-6">
      {/* No celular os Masters aparecem aqui, como faixa. No desktop eles
          ficam na coluna fixa ao lado do resultado inteiro (ver Resultado). */}
      <div className="flex flex-col gap-6">
        <div className="lg:hidden">
          <MasterTrainers variante="faixa" />
        </div>

        <form onSubmit={handleEnviar} className="flex flex-col gap-4">
        <Field label="Seu e-mail">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com.br"
            className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-base text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </Field>

        <Field label="Seu WhatsApp">
          <input
            type="tel"
            required
            inputMode="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-base text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface/70 p-4">
          <input
            type="checkbox"
            checked={aceitou}
            onChange={(e) => setAceitou(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]"
          />
          <span className="text-[13px] leading-relaxed text-muted">
            {TEXTO_CONSENTIMENTO}{" "}
            <Link
              href="/privacidade"
              target="_blank"
              className="text-accent underline underline-offset-2"
            >
              Ler a Política de Privacidade
            </Link>
            .
          </span>
        </label>

        {erro && <p className="text-sm text-danger">{erro}</p>}

        <Button type="submit" disabled={enviando || !aceitou}>
          {enviando ? "Enviando…" : "Quero receber e ver os revendedores"}
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-muted">
          Os valores que você digitou no cálculo ficam só no seu navegador — não são enviados
          para a gente.
        </p>

          <button
            type="button"
            onClick={onConcluir}
            className="text-center text-sm text-muted underline underline-offset-4"
          >
            Pular e ver os revendedores
          </button>
        </form>
      </div>
    </section>
  );
}
