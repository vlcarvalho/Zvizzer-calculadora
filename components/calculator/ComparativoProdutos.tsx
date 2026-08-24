"use client";

import {
  custoBoinaCarro,
  custoBoinaZvizzer,
  custoCompostoCarro,
  custoCompostoZvizzer,
  type BoinaInput,
  type CompostoInput,
} from "@/lib/calculations";
import type { ZvizzerDisplaySettings } from "@/lib/hooks/use-settings";
import { formatarMoeda, formatarNumero } from "@/lib/format";

interface ComparativoProdutosProps {
  compostosUsuario: CompostoInput[];
  boinasUsuario: BoinaInput[];
  zvizzer: ZvizzerDisplaySettings;
}

/**
 * Mostra, produto a produto, o preço "de gôndola" e o rendimento de cada
 * item — para o usuário ver com os próprios olhos que um preço maior pode
 * virar um custo por carro menor (pedido do time Zvizzer: não deixar a
 * ferramenta parecer só uma conta, e sim explicar o raciocínio).
 */
export function ComparativoProdutos({
  compostosUsuario,
  boinasUsuario,
  zvizzer,
}: ComparativoProdutosProps) {
  const rendimentoZvizzerCarros = Math.floor(zvizzer.compostoPesoG / zvizzer.compostoConsumoG);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-muted">
          Produtos utilizados em cada processo
        </h3>
        <p className="mt-1 text-center text-xs text-muted">
          O preço de compra não conta a história toda — o que importa é o custo por carro.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Compostos</p>
        {compostosUsuario.map((composto, i) => (
          <CardProduto
            key={`composto-${i}`}
            nome={composto.nome?.trim() || `Composto ${i + 1} (seu processo)`}
            preco={composto.precoEmbalagem}
            rendimento={`Embalagem de ${formatarNumero(composto.quantidadeEmbalagemG)}g — usa ${formatarNumero(composto.consumoCarroG)}g por carro`}
            custoCarro={custoCompostoCarro(composto)}
          />
        ))}
        <CardProduto
          destaque
          nome={zvizzer.compostoNome}
          preco={zvizzer.compostoPreco}
          rendimento={`Embalagem de ${formatarNumero(zvizzer.compostoPesoG)}g — usa ${formatarNumero(zvizzer.compostoConsumoG)}g por carro (rende ${rendimentoZvizzerCarros} carros/embalagem)`}
          custoCarro={custoCompostoZvizzer(zvizzer)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Boinas</p>
        {boinasUsuario.map((boina, i) => (
          <CardProduto
            key={`boina-${i}`}
            nome={boina.nome?.trim() || `Boina ${i + 1} (seu processo)`}
            preco={boina.precoUnitario}
            rendimento={`${formatarNumero(boina.quantidade)}× em revezamento — dura até ${formatarNumero(boina.durabilidadeCarros)} carros`}
            custoCarro={custoBoinaCarro(boina)}
          />
        ))}
        <CardProduto
          destaque
          nome={zvizzer.boinaNome}
          preco={zvizzer.boinaPreco}
          rendimento={`${formatarNumero(zvizzer.boinaQuantidade)}× em revezamento — dura até ${formatarNumero(zvizzer.boinaDurabilidadeCarros)} carros`}
          custoCarro={custoBoinaZvizzer(zvizzer)}
        />
      </div>

      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm leading-relaxed text-muted">
        <p className="mb-2 font-semibold text-foreground">Por que o custo Zvizzer é menor</p>
        <p>
          Repare nos cards acima: o preço pago na embalagem/unidade nem sempre é o que decide o
          custo final. Um produto mais caro que rende mais carros — porque usa menos gramas por
          polimento ou dura mais lavagens — pode sair mais barato <em>por carro</em> do que uma
          opção mais barata na prateleira, mas de rendimento menor. É essa lógica, e não só uma
          conta de &quot;mais barato x mais caro&quot;, que explica a diferença de custo mostrada
          a seguir.
        </p>
      </div>
    </div>
  );
}

function CardProduto({
  nome,
  preco,
  rendimento,
  custoCarro,
  destaque,
}: {
  nome: string;
  preco: number;
  rendimento: string;
  custoCarro: number;
  destaque?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
        destaque ? "border-accent/40 bg-accent/5" : "border-border bg-surface"
      }`}
    >
      <div className="min-w-0">
        <p className={`truncate font-semibold ${destaque ? "text-accent" : "text-foreground"}`}>
          {nome}
        </p>
        <p className="text-xs text-muted">{formatarMoeda(preco, true)} de tabela</p>
        <p className="mt-1 text-xs text-muted">{rendimento}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[10px] uppercase tracking-wide text-muted">Custo/carro</p>
        <p className={`text-lg font-bold tabular-nums ${destaque ? "text-accent" : "text-foreground"}`}>
          {formatarMoeda(custoCarro, true)}
        </p>
      </div>
    </div>
  );
}
