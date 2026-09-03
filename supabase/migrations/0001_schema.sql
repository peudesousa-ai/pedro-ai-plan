-- Schema da aplicação de controle de obra.
-- Valores monetários sempre em centavos (integer). Datas em `date`, sem timezone.

create type papel_usuario as enum ('admin', 'visualizador');
create type grupo_etapa as enum ('fundacao_estrutura', 'vedacao_cobertura', 'acabamento');
create type origem_etapa as enum ('contrato', 'aditivo');
create type tipo_pagamento as enum ('mao_de_obra', 'aditivo');
create type status_material as enum ('comprado', 'necessario');

-- =====================================================================
-- Tabelas
-- =====================================================================

create table perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  cpf char(11) not null unique check (cpf ~ '^[0-9]{11}$'),
  papel papel_usuario not null default 'visualizador',
  criado_em timestamptz not null default now()
);

create table etapas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  grupo grupo_etapa not null,
  valor_orcado_centavos integer not null check (valor_orcado_centavos >= 0),
  percentual_concluido integer not null default 0
    check (percentual_concluido between 0 and 100),
  ordem integer not null,
  valor_rateado boolean not null default false,
  origem origem_etapa not null default 'contrato',
  observacao text,
  data_inicio date,
  data_conclusao date,
  criado_em timestamptz not null default now()
);

create table etapa_historico (
  id uuid primary key default gen_random_uuid(),
  etapa_id uuid not null references etapas (id) on delete cascade,
  percentual_anterior integer not null check (percentual_anterior between 0 and 100),
  percentual_novo integer not null check (percentual_novo between 0 and 100),
  autor uuid references perfis (id) on delete set null,
  nota text,
  criado_em timestamptz not null default now()
);

create table pagamentos (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  valor_centavos integer not null check (valor_centavos > 0),
  tipo tipo_pagamento not null default 'mao_de_obra',
  pago_por uuid references perfis (id) on delete set null,
  observacao text,
  comprovante_path text,
  criado_em timestamptz not null default now()
);

create table materiais (
  id uuid primary key default gen_random_uuid(),
  data date,
  descricao text not null,
  fornecedor text,
  valor_centavos integer check (valor_centavos >= 0),
  quantidade text,
  status status_material not null default 'necessario',
  etapa_id uuid references etapas (id) on delete set null,
  pago_por uuid references perfis (id) on delete set null,
  comprovante_path text,
  criado_em timestamptz not null default now(),
  -- item comprado precisa de data e valor reais
  constraint material_comprado_completo
    check (status <> 'comprado' or (data is not null and valor_centavos is not null))
);

create table relatorios (
  id uuid primary key default gen_random_uuid(),
  periodo_inicio date not null,
  periodo_fim date not null,
  snapshot jsonb not null,
  gerado_em timestamptz not null default now(),
  gerado_por uuid references perfis (id) on delete set null,
  token_publico uuid not null unique default gen_random_uuid(),
  aceito_em timestamptz,
  aceito_por text,
  assinatura_nome text,
  check (periodo_fim >= periodo_inicio)
);

create table configuracoes (
  id boolean primary key default true check (id), -- singleton: só existe a linha id=true
  valor_contrato_centavos integer not null check (valor_contrato_centavos >= 0),
  data_alvo date,
  nome_responsavel_obra text not null
);

create index idx_etapa_historico_etapa on etapa_historico (etapa_id, criado_em desc);
create index idx_pagamentos_data on pagamentos (data);
create index idx_materiais_status on materiais (status, data);

-- =====================================================================
-- Imutabilidade do relatório aceito
-- =====================================================================

create or replace function bloquear_relatorio_aceito()
returns trigger
language plpgsql
as $$
begin
  if old.aceito_em is not null then
    raise exception 'Relatório já aceito é imutável';
  end if;
  return new;
end;
$$;

create trigger trg_relatorio_imutavel
  before update or delete on relatorios
  for each row
  execute function bloquear_relatorio_aceito();

-- =====================================================================
-- Funções auxiliares de RLS
-- =====================================================================

create or replace function papel_atual()
returns papel_usuario
language sql
stable
security definer
set search_path = public
as $$
  select papel from perfis where id = auth.uid();
$$;

create or replace function eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select papel from perfis where id = auth.uid()) = 'admin', false);
$$;

-- =====================================================================
-- RLS
-- =====================================================================

alter table perfis enable row level security;
alter table etapas enable row level security;
alter table etapa_historico enable row level security;
alter table pagamentos enable row level security;
alter table materiais enable row level security;
alter table relatorios enable row level security;
alter table configuracoes enable row level security;

-- perfis: cada um lê o próprio perfil; admin lê e gerencia todos
create policy perfis_select on perfis for select
  using (id = auth.uid() or eh_admin());
create policy perfis_admin_all on perfis for all
  using (eh_admin()) with check (eh_admin());

-- demais tabelas: usuários autenticados (admin e visualizador) leem; só admin escreve
create policy etapas_select on etapas for select
  using (auth.uid() is not null);
create policy etapas_admin on etapas for all
  using (eh_admin()) with check (eh_admin());

create policy etapa_historico_select on etapa_historico for select
  using (auth.uid() is not null);
create policy etapa_historico_admin on etapa_historico for all
  using (eh_admin()) with check (eh_admin());

create policy pagamentos_select on pagamentos for select
  using (auth.uid() is not null);
create policy pagamentos_admin on pagamentos for all
  using (eh_admin()) with check (eh_admin());

create policy materiais_select on materiais for select
  using (auth.uid() is not null);
create policy materiais_admin on materiais for all
  using (eh_admin()) with check (eh_admin());

-- relatorios: leitura autenticada; escrita só admin.
-- O aceite público (sem login) NÃO passa por RLS: é feito por rota server-side
-- com service role que valida o token_publico.
create policy relatorios_select on relatorios for select
  using (auth.uid() is not null);
create policy relatorios_admin on relatorios for all
  using (eh_admin()) with check (eh_admin());

create policy configuracoes_select on configuracoes for select
  using (auth.uid() is not null);
create policy configuracoes_admin on configuracoes for all
  using (eh_admin()) with check (eh_admin());

-- =====================================================================
-- Storage: bucket privado de comprovantes
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', false)
on conflict (id) do nothing;

create policy comprovantes_leitura on storage.objects for select
  using (bucket_id = 'comprovantes' and auth.uid() is not null);

create policy comprovantes_escrita on storage.objects for insert
  with check (bucket_id = 'comprovantes' and eh_admin());

create policy comprovantes_remocao on storage.objects for delete
  using (bucket_id = 'comprovantes' and eh_admin());
