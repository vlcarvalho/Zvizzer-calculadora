import { Wizard } from "@/components/calculator/Wizard";

export default function CalculadoraPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-8 sm:py-14">
      <Wizard />
    </main>
  );
}
