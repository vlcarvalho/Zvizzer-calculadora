/**
 * Rate limit simples em memória (spec §28) para a rota de login do admin.
 * Suficiente para uma instância única; se o app escalar horizontalmente,
 * trocar por um store compartilhado (ex.: Redis/Upstash).
 */

interface Tentativas {
  count: number;
  resetAt: number;
}

const tentativasPorChave = new Map<string, Tentativas>();

const JANELA_MS = 5 * 60 * 1000; // 5 minutos
const LIMITE_TENTATIVAS = 10;

export function excedeuLimite(chave: string): boolean {
  const agora = Date.now();
  const registro = tentativasPorChave.get(chave);

  if (!registro || agora > registro.resetAt) {
    tentativasPorChave.set(chave, { count: 1, resetAt: agora + JANELA_MS });
    return false;
  }

  registro.count += 1;
  return registro.count > LIMITE_TENTATIVAS;
}

export function obterIpRequisicao(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return "desconhecido";
}
