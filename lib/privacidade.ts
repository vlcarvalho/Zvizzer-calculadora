/**
 * Textos e versão da política de privacidade.
 *
 * A versão é gravada junto de cada consentimento: se o texto mudar, dá para
 * saber exatamente o que cada pessoa aceitou (LGPD art. 8º, §1º — cabe ao
 * controlador comprovar o consentimento).
 *
 * IMPORTANTE: a revisão jurídica ainda é necessária. Os campos marcados como
 * PENDENTE precisam dos dados reais da empresa antes da publicação.
 */

export const POLITICA_VERSAO = "2026-09-14";

export const CONTROLADOR = {
  nome: "Foamtec / Zvizzer Brasil",
  razaoSocial: "PENDENTE: razão social completa",
  cnpj: "PENDENTE: CNPJ",
  emailContato: "PENDENTE: e-mail de contato para privacidade",
  encarregado: "PENDENTE: nome do encarregado (DPO) e e-mail",
};

/** Texto exato do aceite, gravado junto do contato como prova. */
export const TEXTO_CONSENTIMENTO =
  "Autorizo a Zvizzer a usar meu e-mail e WhatsApp para entrar em contato e " +
  "enviar conteúdos sobre polimento e seus produtos, e declaro ter lido a " +
  "Política de Privacidade. Posso revogar este consentimento a qualquer momento.";
