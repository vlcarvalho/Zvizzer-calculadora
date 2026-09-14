"use client";

import { useMemo, useState } from "react";
import { useCalculatorStore } from "@/lib/store/calculator-store";
import { useSettings } from "@/lib/hooks/use-settings";
import { calcular } from "@/lib/calculations";
import { converterParaCalculatorInput } from "@/lib/store-to-input";
import {
  validarEtapaBoinas,
  validarEtapaCompostos,
  validarEtapaCustosFixos,
  validarEtapaVolume,
  type ErrosCampo,
  type ErrosPorItem,
} from "@/lib/step-validation";
import { track } from "@/lib/analytics";
import { StepVolume } from "@/components/calculator/StepVolume";
import { StepCustosFixos } from "@/components/calculator/StepCustosFixos";
import { StepCompostos } from "@/components/calculator/StepCompostos";
import { StepBoinas } from "@/components/calculator/StepBoinas";
import { Resultado } from "@/components/calculator/Resultado";
import { ResellerList } from "@/components/resellers/ResellerList";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

type Fase = "form" | "resultado" | "revendedores";

const TOTAL_ETAPAS = 4;

export function Wizard() {
  const store = useCalculatorStore();
  const { settings, carregando, erro } = useSettings();
  const [fase, setFase] = useState<Fase>("form");
  const [erros, setErros] = useState<ErrosCampo>({});
  const [errosItens, setErrosItens] = useState<ErrosPorItem>({});

  const resultado = useMemo(() => {
    if (!settings) return null;
    const input = converterParaCalculatorInput(store);
    return calcular(input, settings.zvizzer, settings.labor);
  }, [settings, store]);

  function validarEtapaAtual(): boolean {
    let errosEtapa: ErrosCampo = {};
    let errosLista: ErrosPorItem = {};

    if (store.etapa === 1) errosEtapa = validarEtapaVolume(store.volumePreco);
    if (store.etapa === 2) errosEtapa = validarEtapaCustosFixos(store.custosFixos);
    if (store.etapa === 3) errosLista = validarEtapaCompostos(store.compostos);
    if (store.etapa === 4) errosLista = validarEtapaBoinas(store.boinas);

    setErros(errosEtapa);
    setErrosItens(errosLista);
    return Object.keys(errosEtapa).length === 0 && Object.keys(errosLista).length === 0;
  }

  function limparErros() {
    setErros({});
    setErrosItens({});
  }

  function handleContinuar() {
    if (!validarEtapaAtual()) return;

    track(`step_${store.etapa}_completed` as `step_${1 | 2 | 3 | 4}_completed`);

    if (store.etapa < TOTAL_ETAPAS) {
      store.proximaEtapa();
      limparErros();
      return;
    }

    track("calculation_completed");
    track("results_viewed");
    setFase("resultado");
  }

  function handleVoltar() {
    limparErros();
    store.etapaAnterior();
  }

  function handleNovoCalculo() {
    store.reiniciar();
    setFase("form");
    limparErros();
  }

  if (carregando) {
    return <p className="py-20 text-center text-muted">Carregando calculadora…</p>;
  }

  if (erro || !settings) {
    return (
      <p className="py-20 text-center text-danger">
        Não foi possível carregar a calculadora agora. Tente novamente em instantes.
      </p>
    );
  }

  if (fase === "revendedores" && resultado) {
    return (
      <ResellerList
        dadosMensagem={{
          polimentosMes: store.volumePreco.polimentosMes,
          horasLiberadasMes: resultado.horasLiberadasMes,
          economiaMensal: resultado.economiaMensal,
        }}
      />
    );
  }

  if (fase === "resultado" && resultado) {
    return (
      <Resultado
        resultado={resultado}
        polimentosMes={store.volumePreco.polimentosMes}
        compostosUsuario={store.compostos}
        boinasUsuario={store.boinas}
        zvizzerSettings={settings.zvizzer}
        onVerRevendedores={() => setFase("revendedores")}
        onNovoCalculo={handleNovoCalculo}
      />
    );
  }

  return (
    // As etapas seguem estreitas mesmo no desktop: formulário largo demais
    // fica desconfortável de preencher.
    <div className="flex w-full max-w-xl flex-col gap-8">
      <ProgressBar etapaAtual={store.etapa} totalEtapas={TOTAL_ETAPAS} />

      {store.etapa === 1 && <StepVolume erros={erros} />}
      {store.etapa === 2 && (
        <StepCustosFixos erros={erros} horasBaseMensais={settings.labor.horasBaseMensais} />
      )}
      {store.etapa === 3 && <StepCompostos erros={errosItens} />}
      {store.etapa === 4 && <StepBoinas erros={errosItens} />}

      <div className="flex gap-3">
        {store.etapa > 1 && (
          <Button variant="secondary" onClick={handleVoltar} fullWidth={false} className="flex-1">
            Voltar
          </Button>
        )}
        <Button onClick={handleContinuar} className="flex-[2]">
          {store.etapa < TOTAL_ETAPAS ? "Continuar" : "Ver meu resultado"}
        </Button>
      </div>
    </div>
  );
}
