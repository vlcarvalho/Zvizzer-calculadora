import { prisma } from "@/lib/db";

/**
 * Serve a logo enviada pelo painel. Rota pública: a imagem é a mesma que
 * aparece na lista e no mapa para qualquer visitante.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/revendedores/[id]/logo">) {
  const { id } = await ctx.params;

  const revendedor = await prisma.reseller.findUnique({
    where: { id },
    select: { logoData: true, logoTipo: true, updatedAt: true },
  });

  if (!revendedor?.logoData) {
    return new Response("Logo não encontrada.", { status: 404 });
  }

  return new Response(new Uint8Array(revendedor.logoData), {
    headers: {
      "Content-Type": revendedor.logoTipo ?? "image/png",
      // A URL não muda quando a logo é trocada, então o cache precisa
      // revalidar; o ETag evita baixar de novo quando nada mudou.
      "Cache-Control": "public, max-age=0, must-revalidate",
      ETag: `"${revendedor.updatedAt.getTime()}"`,
    },
  });
}
