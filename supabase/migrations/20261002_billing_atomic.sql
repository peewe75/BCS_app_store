-- Apply before deploying billing/UGC routes. RPCs are server-only.
begin;
create table if not exists public.user_credits (
  user_id text not null,
  app_id text not null references public.apps(id) on delete cascade,
  credits integer not null default 0 check (credits >= 0),
  primary key (user_id, app_id)
);
create unique index if not exists user_credits_user_app_unique on public.user_credits(user_id, app_id);
alter table public.user_credits enable row level security;
-- Preserve the old webhook's event history; do not automatically replay it.
alter table public.billing_events add column if not exists fulfillment_completed boolean not null default true;
create table if not exists public.credit_reservations (
  id uuid primary key,
  user_id text not null,
  app_id text not null references public.apps(id),
  amount integer not null check (amount > 0),
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.credit_reservations enable row level security;

create or replace function public.reserve_app_credits(p_id uuid, p_user_id text, p_app_id text, p_amount integer)
returns integer language plpgsql security definer set search_path = public as $$
declare v_balance integer;
begin
  if p_amount is null or p_amount <= 0 or nullif(p_user_id, '') is null or nullif(p_app_id, '') is null then
    raise exception 'Invalid credit reservation';
  end if;
  insert into credit_reservations(id, user_id, app_id, amount) values(p_id, p_user_id, p_app_id, p_amount);
  update user_credits set credits = credits - p_amount
  where user_id = p_user_id and app_id = p_app_id and credits >= p_amount returning credits into v_balance;
  if not found then raise exception 'Insufficient credits' using errcode = 'P0002'; end if;
  return v_balance;
end;
$$;

create or replace function public.refund_app_credits(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_reservation credit_reservations%rowtype;
begin
  update credit_reservations set refunded_at = now()
  where id = p_id and refunded_at is null returning * into v_reservation;
  if not found then return false; end if;
  insert into user_credits(user_id, app_id, credits)
  values(v_reservation.user_id, v_reservation.app_id, v_reservation.amount)
  on conflict(user_id, app_id) do update set credits = user_credits.credits + excluded.credits;
  return true;
end;
$$;

create or replace function public.adjust_app_credits(p_user_id text, p_app_id text, p_delta integer)
returns integer language plpgsql security definer set search_path = public as $$
declare v_balance integer;
begin
  if p_delta is null or nullif(p_user_id, '') is null or nullif(p_app_id, '') is null then
    raise exception 'Invalid credit adjustment';
  end if;
  insert into user_credits(user_id, app_id, credits) values(p_user_id, p_app_id, greatest(0, p_delta))
  on conflict(user_id, app_id) do update set credits = greatest(0, user_credits.credits + p_delta)
  returning credits into v_balance;
  return v_balance;
end;
$$;

create or replace function public.claim_ugc_trial(p_user_id text)
returns integer language plpgsql security definer set search_path = public as $$
begin
  if nullif(p_user_id, '') is null then raise exception 'User required'; end if;
  -- One image (25) plus one video (75); no repeat claims.
  insert into user_credits(user_id, app_id, credits) values(p_user_id, 'ugc', 100);
  insert into user_apps(user_id, app_id, plan) values(p_user_id, 'ugc', 'free')
  on conflict(user_id, app_id) do nothing;
  return 100;
end;
$$;

create or replace function public.fulfill_stripe_event(p_event jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_id text := p_event->>'id';
  v_type text := p_event->>'type';
  v_object jsonb := p_event#>'{data,object}';
  v_metadata jsonb := v_object->'metadata';
  v_user text := v_metadata->>'user_id';
  v_app text := v_metadata->>'app_id';
  v_plan text := coalesce(v_metadata->>'grant_plan', v_metadata->>'plan_code', 'paid');
  v_customer text := v_object->>'customer';
  v_limits jsonb;
  v_amount integer := 0;
  v_entry record;
begin
  if nullif(v_id, '') is null or nullif(v_type, '') is null then raise exception 'Invalid Stripe event'; end if;
  insert into billing_events(stripe_event_id, event_type, payload, fulfillment_completed)
  values(v_id, v_type, p_event, false) on conflict(stripe_event_id) do nothing;
  if not found then return false; end if;
  if v_type in ('checkout.session.completed', 'checkout.session.async_payment_succeeded') then
    if v_object->>'payment_status' in ('paid', 'no_payment_required') then
      if nullif(v_user, '') is null or nullif(v_app, '') is null or nullif(v_object->>'id', '') is null then
        raise exception 'Checkout is missing user/app/session metadata';
      end if;
      perform pg_advisory_xact_lock(hashtextextended('checkout:' || (v_object->>'id'), 0));
      if not exists (
        select 1 from billing_events where stripe_event_id <> v_id and fulfillment_completed
        and event_type in ('checkout.session.completed', 'checkout.session.async_payment_succeeded')
        and payload#>>'{data,object,id}' = v_object->>'id'
        and payload#>>'{data,object,payment_status}' in ('paid', 'no_payment_required')
      ) then
        if nullif(v_customer, '') is not null then
          insert into billing_customers(user_id, stripe_customer_id) values(v_user, v_customer)
          on conflict(user_id) do update set stripe_customer_id = excluded.stripe_customer_id, updated_at = now();
        end if;
        insert into user_apps(user_id, app_id, plan) values(v_user, v_app, v_plan)
        on conflict(user_id, app_id) do update set plan = excluded.plan, updated_at = now();
        select limits into v_limits from app_billing_plans
        where app_id = v_app and plan_code = coalesce(v_metadata->>'plan_code', v_metadata->>'grant_plan');
        if not found then raise exception 'Checkout billing plan missing'; end if;
        for v_entry in select key, value from jsonb_each(coalesce(v_limits, '{}'::jsonb)) loop
          if right(v_entry.key, 8) = '_credits' and jsonb_typeof(v_entry.value) = 'number' then
            if (v_entry.value::text)::numeric < 0 or (v_entry.value::text)::numeric <> trunc((v_entry.value::text)::numeric) then
              raise exception 'Invalid billing credit amount';
            end if;
            v_amount := v_amount + (v_entry.value::text)::integer;
          end if;
        end loop;
        if v_amount > 0 then perform adjust_app_credits(v_user, v_app, v_amount); end if;
      end if;
    end if;
  elsif v_type in ('customer.subscription.updated', 'customer.subscription.deleted') then
    if nullif(v_user, '') is null or nullif(v_app, '') is null then
      raise exception 'Subscription is missing user/app metadata';
    end if;
    if v_type = 'customer.subscription.updated' and v_object->>'status' in ('active', 'trialing') then
      insert into user_apps(user_id, app_id, plan) values(v_user, v_app, v_plan)
      on conflict(user_id, app_id) do update set plan = excluded.plan, updated_at = now();
    else
      delete from user_apps where user_id = v_user and app_id = v_app;
    end if;
  end if;
  update billing_events set fulfillment_completed = true, processed_at = now() where stripe_event_id = v_id;
  return true;
end;
$$;
revoke all on function public.reserve_app_credits(uuid,text,text,integer) from public, anon, authenticated;
revoke all on function public.refund_app_credits(uuid) from public, anon, authenticated;
revoke all on function public.adjust_app_credits(text,text,integer) from public, anon, authenticated;
revoke all on function public.claim_ugc_trial(text) from public, anon, authenticated;
revoke all on function public.fulfill_stripe_event(jsonb) from public, anon, authenticated;
grant execute on function public.reserve_app_credits(uuid,text,text,integer) to service_role;
grant execute on function public.refund_app_credits(uuid) to service_role;
grant execute on function public.adjust_app_credits(text,text,integer) to service_role;
grant execute on function public.claim_ugc_trial(text) to service_role;
grant execute on function public.fulfill_stripe_event(jsonb) to service_role;
commit;
