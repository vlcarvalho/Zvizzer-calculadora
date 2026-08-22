import { formatarHoras, formatarMoeda } from "./format";

/** Remove tudo que não for dígito (mantém apenas o número em formato E.164 sem símbolos). */
export function sanitizarWhatsapp(numero: string): string {
  return numero.replace(/\D/g, "");
}

export interface DadosMensagemWhatsapp {
  polimentosMes: number;
  horasLiberadasMes: number;
  economiaMensal: number;
}

/**
 * Monta o link wa.me com mensagem pré-preenchida (spec §17). Nunca envia
 * automaticamente — o usuário ainda precisa clicar em "enviar" dentro do
 * WhatsApp. Sem WhatsApp Business API, sem chatbot.
 */
export function montarLinkWhatsapp(
  whatsappRevendedor: string,
  dados?: DadosMensagemWhatsapp
): string {
  const numero = sanitizarWhatsapp(whatsappRevendedor);

  const mensagem = dados
    ? [
        "Olá! Fiz a Calculadora de Eficiência de Polimento Zvizzer.",
        `Atualmente realizo aproximadamente ${dados.polimentosMes} polimentos por mês.`,
        `Meu resultado indicou aproximadamente ${formatarHoras(
          dados.horasLiberadasMes
        )} de potencial otimização por mês e ${formatarMoeda(
          dados.economiaMensal
        )} de economia operacional.`,
        "Gostaria de conhecer os compostos e boinas Zvizzer indicados para minha operação.",
      ].join("\n")
    : [
        "Olá! Encontrei este revendedor na Calculadora de Eficiência de Polimento Zvizzer.",
        "Gostaria de conhecer os compostos e boinas Zvizzer indicados para minha operação.",
      ].join("\n");

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
