"use client";

import { useState } from "react";
import type { CalculatorResult } from "@/lib/calculations";
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
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        whatsapp,
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
      <div className="text-center">
        <h3 className="text-xl font-bold leading-snug">
          Quer aprender com os Master Trainers oficiais da marca, certificados na Europa?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Deixe seu e-mail e WhatsApp para receber dicas exclusivas — e este diagnóstico com a
          sua realidade, para consultar quando quiser.
        </p>
      </div>

      <MasterTrainers />

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

        {erro && <p className="text-sm text-danger">{erro}</p>}

        <Button type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Quero receber e ver os revendedores"}
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-muted">
          Ao enviar, você autoriza a Zvizzer a entrar em contato. Usamos seus dados só para isso
          e você pode pedir a exclusão quando quiser.
        </p>

        <button
          type="button"
          onClick={onConcluir}
          className="text-center text-sm text-muted underline underline-offset-4"
        >
          Pular e ver os revendedores
        </button>
      </form>
    </section>
  );
}
