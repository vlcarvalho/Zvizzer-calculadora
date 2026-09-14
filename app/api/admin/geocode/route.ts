import { NextResponse } from "next/server";
import { obterSessaoAdmin } from "@/lib/auth";
import { excedeuLimite } from "@/lib/rate-limit";

const UA = {
  // O Nominatim exige identificação de quem está chamando.
  "User-Agent": "CalculadoraPolimentoZvizzer/1.0 (contato via painel admin)",
  "Accept-Language": "pt-BR",
};

interface EnderecoViaCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

async function buscarEnderecoPorCep(cep: string): Promise<EnderecoViaCep | null> {
  const somenteDigitos = cep.replace(/\D/g, "");
  if (somenteDigitos.length !== 8) return null;

  const resposta = await fetch(`https://viacep.com.br/ws/${somenteDigitos}/json/`).catch(
    () => null
  );
  if (!resposta?.ok) return null;

  const dados = (await resposta.json().catch(() => null)) as EnderecoViaCep | null;
  return dados && !dados.erro ? dados : null;
}

async function coordenadasDe(consulta: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", consulta);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");

  const resposta = await fetch(url, { headers: UA }).catch(() => null);
  if (!resposta?.ok) return null;

  const dados = (await resposta.json().catch(() => [])) as Array<{ lat?: string; lon?: string }>;
  const primeiro = dados[0];
  if (!primeiro?.lat || !primeiro?.lon) return null;

  return { latitude: Number(primeiro.lat), longitude: Number(primeiro.lon) };
}

/**
 * Descobre latitude/longitude de um revendedor. Com CEP, busca o logradouro
 * no ViaCEP e geocodifica a rua (bem mais preciso); sem CEP, cai para o
 * centro da cidade. Ambos os serviços são gratuitos e sem chave de API.
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
  const cep = searchParams.get("cep")?.trim();

  if (!cidade && !cep) {
    return NextResponse.json(
      { error: "Informe o CEP ou a cidade e o estado." },
      { status: 400 }
    );
  }

  // 1ª tentativa: endereço completo a partir do CEP.
  if (cep) {
    const endereco = await buscarEnderecoPorCep(cep);
    if (endereco?.logradouro && endereco.localidade) {
      const posicao = await coordenadasDe(
        `${endereco.logradouro}, ${endereco.bairro ?? ""}, ${endereco.localidade}, ${endereco.uf ?? ""}, Brasil`
      );
      if (posicao) {
        return NextResponse.json({
          ...posicao,
          precisao: "rua",
          cidade: endereco.localidade,
          estado: endereco.uf,
        });
      }
    }
  }

  // 2ª tentativa: centro da cidade.
  if (cidade && estado) {
    const posicao = await coordenadasDe(`${cidade}, ${estado}, Brasil`);
    if (posicao) return NextResponse.json({ ...posicao, precisao: "cidade" });
  }

  return NextResponse.json(
    { error: "Não encontramos essa localização. Preencha as coordenadas manualmente." },
    { status: 404 }
  );
}
