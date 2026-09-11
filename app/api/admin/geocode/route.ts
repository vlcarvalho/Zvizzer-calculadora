import { NextResponse } from "next/server";
import { obterSessaoAdmin } from "@/lib/auth";
import { excedeuLimite } from "@/lib/rate-limit";

/**
 * Busca latitude/longitude de uma cidade usando o Nominatim (OpenStreetMap),
 * que é gratuito e sem chave de API. Usado só pelo admin, ao cadastrar um
 * revendedor — daí o rate limit conservador, que é exigência de uso do
 * serviço (máximo ~1 req/s).
 */
export async function GET(request: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  if (excedeuLimite(`geocode:${sessao.sub}`)) {
    return NextResponse.json(
      { error: "Muitas buscas seguidas. Aguarde um instante." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const cidade = searchParams.get("cidade")?.trim();
  const estado = searchParams.get("estado")?.trim();

  if (!cidade || !estado) {
    return NextResponse.json({ error: "Informe cidade e estado." }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", `${cidade}, ${estado}, Brasil`);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");

  const resposta = await fetch(url, {
    headers: {
      // O Nominatim exige identificação de quem está chamando.
      "User-Agent": "CalculadoraPolimentoZvizzer/1.0 (contato via painel admin)",
      "Accept-Language": "pt-BR",
    },
  }).catch(() => null);

  if (!resposta || !resposta.ok) {
    return NextResponse.json(
      { error: "Não foi possível consultar o serviço de mapas agora." },
      { status: 502 }
    );
  }

  const dados = (await resposta.json().catch(() => [])) as Array<{
    lat?: string;
    lon?: string;
  }>;

  const primeiro = dados[0];
  if (!primeiro?.lat || !primeiro?.lon) {
    return NextResponse.json(
      { error: "Cidade não encontrada. Preencha as coordenadas manualmente." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    latitude: Number(primeiro.lat),
    longitude: Number(primeiro.lon),
  });
}
