create table if not exists profiles (
  id text primary key,
  email text,
  first_name text,
  last_name text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists app_billing_plans (
  id uuid primary key default gen_random_uuid(),
  app_id text not null references apps(id) on delete cascade,
  plan_code text not null,
  billing_type text not null check (billing_type in ('one_time', 'subscription')),
  stripe_product_id text,
  stripe_price_id text,
  grant_plan text,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(app_id, plan_code)
);

create table if not exists billing_customers (
  user_id text primary key,
  stripe_customer_id text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz default now()
);

alter table profiles enable row level security;
alter table app_billing_plans enable row level security;
alter table billing_customers enable row level security;
alter table billing_events enable row level security;

drop policy if exists "Users read own profile" on profiles;
create policy "Users read own profile" on profiles
  for select using ((auth.jwt() ->> 'sub') = id);

drop policy if exists "Public read billing plans" on app_billing_plans;
create policy "Public read billing plans" on app_billing_plans
  for select using (true);

drop policy if exists "Users read own billing customer" on billing_customers;
create policy "Users read own billing customer" on billing_customers
  for select using ((auth.jwt() ->> 'sub') = user_id);
