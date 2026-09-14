import { Wizard } from "@/components/calculator/Wizard";

export default function CalculadoraPage() {
  return (
    // Estreita no celular e nas etapas; no desktop abre espaço para a coluna
    // fixa dos Master Trainers ao lado do resultado.
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-8 sm:py-14 lg:max-w-4xl">
      <Wizard />
    </main>
  );
}
