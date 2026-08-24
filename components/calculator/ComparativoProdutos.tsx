"use client";

import type { BoinaInput, CompostoInput } from "@/lib/calculations";
import type { ZvizzerDisplaySettings } from "@/lib/hooks/use-settings";
import { formatarNumero } from "@/lib/format";

interface ComparativoProdutosProps {
  compostosUsuario: CompostoInput[];
  boinasUsuario: BoinaInput[];
  zvizzer: ZvizzerDisplaySettings;
}

/**
 * Tabela comparativa de produtos + premissas do processo Zvizzer (pedido do
 * time Zvizzer): mostra não só a diferença de custo, mas *quantos* produtos
 * cada processo usa e *por quê* o composto/boina Zvizzer rende mais, para o
 * usuário não achar que é "só uma conta" — e sim entender o raciocínio por
 * trás do número.
 */
export function ComparativoProdutos({
  compostosUsuario,
  boinasUsuario,
  zvizzer,
}: ComparativoProdutosProps) {
  const nomesCompostos = compostosUsuario
    .map((c, i) => c.nome?.trim() || `Composto ${i + 1}`)
    .join(", ");
  const consumoTotalCompostoG = compostosUsuario.reduce(
    (soma, c) => soma + c.consumoCarroG,
    0
  );
  const quantidadeTotalBoinas = boinasUsuario.reduce((soma, b) => soma + b.quantidade, 0);
  const durabilidadesBoinas = boinasUsuario.map((b) => b.durabilidadeCarros);
  const durabilidadeUsuarioLabel =
    durabilidadesBoinas.length <= 1
      ? `até ${formatarNumero(durabilidadesBoinas[0] ?? 0)} carros`
      : `${durabilidadesBoinas.map((d) => formatarNumero(d)).join(" / ")} carros por conjunto`;

  const rendimentoZvizzerCarros = Math.floor(zvizzer.compostoPesoG / zvizzer.compostoConsumoG);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-muted">
        Produtos utilizados em cada processo
      </h3>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Seu processo atual</th>
              <th className="px-4 py-3 font-medium text-accent">Processo Zvizzer</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-t [&>tr]:border-border">
            <tr>
              <td className="px-4 py-3 text-muted">Compostos usados</td>
              <td className="px-4 py-3">
                {compostosUsuario.length}× — {nomesCompostos}
              </td>
              <td className="px-4 py-3 font-medium text-accent">1× {zvizzer.compostoNome}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-muted">Consumo de composto/carro</td>
              <td className="px-4 py-3 tabular-nums">{formatarNumero(consumoTotalCompostoG)}g</td>
              <td className="px-4 py-3 font-medium tabular-nums text-accent">
                {formatarNumero(zvizzer.compostoConsumoG)}g
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-muted">Boinas usadas</td>
              <td className="px-4 py-3 tabular-nums">{formatarNumero(quantidadeTotalBoinas)}</td>
              <td className="px-4 py-3 font-medium tabular-nums text-accent">
                {formatarNumero(zvizzer.boinaQuantidade)}× {zvizzer.boinaNome}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-muted">Durabilidade das boinas</td>
              <td className="px-4 py-3">{durabilidadeUsuarioLabel}</td>
              <td className="px-4 py-3 font-medium text-accent">
                até {formatarNumero(zvizzer.boinaDurabilidadeCarros)} carros
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm leading-relaxed text-muted">
        <p className="mb-2 font-semibold text-foreground">Por que o custo Zvizzer é menor</p>
        <p>
          A embalagem de {zvizzer.compostoNome} tem {formatarNumero(zvizzer.compostoPesoG)}g e
          usa só {formatarNumero(zvizzer.compostoConsumoG)}g por carro — rende até{" "}
          {rendimentoZvizzerCarros} carros por embalagem. Produtos com preço de tabela mais alto
          podem ainda assim sair mais baratos por carro quando rendem mais e duram mais: é o caso
          também das boinas, que aguentam até {formatarNumero(zvizzer.boinaDurabilidadeCarros)}{" "}
          carros antes da troca.
        </p>
      </div>
    </div>
  );
}
