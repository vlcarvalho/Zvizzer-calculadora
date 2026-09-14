"use client";

import { formatarHoras, formatarMoeda, formatarPercentual } from "@/lib/format";

interface BlocoCustoProps {
  titulo: string;
  subtitulo?: string;
  custoCompostos: number;
  custoBoinas: number;
  custoMaoDeObra: number;
  custoHora: number;
  horas: number;
  total: number;
  mensagemTotal: string;
  /** Quanto este custo é menor que o do processo atual (ex.: 0.42 = 42%). */
  reducaoPercentual?: number;
  destaque?: boolean;
}

/**
 * Custo do polimento por carro em três blocos (compostos, boinas e
 * custo/hora) somando o total. Propositalmente sem abrir produto por
 * produto: aqui o usuário precisa enxergar o número fechado.
 */
export function BlocoCusto({
  titulo,
  subtitulo,
  custoCompostos,
  custoBoinas,
  custoMaoDeObra,
  custoHora,
  horas,
  total,
  mensagemTotal,
  reducaoPercentual,
  destaque,
}: BlocoCustoProps) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border ${
        destaque ? "border-accent/40 bg-accent/[0.06]" : "border-border bg-surface/60"
      }`}
    >
      <header className="border-b border-inherit px-5 py-4">
        <h3 className={`font-bold ${destaque ? "text-accent" : "text-foreground"}`}>{titulo}</h3>
        {subtitulo && <p className="mt-0.5 text-xs text-muted">{subtitulo}</p>}
      </header>

      <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Item rotulo="Compostos" valor={custoCompostos} />
        <Item rotulo="Boinas" valor={custoBoinas} />
        <Item
          rotulo="Custo/hora"
          valor={custoMaoDeObra}
          detalhe={`${formatarMoeda(custoHora, true)}/h × ${formatarHoras(horas)}`}
        />
      </div>

      <footer
        className={`px-5 py-5 text-center ${destaque ? "bg-accent/10" : "bg-surface-2/60"}`}
      >
        <p className="text-xs text-muted">{mensagemTotal}</p>
        <p
          className={`mt-1 text-3xl font-black tabular-nums sm:text-4xl ${
            destaque ? "text-accent" : "text-foreground"
          }`}
        >
          {formatarMoeda(total, true)}
        </p>

        {reducaoPercentual !== undefined && reducaoPercentual > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent">
            <span aria-hidden>▼</span>
            {formatarPercentual(reducaoPercentual, 0)} menor que o seu processo atual
          </p>
        )}
      </footer>
    </section>
  );
}

function Item({
  rotulo,
  valor,
  detalhe,
}: {
  rotulo: string;
  valor: number;
  detalhe?: string;
}) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-muted">{rotulo}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{formatarMoeda(valor, true)}</p>
      {detalhe && <p className="mt-0.5 text-[11px] text-muted">{detalhe}</p>}
    </div>
  );
}
