import "server-only";

/** Tipos aceitos no upload de logo. SVG fica de fora de propósito: é XML e
 * pode carregar script, virando um vetor de ataque numa página pública. */
const TIPOS_ACEITOS = ["image/png", "image/jpeg", "image/webp"];

/** Teto do que é gravado no banco. O painel já reduz a imagem antes de
 * enviar; isso aqui é a rede de segurança. */
const TAMANHO_MAXIMO_BYTES = 1_000_000; // 1 MB

export interface LogoRecebida {
  logoData: Buffer;
  logoTipo: string;
}

export type ResultadoLogo =
  | { ok: true; logo: LogoRecebida | null }
  | { ok: false; erro: string };

/**
 * Converte a logo que veio do painel (data URL) em bytes prontos para o
 * banco. `undefined` significa "não mexer na logo atual"; `null` significa
 * "remover a logo".
 */
export function interpretarLogoEnviada(valor: unknown): ResultadoLogo {
  if (valor === undefined) return { ok: true, logo: null };
  if (valor === null || valor === "") return { ok: true, logo: null };

  if (typeof valor !== "string") {
    return { ok: false, erro: "Formato de imagem não reconhecido." };
  }

  const partes = valor.match(/^data:([^;]+);base64,(.+)$/);
  if (!partes) {
    return { ok: false, erro: "Formato de imagem não reconhecido." };
  }

  const [, tipo, base64] = partes;
  if (!TIPOS_ACEITOS.includes(tipo)) {
    return { ok: false, erro: "Use uma imagem PNG, JPG ou WEBP." };
  }

  const bytes = Buffer.from(base64, "base64");
  if (bytes.length === 0) {
    return { ok: false, erro: "A imagem chegou vazia. Tente novamente." };
  }
  if (bytes.length > TAMANHO_MAXIMO_BYTES) {
    return { ok: false, erro: "A imagem ficou grande demais. Use uma menor." };
  }

  return { ok: true, logo: { logoData: bytes, logoTipo: tipo } };
}
