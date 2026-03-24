-- Migration: tabelle mancanti per BCS AI Suite
-- apps già esistente (gestita da seed/admin) - aggiungi solo se non presente
create table if not exists apps (
  id text primary key,
  name text not null,
  slug text,
  description text,
  accent_color text,
  pricing_model text default 'free',
  is_coming_soon boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- user_apps: abbonamenti/entitlement per app a pagamento
create table if not exists user_apps (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  app_id text not null references apps(id) on delete cascade,
  plan text not null default 'base',
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, app_id)
);

-- trading_reports: report fiscali trading
create table if not exists trading_reports (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  filename text not null,
  storage_key text not null default '',
  plan text not null,
  status text not null default 'processing' check (status in ('processing', 'ready', 'error')),
  year integer not null,
  net_profit numeric,
  tax_due numeric,
  report_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- forfapp_calculations: calcoli forfettari salvati
create table if not exists forfapp_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  incasso_dichiarato numeric,
  codice_ateco text,
  gestione_previdenziale text,
  risultato_netto numeric,
  risultato_imposte numeric,
  risultato_inps numeric,
  created_at timestamptz default now()
);

-- RLS
alter table apps enable row level security;
alter table user_apps enable row level security;
alter table trading_reports enable row level security;
alter table forfapp_calculations enable row level security;

-- Policies: lettura pubblica apps
drop policy if exists "Public read apps" on apps;
create policy "Public read apps" on apps for select using (true);

-- Policies: user_apps - lettura propria
drop policy if exists "Users read own grants" on user_apps;
create policy "Users read own grants" on user_apps
  for select using ((auth.jwt() ->> 'sub') = user_id);

-- Policies: trading_reports - CRUD su propri record
drop policy if exists "Users manage own trading reports" on trading_reports;
create policy "Users manage own trading reports" on trading_reports
  for all using ((auth.jwt() ->> 'sub') = user_id);

-- Policies: forfapp_calculations - CRUD su propri record
drop policy if exists "Users manage own forfapp calcs" on forfapp_calculations;
create policy "Users manage own forfapp calcs" on forfapp_calculations
  for all using ((auth.jwt() ->> 'sub') = user_id);

-- Indici per performance
create index if not exists idx_trading_reports_user_id on trading_reports(user_id);
create index if not exists idx_trading_reports_user_year on trading_reports(user_id, year);
create index if not exists idx_user_apps_user_id on user_apps(user_id);
create index if not exists idx_forfapp_user_id on forfapp_calculations(user_id);
