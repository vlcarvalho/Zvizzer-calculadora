"use client";

import { formatarHoras, formatarMoeda } from "@/lib/format";

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
}: BlocoCustoProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface/60">
      <header className="border-b border-inherit px-5 py-4">
        <h3 className="font-bold text-foreground">{titulo}</h3>
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

      <footer className="bg-surface-2/60 px-5 py-5 text-center">
        <p className="text-xs text-muted">{mensagemTotal}</p>
        <p className="mt-1 text-3xl font-black tabular-nums text-foreground sm:text-4xl">
          {formatarMoeda(total, true)}
        </p>
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
