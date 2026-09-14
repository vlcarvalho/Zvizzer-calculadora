"use client";

import { useRef, useState } from "react";

interface UploadLogoProps {
  /** Logo já salva (caminho ou /api/revendedores/{id}/logo). */
  logoAtual: string | null;
  /** data URL da nova imagem, "" para remover, null para não mexer. */
  onChange: (logoBase64: string | null) => void;
}

const LADO_MAXIMO = 400; // px — o selo é exibido a 48px; 400 cobre telas retina
const TAMANHO_MAXIMO_ORIGINAL = 10 * 1024 * 1024; // 10 MB antes de reduzir

/**
 * Upload de logo com redução feita no próprio navegador: o arquivo original
 * pode ter 5 MB, mas o que sobe é uma imagem de no máximo 400px. Assim o
 * envio é rápido e o banco não engorda.
 */
export function UploadLogo({ logoAtual, onChange }: UploadLogoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removida, setRemovida] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);

  const exibindo = preview ?? (removida ? null : logoAtual);

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setErro(null);

    if (!arquivo.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_ORIGINAL) {
      setErro("Imagem muito grande (máximo 10 MB).");
      return;
    }

    setProcessando(true);
    try {
      const dataUrl = await reduzirImagem(arquivo);
      setPreview(dataUrl);
      setRemovida(false);
      onChange(dataUrl);
    } catch {
      setErro("Não foi possível ler essa imagem. Tente outro arquivo.");
    } finally {
      setProcessando(false);
    }
  }

  function handleRemover() {
    setPreview(null);
    setRemovida(true);
    setErro(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange("");
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Logo da loja</span>

      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
          {exibindo ? (
            // Pode ser data URL (preview) ou caminho salvo — <img> simples dá conta.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={exibindo} alt="Logo" className="h-full w-full object-contain p-1" />
          ) : (
            <span className="text-[10px] text-muted">sem logo</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleArquivo}
            className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-foreground hover:file:bg-border"
          />
          {exibindo && (
            <button
              type="button"
              onClick={handleRemover}
              className="w-fit text-xs text-danger hover:underline"
            >
              Remover logo
            </button>
          )}
        </div>
      </div>

      {processando && <span className="text-xs text-muted">Preparando imagem…</span>}
      {erro && <span className="text-xs text-danger">{erro}</span>}
      {!erro && !processando && (
        <span className="text-xs text-muted">
          PNG, JPG ou WEBP. A imagem é reduzida automaticamente antes de subir.
        </span>
      )}
    </div>
  );
}

/** Redesenha a imagem num canvas de no máximo 400px e devolve como data URL. */
function reduzirImagem(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("falha ao ler"));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("falha ao decodificar"));
      img.onload = () => {
        const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
        const largura = Math.round(img.width * escala);
        const altura = Math.round(img.height * escala);

        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("sem canvas"));
        ctx.drawImage(img, 0, 0, largura, altura);

        // PNG preserva transparência, que a maioria das logos usa.
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = leitor.result as string;
    };
    leitor.readAsDataURL(arquivo);
  });
}
