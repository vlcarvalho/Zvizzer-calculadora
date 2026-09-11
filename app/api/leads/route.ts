import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { excedeuLimite, obterIpRequisicao } from "@/lib/rate-limit";
import { sanitizarWhatsapp } from "@/lib/whatsapp";

const leadSchema = z.object({
  email: z.email({ message: "Informe um e-mail válido." }),
  whatsapp: z.string().min(10, { message: "Informe um WhatsApp válido com DDD." }),
  polimentosMes: z.number().int().min(0),
  custoAtualPorCarro: z.number(),
  custoZvizzerPorCarro: z.number(),
  economiaMensal: z.number(),
  horasLiberadasMes: z.number(),
});

/**
 * Contato deixado voluntariamente no fim do resultado. Guarda o e-mail, o
 * WhatsApp e um retrato do cálculo daquela pessoa — nada além disso.
 */
export async function POST(request: Request) {
  const ip = obterIpRequisicao(request);
  if (excedeuLimite(`lead:${ip}`)) {
    return NextResponse.json(
      { error: "Muitos envios. Aguarde alguns minutos e tente novamente." },
      { status: 429 }
    );
  }

  const raw = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const dados = parsed.data;
  await prisma.lead.create({
    data: { ...dados, whatsapp: sanitizarWhatsapp(dados.whatsapp) },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
