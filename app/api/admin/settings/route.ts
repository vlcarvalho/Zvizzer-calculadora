import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obterSessaoAdmin } from "@/lib/auth";
import { zvizzerSettingsSchema } from "@/lib/validation";

/**
 * GET/PUT dos parâmetros administráveis do processo Zvizzer. Protegido
 * pelo proxy.ts (matcher /api/admin/:path*); a checagem de sessão abaixo é
 * uma segunda camada de defesa, seguindo a recomendação do próprio Next.js
 * de não depender só do proxy para autorização. A referência de horas/mês
 * (220h) é uma constante fixa do motor de cálculo — não é mais editável
 * pelo admin.
 */
export async function GET() {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const zvizzer = await prisma.zvizzerSettings.findUnique({ where: { id: "default" } });

  return NextResponse.json({ zvizzer });
}

export async function PUT(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { zvizzer } = raw as { zvizzer?: unknown };

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

  return NextResponse.json({ ok: true });
}
