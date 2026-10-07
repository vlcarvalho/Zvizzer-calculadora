"use client";

import { useEffect, useRef, useState } from "react";
import type { BoinaInput, CalculatorResult, CompostoInput } from "@/lib/calculations";
import type { ZvizzerDisplaySettings } from "@/lib/hooks/use-settings";
import { formatarHoras, formatarMoeda, formatarPercentual } from "@/lib/format";
import { BlocoCusto } from "@/components/calculator/BlocoCusto";
import { GatilhoEconomia } from "@/components/calculator/GatilhoEconomia";
import { TabelaComparativa } from "@/components/calculator/TabelaComparativa";
import { ComoChegamos } from "@/components/calculator/ComoChegamos";
import { CaptacaoLead } from "@/components/calculator/CaptacaoLead";
import { MasterTrainers } from "@/components/calculator/MasterTrainers";

interface ResultadoProps {
  resultado: CalculatorResult;
  polimentosMes: number;
  compostosUsuario: CompostoInput[];
  boinasUsuario: BoinaInput[];
  zvizzerSettings: ZvizzerDisplaySettings;
  onVerRevendedores: () => void;
  onNovoCalculo: () => void;
}

/**
 * A página final é dividida em três fases:
 * - Fase 1: só o custo operacional atual, fechado (compostos + boinas +
 *   custo/hora), seguido de um convite com a economia que a Zvizzer entrega.
 * - Fase 2 (após o clique no convite), na ordem definida pela Zvizzer:
 *   1. gatilho "nem tudo está perdido" com os ganhos possíveis
 *   2. tabela Atual × Zvizzer (custo, diferença em R$ e em %)
 *   3. como chegamos nesse custo (quantidades + tecnologia)
 *   4. potencial mensal
 *   5. convite para receber conteúdo dos Master Trainers
 * - Fase 3 (após o clique nesse convite): captação opcional de contato +
 *   Master Trainers → revendedores, numa tela própria.
 */
export function Resultado({
  resultado,
  polimentosMes,
  compostosUsuario,
  boinasUsuario,
  zvizzerSettings,
  onVerRevendedores,
  onNovoCalculo,
}: ResultadoProps) {
  const economiaNegativa = resultado.economiaMensal < 0;
  const [fase, setFase] = useState<"custo" | "economia" | "contato">("custo");
  const gatilhoRef = useRef<HTMLDivElement>(null);

  // Ao trocar de fase, leva a pessoa até o começo do conteúdo novo.
  useEffect(() => {
    if (fase === "economia") {
      gatilhoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (fase === "contato") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [fase]);

  return (
    // Sem `items-start` de propósito: a coluna lateral precisa esticar até o
    // fim da linha para o `sticky` ter por onde correr.
    <div
      className={
        fase === "custo"
          ? "mx-auto w-full max-w-2xl"
          : "lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10"
      }
    >
      {/* Coluna fixa do desktop, à esquerda: acompanha a rolagem do resultado.
          No celular ela some e a foto aparece junto do formulário. Só entra
          na segunda fase: a primeira mostra apenas o custo atual. */}
      {fase !== "custo" && (
        <aside className="hidden lg:block">
          <MasterTrainers variante="coluna" />
        </aside>
      )}

      <div className="flex flex-col gap-8">
      {/* Fase 3: captação de contato, numa tela própria */}
      {fase === "contato" && (
        <div className="mx-auto w-full max-w-xl">
          <CaptacaoLead
            resultado={resultado}
            polimentosMes={polimentosMes}
            onConcluir={onVerRevendedores}
          />
        </div>
      )}

      {/* 1. Custo operacional atual */}
      {fase !== "contato" && (
      <BlocoCusto
        titulo="Seu custo operacional hoje"
        subtitulo={`Por carro, considerando ${polimentosMes} polimentos/mês`}
        custoCompostos={resultado.custoCompostosAtual}
        custoBoinas={resultado.custoBoinasAtual}
        custoMaoDeObra={resultado.custoMaoDeObraAtual}
        custoHora={resultado.custoHoraEfetivo}
        horas={resultado.horasAtuais}
        total={resultado.custoOperacionalAtual}
        mensagemTotal="Seu custo de polimento por carro atual é de"
      />
      )}

      {/* Convite para a segunda fase */}
      {fase === "custo" && (
        <ConviteEconomia
          economiaPorCarro={resultado.economiaPorCarro}
          reducaoPercentual={
            resultado.custoOperacionalAtual > 0
              ? resultado.economiaPorCarro / resultado.custoOperacionalAtual
              : 0
          }
          onClick={() => setFase("economia")}
        />
      )}

      {fase === "economia" && (
        <>
      {/* 2. Gatilho */}
      <div ref={gatilhoRef} className="scroll-mt-6">
        <GatilhoEconomia resultado={resultado} />
      </div>

      {/* 3. Atual × Zvizzer, item a item, com a diferença em R$ e % */}
      <TabelaComparativa resultado={resultado} />

      {/* 4. O racional por trás do número */}
      <ComoChegamos
        resultado={resultado}
        compostosUsuario={compostosUsuario}
        boinasUsuario={boinasUsuario}
        zvizzer={zvizzerSettings}
      />

      {/* 5. Potencial mensal */}
      <section className="rounded-3xl border border-accent/30 bg-gradient-to-b from-accent/10 to-transparent p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          Seu potencial por mês
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 text-left sm:grid-cols-3">
          <Metrica
            label={economiaNegativa ? "Diferença de custo" : "Economia operacional"}
            valor={formatarMoeda(resultado.economiaMensal)}
            destaque={!economiaNegativa}
          />
          <Metrica
            label="Horas liberadas"
            valor={formatarHoras(resultado.horasLiberadasMes)}
          />
          <Metrica
            label="Potencial de faturamento"
            valor={formatarMoeda(resultado.capacidadeFaturamento)}
          />
        </div>

        <div className="mt-8 border-t border-accent/20 pt-6">
          <p className="text-sm text-muted">Impacto econômico potencial</p>
          <p className="mt-1 text-4xl font-black tabular-nums text-accent sm:text-5xl">
            {formatarMoeda(resultado.impactoEconomicoPotencial)}
            <span className="text-lg font-medium text-muted">/mês</span>
          </p>
        </div>

        {resultado.horasLiberadasMes > 0 && (
          <p className="mt-4 text-sm text-muted">
            São {formatarHoras(resultado.horasLiberadasMes)} livres na sua agenda todo mês, sem
            aumentar sua carga de trabalho.
          </p>
        )}
      </section>

      {/* 6. Convite para a captação de contato (fase 3) */}
      <ConviteContato onClick={() => setFase("contato")} />

      <p className="text-center text-xs leading-relaxed text-muted">
        As horas liberadas podem virar novos polimentos, outros serviços, gestão da empresa ou
        menos carga de trabalho. O potencial de faturamento é o valor comercial dessas horas, não
        um faturamento garantido.
      </p>

      <button
        type="button"
        onClick={onNovoCalculo}
        className="text-center text-sm text-muted underline underline-offset-4"
      >
        Fazer novo cálculo
      </button>

      {/* A marca aparece só aqui, no fim da jornada — a abertura é neutra. */}
      <footer className="flex flex-col items-center gap-3 border-t border-border pt-8">
        <span className="text-[10px] uppercase tracking-widest text-muted">
          Tecnologia alemã
        </span>
        {/* Logo oficial da marca (PNG gerado do PDF enviado pela Zvizzer).
            `mix-blend-screen` some com o fundo preto do arquivo, encaixando
            a arte no fundo da página sem precisar de PNG transparente. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marca/zvizzer-logo.png"
          alt="Zvizzer"
          className="h-24 w-auto mix-blend-screen"
        />
        </footer>
        </>
      )}
      </div>
    </div>
  );
}

/** Ponte da segunda para a terceira fase: leva ao formulário de contato. */
function ConviteContato({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/[0.12] to-transparent p-6 text-center transition-all hover:border-accent active:scale-[0.99]"
    >
      <span className="block text-lg font-bold leading-snug">
        Quer receber conteúdo gratuito dos Masters Trainers da Zvizzer Brasil?
      </span>
      <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-base font-semibold text-accent-foreground group-hover:bg-accent-strong">
        Clique Aqui!
        <span aria-hidden>→</span>
      </span>
    </button>
  );
}

/**
 * Ponte da primeira para a segunda fase. Os números vêm do cálculo daquela
 * pessoa com o processo Zvizzer (economia por polimento, em R$ e em %). Se não
 * houver economia, o texto muda em vez de prometer o que não existe.
 */
function ConviteEconomia({
  economiaPorCarro,
  reducaoPercentual,
  onClick,
}: {
  economiaPorCarro: number;
  reducaoPercentual: number;
  onClick: () => void;
}) {
  const temEconomia = economiaPorCarro > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/[0.12] to-transparent p-6 text-center transition-all hover:border-accent active:scale-[0.99]"
    >
      <span className="block text-lg font-bold leading-snug">Gostou de saber o seu custo?</span>
      <span className="mt-2 block text-base leading-relaxed text-muted">
        {temEconomia ? (
          <>
            Saiba como economizar{" "}
            <strong className="font-extrabold tabular-nums text-accent">
              {formatarMoeda(economiaPorCarro, true)}
            </strong>{" "}
            ou{" "}
            <strong className="font-extrabold tabular-nums text-accent">
              {formatarPercentual(reducaoPercentual, 0)}
            </strong>{" "}
            no seu polimento!
          </>
        ) : (
          "Veja como fica o mesmo polimento com a tecnologia alemã Zvizzer!"
        )}
      </span>
      <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-base font-semibold text-accent-foreground group-hover:bg-accent-strong">
        Clique aqui!
        <span aria-hidden>→</span>
      </span>
    </button>
  );
}

function Metrica({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold tabular-nums ${
          destaque ? "text-accent" : "text-foreground"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
