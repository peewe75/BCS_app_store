alter table app_billing_plans
  add column if not exists features text[] default '{}'::text[],
  add column if not exists limits jsonb default '{}'::jsonb,
  add column if not exists trial_days integer default 0;

update app_billing_plans
set features = '{}'::text[]
where features is null;

update app_billing_plans
set limits = '{}'::jsonb
where limits is null;

update app_billing_plans
set trial_days = 0
where trial_days is null;

update app_billing_plans
set plan_code = 'base',
    grant_plan = 'base'
where app_id = 'trading'
  and plan_code = 'default'
  and not exists (
    select 1
    from app_billing_plans existing_base
    where existing_base.app_id = 'trading'
      and existing_base.plan_code = 'base'
  );

update app_billing_plans
set grant_plan = 'base'
where app_id = 'trading'
  and plan_code in ('base', 'default', 'one_time')
  and coalesce(grant_plan, '') <> 'base';

update user_apps
set plan = 'base'
where app_id = 'trading'
  and plan in ('default', 'one_time');

update trading_reports
set plan = 'base'
where plan in ('default', 'one_time');
