"use client";

import type { BoinaInput, CalculatorResult, CompostoInput } from "@/lib/calculations";
import type { ZvizzerDisplaySettings } from "@/lib/hooks/use-settings";
import { formatarHoras, formatarMoeda } from "@/lib/format";
import { BlocoCusto } from "@/components/calculator/BlocoCusto";
import { GatilhoEconomia } from "@/components/calculator/GatilhoEconomia";
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
 * Sequência da página final, na ordem definida pela Zvizzer:
 * 1. custo atual fechado (compostos + boinas + custo/hora)
 * 2. gatilho "nem tudo está perdido" com os ganhos possíveis
 * 3. custo com Zvizzer, no mesmo formato
 * 4. como chegamos nesse custo (quantidades + tecnologia)
 * 5. potencial mensal
 * 6. captação de contato + Master Trainers → revendedores
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

  return (
    // Sem `items-start` de propósito: a coluna lateral precisa esticar até o
    // fim da linha para o `sticky` ter por onde correr.
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-10">
      <div className="flex flex-col gap-8">
      {/* 1. Custo operacional atual */}
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

      {/* 2. Gatilho */}
      <GatilhoEconomia resultado={resultado} />

      {/* 3. Custo com Zvizzer, no mesmo formato */}
      <BlocoCusto
        destaque
        titulo="Com a tecnologia alemã Zvizzer"
        subtitulo="Mesmo carro, mesmo custo-hora da sua operação"
        custoCompostos={resultado.custoCompostoZvizzer}
        custoBoinas={resultado.custoBoinaZvizzer}
        custoMaoDeObra={resultado.custoMaoDeObraZvizzer}
        custoHora={resultado.custoHoraEfetivo}
        horas={resultado.horasZvizzer}
        total={resultado.custoOperacionalZvizzer}
        mensagemTotal="Seu custo de polimento por carro passaria a ser"
        reducaoPercentual={
          resultado.custoOperacionalAtual > 0
            ? (resultado.custoOperacionalAtual - resultado.custoOperacionalZvizzer) /
              resultado.custoOperacionalAtual
            : undefined
        }
      />

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

      {/* 6. Captação + Master Trainers → revendedores */}
      <CaptacaoLead
        resultado={resultado}
        polimentosMes={polimentosMes}
        onConcluir={onVerRevendedores}
      />

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
      </div>

      {/* Coluna fixa do desktop: acompanha a rolagem de todo o resultado. */}
      <aside className="hidden lg:block">
        <MasterTrainers variante="coluna" />
      </aside>
    </div>
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
