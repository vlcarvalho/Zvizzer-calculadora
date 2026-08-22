import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obterSessaoAdmin } from "@/lib/auth";
import { laborSettingsSchema, zvizzerSettingsSchema } from "@/lib/validation";

/**
 * GET/PUT dos parâmetros administráveis (Zvizzer + mão de obra). Protegido
 * pelo proxy.ts (matcher /api/admin/:path*); a checagem de sessão abaixo é
 * uma segunda camada de defesa, seguindo a recomendação do próprio Next.js
 * de não depender só do proxy para autorização.
 */
export async function GET() {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const [zvizzer, labor] = await Promise.all([
    prisma.zvizzerSettings.findUnique({ where: { id: "default" } }),
    prisma.laborSettings.findUnique({ where: { id: "default" } }),
  ]);

  return NextResponse.json({ zvizzer, labor });
}

export async function PUT(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { zvizzer, labor } = raw as { zvizzer?: unknown; labor?: unknown };

  if (zvizzer !== undefined) {
    const parsed = zvizzerSettingsSchema.safeParse(zvizzer);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros Zvizzer inválidos.", details: parsed.error.issues },
        { status: 400 }
      );
    }
    await prisma.zvizzerSettings.update({
      where: { id: "default" },
      data: { ...parsed.data, updatedBy: sessao.email },
    });
  }

  if (labor !== undefined) {
    const parsed = laborSettingsSchema.safeParse(labor);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros de mão de obra inválidos.", details: parsed.error.issues },
        { status: 400 }
      );
    }
    await prisma.laborSettings.update({ where: { id: "default" }, data: parsed.data });
  }

  return NextResponse.json({ ok: true });
}
