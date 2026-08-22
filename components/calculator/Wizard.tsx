"use client";

import { useMemo, useState } from "react";
import { useCalculatorStore } from "@/lib/store/calculator-store";
import { useSettings } from "@/lib/hooks/use-settings";
import { calcular } from "@/lib/calculations";
import { converterParaCalculatorInput } from "@/lib/store-to-input";
import {
  validarEtapaBoinas,
  validarEtapaCompostos,
  validarEtapaMaoDeObra,
  validarEtapaVolume,
  type ErrosCampo,
} from "@/lib/step-validation";
import { track } from "@/lib/analytics";
import { StepVolume } from "@/components/calculator/StepVolume";
import { StepMaoDeObra } from "@/components/calculator/StepMaoDeObra";
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

  const resultado = useMemo(() => {
    if (!settings) return null;
    const input = converterParaCalculatorInput(store);
    return calcular(input, settings.zvizzer, settings.labor);
  }, [settings, store]);

  function validarEtapaAtual(): boolean {
    let errosEtapa: ErrosCampo = {};
    if (store.etapa === 1) errosEtapa = validarEtapaVolume(store.volumePreco);
    if (store.etapa === 2) errosEtapa = validarEtapaMaoDeObra(store.membros);
    if (store.etapa === 3) errosEtapa = validarEtapaCompostos(store.compostos);
    if (store.etapa === 4) errosEtapa = validarEtapaBoinas(store.boinas);

    setErros(errosEtapa);
    return Object.keys(errosEtapa).length === 0;
  }

  function handleContinuar() {
    if (!validarEtapaAtual()) return;

    track(`step_${store.etapa}_completed` as `step_${1 | 2 | 3 | 4}_completed`);

    if (store.etapa < TOTAL_ETAPAS) {
      store.proximaEtapa();
      setErros({});
      return;
    }

    track("calculation_completed");
    track("results_viewed");
    setFase("resultado");
  }

  function handleVoltar() {
    setErros({});
    store.etapaAnterior();
  }

  function handleNovoCalculo() {
    store.reiniciar();
    setFase("form");
    setErros({});
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
        onVerRevendedores={() => setFase("revendedores")}
        onNovoCalculo={handleNovoCalculo}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ProgressBar etapaAtual={store.etapa} totalEtapas={TOTAL_ETAPAS} />

      {store.etapa === 1 && <StepVolume erros={erros} />}
      {store.etapa === 2 && <StepMaoDeObra erros={erros} />}
      {store.etapa === 3 && <StepCompostos erros={erros} />}
      {store.etapa === 4 && <StepBoinas erros={erros} />}

      {erros._geral && <p className="text-sm text-danger">{erros._geral}</p>}

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
