import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Em desenvolvimento o Next bloqueia origens diferentes de localhost. Isso
  // libera o domínio do túnel do Cloudflare, usado para abrir o link de teste
  // para outras pessoas. Não tem efeito em produção.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
