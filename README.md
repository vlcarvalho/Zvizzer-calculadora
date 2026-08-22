# Calculadora de Eficiência de Polimento — Zvizzer

Ferramenta de diagnóstico financeiro/operacional para profissionais de estética
automotiva: compara o processo atual do usuário com o "processo padrão
Zvizzer" e mostra economia, horas liberadas e potencial de faturamento,
terminando num CTA para WhatsApp de um revendedor.

Spec completo em `Calculadora de Eficiência de Polimento.docx` (Zvizzer Brasil
Awareness). Plano de implementação em `.claude/plans` (ou no histórico da
conversa que gerou este projeto).

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Prisma + Zustand + Zod.
Sem microsserviços — uma única aplicação, cálculo 100% client-side.

## Rodando localmente

```bash
npm install
cp .env.example .env   # ajuste os valores, especialmente AUTH_SECRET
npx prisma migrate dev # cria o SQLite local (prisma/dev.db)
npm run db:seed        # parâmetros Zvizzer/mão de obra + revendedores de exemplo
npm run db:seed-admin  # cria o admin inicial a partir de ADMIN_EMAIL/ADMIN_PASSWORD do .env
npm run dev
```

Abra http://localhost:3000. O painel administrativo fica em `/admin/login`.

## Scripts úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm test` | Testes unitários do motor de cálculo (Vitest) |
| `npm run lint` | ESLint |
| `npm run db:seed` | Popula parâmetros Zvizzer/mão de obra + revendedores de exemplo |
| `npm run db:seed-admin` | Cria/atualiza o admin a partir do `.env` |
| `npm run db:studio` | Prisma Studio (inspecionar o banco) |

## Estrutura

- `lib/calculations.ts` — motor de cálculo puro (sem framework), com todas as
  fórmulas do spec e testes em `lib/calculations.test.ts`. Reaproveitável
  literalmente num futuro app React Native, se o caminho mobile mudar de
  Capacitor para app nativo separado.
- `lib/store/calculator-store.ts` — estado do wizard (Zustand + persist em
  localStorage).
- `components/calculator/` — telas do wizard (Volume, Mão de obra, Compostos,
  Boinas, Resultado).
- `components/resellers/` — lista de revendedores com filtro + link WhatsApp.
- `app/admin/` — painel administrativo (dashboard de funil, parâmetros, CRUD
  de revendedores), protegido por `proxy.ts` (sessão JWT em cookie httpOnly).
- `prisma/schema.prisma` — modelo de dados (ver seção abaixo).

## Banco de dados: de SQLite (dev) para Supabase (produção)

O projeto roda em SQLite localmente por padrão, sem precisar de nenhuma conta
externa. Para produção:

1. Crie um projeto em [supabase.com](https://supabase.com) (gratuito).
2. Pegue a *connection string* do Postgres (Project Settings → Database).
3. No `.env` de produção, defina `DATABASE_URL` com essa connection string.
4. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por
   `provider = "postgresql"` no bloco `datasource db`.
5. Rode `npx prisma migrate deploy` para aplicar o schema no Supabase.
6. Rode `npm run db:seed` e `npm run db:seed-admin` apontando para o banco de
   produção.

Nenhum campo do schema é específico de SQLite, então essa troca não exige
mudanças estruturais.

## Deploy (Vercel)

1. Suba o repositório para o GitHub.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente (`DATABASE_URL`, `AUTH_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`) no painel da Vercel.
4. Rode as migrations/seed apontando para o banco de produção (passo acima)
   antes ou logo após o primeiro deploy.

Este passo de deploy é feito por você (Vinicius) diretamente na Vercel — a
sessão que gerou este projeto não tem acesso à sua conta Vercel/Supabase.

## Caminho para iOS/Android (Capacitor)

O front-end já é mobile-first, com manifest PWA (`public/manifest.json`,
`app/icon.svg`) e sem dependências server-only no caminho crítico do cálculo.
Para empacotar como app nativo:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init
npx cap add ios
npx cap add android
```

Aponte o Capacitor para a URL de produção da calculadora (ou faça um export
estático, dependendo da estratégia de distribuição desejada) e siga a
documentação do Capacitor para build/assinatura nas lojas.

## Pendências conhecidas / próximos passos

- **Revendedores**: a base está populada com 8 lojas fictícias para teste.
  Substitua pela lista real via `/admin/revendedores` antes de divulgar o link.
- **Ícones**: `public/icons/icon.svg` é um placeholder simples nas cores da
  marca. Vale substituir por ícones PNG oficiais (192/512px + apple-touch-icon)
  gerados a partir do logo real antes de empacotar com Capacitor — SVG em
  manifest tem suporte limitado em iOS/Safari.
- **Percentuais de encargos trabalhistas**: os valores iniciais em
  `prisma/seed.ts` são referência genérica — revisar com contabilidade antes
  da publicação definitiva (o próprio spec pede isso).
- **Analytics**: sem Meta Pixel/GA por design (spec §18); todo o funil vive
  no banco próprio e é visível em `/admin`.
