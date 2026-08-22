import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const EVENTOS_VALIDOS = [
  "calculator_view",
  "calculator_start",
  "step_1_completed",
  "step_2_completed",
  "step_3_completed",
  "step_4_completed",
  "step_5_completed",
  "calculation_completed",
  "results_viewed",
  "reseller_list_viewed",
  "whatsapp_clicked",
] as const;

const eventSchema = z.object({
  sessionId: z.string().min(1).max(200),
  eventName: z.enum(EVENTOS_VALIDOS),
  step: z.number().int().min(1).max(5).optional(),
  resellerId: z.string().optional(),
  estado: z.string().max(2).optional(),
  cidade: z.string().max(120).optional(),
});

/**
 * Analytics interno (spec §18/§21) — sem PII. Cria/atualiza a sessão anônima
 * e grava o evento. Nunca lança erro para o client: analytics não deve
 * quebrar a experiência do usuário (o client já trata falhas via catch).
 */
export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const data = eventSchema.parse(raw);

    await prisma.analyticsSession.upsert({
      where: { sessionId: data.sessionId },
      update: {},
      create: { sessionId: data.sessionId },
    });

    await prisma.analyticsEvent.create({
      data: {
        sessionId: data.sessionId,
        eventName: data.eventName,
        step: data.step,
        resellerId: data.resellerId,
        estado: data.estado,
        cidade: data.cidade,
      },
    });

    if (data.eventName === "calculation_completed") {
      await prisma.analyticsSession.update({
        where: { sessionId: data.sessionId },
        data: { completedCalculation: true },
      });
    }

    if (data.eventName === "whatsapp_clicked") {
      await prisma.analyticsSession.update({
        where: { sessionId: data.sessionId },
        data: { whatsappClicked: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Falha silenciosa: um evento de analytics perdido não deve virar erro
    // visível para o usuário da calculadora.
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
