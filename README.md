# Controle da Obra — Lagoa Santa (MG)

Aplicação web que substitui o caderno e a planilha no controle financeiro e de
execução da construção da casa. Três usuários: um administrador (lança e edita
tudo) e dois visualizadores (acompanham dashboard e relatórios).

O número mais importante do sistema é o **adiantamento ao pedreiro**
(total pago − valor de serviço entregue): o pagamento é semanal e fixo,
desvinculado de entrega, então o pago corre à frente do executado. O dashboard
mantém esse delta sempre visível.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS 4 + componentes no padrão shadcn/ui
- **Supabase** (free tier): Postgres, Auth, Storage (comprovantes), RLS em todas as tabelas
- **Vercel** (free tier) para hospedagem, deploy pela integração nativa com o GitHub
- **GitHub Actions**: CI (lint, typecheck, testes, build) e ping que evita a pausa do Supabase

Nenhum serviço pago.

> Os componentes de UI seguem o padrão shadcn/ui (`src/components/ui` + `components.json`),
> escritos no repositório em vez de baixados pelo CLI — o resultado é o mesmo e novos
> componentes podem ser adicionados com `npx shadcn@latest add <componente>`.

## Setup do zero

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (plano Free).
2. No painel, abra **SQL Editor** e execute, na ordem:
   - `supabase/migrations/0001_schema.sql` (tabelas, RLS, bucket de comprovantes)
   - `supabase/migrations/0002_seed.sql` (dados reais da obra: etapas, pagamentos, material)
3. Em **Settings → API**, copie a `URL`, a chave `anon` e a chave `service_role`.

Alternativa por CLI: `supabase link --project-ref SEU_REF && supabase db push`.

### 2. Variáveis de ambiente e usuários

```bash
cp .env.example .env    # preencha com as chaves do passo anterior
npm install
npm run seed:usuarios   # cria os 3 usuários definidos em SEED_USUARIOS no .env
```

O login é por **CPF + senha**. Internamente o CPF vira um e-mail sintético
(`{cpf}@obra.local`) usado no Supabase Auth — não existe tabela de senhas
própria e o CPF não aparece em logs, URLs nem mensagens de erro. Não há
cadastro público: usuários só entram pelo seed (ou pelo painel do Supabase,
criando o e-mail sintético e a linha em `perfis`).

Depois do seed, ajuste em `configuracoes` (tabela) o `nome_responsavel_obra`
e, quando existir um prazo acordado, a `data_alvo`.

### 3. Rodar localmente

```bash
npm run dev
```

### 4. Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) (framework: Next.js, sem configuração extra).
2. Em **Settings → Environment Variables**, defina:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (usada só no servidor, para o aceite público de relatórios)
3. Cada push na branch principal gera deploy automático.

### 5. Secrets do GitHub (keepalive)

O free tier do Supabase **pausa projetos sem atividade por 7 dias**. O workflow
`.github/workflows/keepalive.yml` faz um ping duas vezes por semana para evitar
isso. Configure em **Settings → Secrets and variables → Actions**:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Decisões de modelagem

- **Valores em centavos** (`integer`) no banco; formatação BRL só na exibição.
- **Datas em `date`**, sem timezone.
- **Mão de obra e material são linhas de custo separadas** — nunca somadas dentro
  do orçamento do pedreiro. O custo total da obra é a soma das duas.
- **Avanço físico ponderado pelo valor da etapa**: `Σ(valor × %) / Σ(valor)`.
  A contagem simples de etapas concluídas também é exibida, mas o ponderado manda.
- **Etapas com `valor_rateado = true`** vieram dos pacotes fechados do orçamento
  original (R$ 18.000 de acabamento e R$ 11.000 de gesso/marcos/pintura) e são
  marcadas visualmente; os valores são editáveis.
- **Aditivos** (ex.: telhado da casa, se entrar) são etapas com `origem = 'aditivo'`
  e pagamentos com `tipo = 'aditivo'`, sempre separados do contrato original.
- **Relatórios aceitos são imutáveis**: um trigger no banco rejeita UPDATE/DELETE
  após `aceito_em`. O aceite é feito pelo pedreiro em link público com token,
  validado no servidor com service role (sem abrir RLS para anônimos).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir |
| `npm run test` | testes (cálculos financeiros, CPF) |
| `npm run seed:usuarios` | cria usuários do `.env` no Supabase Auth |
