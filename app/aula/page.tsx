import type { Metadata } from "next";
import { ResellerList } from "@/components/resellers/ResellerList";

// Link divulgado na comunidade, depois de cada aula. A prévia que aparece no
// WhatsApp vem do título/descrição daqui e de opengraph-image.tsx.
export const metadata: Metadata = {
  title: "Encontre um revendedor Zvizzer",
  description:
    "Veja os revendedores Zvizzer perto de você e fale direto pelo WhatsApp.",
  openGraph: {
    title: "Encontre um revendedor Zvizzer",
    description: "Veja os revendedores Zvizzer perto de você e fale direto pelo WhatsApp.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function AulaPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8 sm:py-14">
      <ResellerList origem="aula" />
    </main>
  );
}
