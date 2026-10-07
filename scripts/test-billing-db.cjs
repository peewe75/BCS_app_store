// Uses an explicit disposable database only. Never point this at production.
const { execFileSync, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { randomUUID } = require('node:crypto');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
const run = promisify(execFile);
const socket = process.env.SWA_TEST_PG_SOCKET;
if (!socket?.startsWith('/private/tmp/swa-launch-pg.')) throw new Error('Explicit isolated test socket required');
const psql = '/opt/homebrew/opt/postgresql@16/bin/psql';
const args = ['-X', '-h', socket, '-p', '55432', '-U', 'md', '-d', 'swa_billing_test', '-v', 'ON_ERROR_STOP=1', '-At'];
function sql(query) { return execFileSync(psql, [...args, '-c', query], { encoding: 'utf8' }).trim(); }
function asyncSql(query) { return run(psql, [...args, '-c', query]); }
function event(id, sessionId, status = 'paid', type = 'checkout.session.completed', plan = 'credits') {
  const payload = { id, type, data: { object: { id: sessionId, payment_status: status,
    metadata: { user_id: 'buyer', app_id: 'ugc', plan_code: plan, grant_plan: 'paid' } } } };
  return `select fulfill_stripe_event('${JSON.stringify(payload)}'::jsonb)`;
}
async function main() {
  sql(`create table apps(id text primary key);
    insert into apps values ('ugc');
    create table user_apps(user_id text, app_id text references apps(id), plan text, updated_at timestamptz default now(), unique(user_id,app_id));
    create table app_billing_plans(app_id text, plan_code text, limits jsonb, unique(app_id,plan_code));
    insert into app_billing_plans values ('ugc','credits','{"video_credits":1000}');
    create table billing_customers(user_id text primary key,stripe_customer_id text unique,updated_at timestamptz default now());
    create table billing_events(stripe_event_id text unique,event_type text,payload jsonb,processed_at timestamptz default now());`);
  execFileSync(psql, [...args, '-f', resolve(__dirname, '../supabase/migrations/20261002_billing_atomic.sql')]);
  assert.equal(sql(event('evt1','cs1')), 't');
  assert.equal(sql(event('evt1','cs1')), 'f');
  assert.equal(sql('select credits from user_credits where user_id=\'buyer\''), '1000');
  console.log('PASS duplicate webhook credits once; plan_code may differ from entitlement');

  await Promise.all([asyncSql(event('evt2','cs2')), asyncSql(event('evt3','cs2','paid','checkout.session.async_payment_succeeded'))]);
  assert.equal(sql('select credits from user_credits where user_id=\'buyer\''), '2000');
  console.log('PASS concurrent event IDs for one checkout credit once');

  sql(event('evt4','cs3','unpaid'));
  assert.equal(sql('select credits from user_credits where user_id=\'buyer\''), '2000');
  sql(event('evt5','cs3','paid','checkout.session.async_payment_succeeded'));
  assert.equal(sql('select credits from user_credits where user_id=\'buyer\''), '3000');
  console.log('PASS delayed payment waits for payment confirmation');

  assert.throws(() => sql(event('evt6','cs4','paid','checkout.session.completed','missing')));
  assert.equal(sql("select count(*) from billing_events where stripe_event_id='evt6'"), '0');
  sql("insert into app_billing_plans values ('ugc','missing','{\"video_credits\":7}')");
  sql(event('evt6','cs4','paid','checkout.session.completed','missing'));
  assert.equal(sql('select credits from user_credits where user_id=\'buyer\''), '3007');
  console.log('PASS failed fulfillment rolls back and retry succeeds');

  sql("select adjust_app_credits('parallel','ugc',75)");
  const ids = [randomUUID(), randomUUID()];
  const attempts = await Promise.allSettled(ids.map(id => asyncSql(`select reserve_app_credits('${id}','parallel','ugc',75)`)));
  assert.equal(attempts.filter(a => a.status === 'fulfilled').length, 1);
  assert.equal(sql("select credits from user_credits where user_id='parallel'"), '0');
  const winningId = sql("select id from credit_reservations where user_id='parallel'");
  assert.equal(sql(`select refund_app_credits('${winningId}')`), 't');
  assert.equal(sql(`select refund_app_credits('${winningId}')`), 'f');
  assert.equal(sql("select credits from user_credits where user_id='parallel'"), '75');
  console.log('PASS concurrent debit allows only one generation; refund once');

  await Promise.all(Array.from({length:10}, () => asyncSql("select adjust_app_credits('parallel','ugc',1)")));
  assert.equal(sql("select credits from user_credits where user_id='parallel'"), '85');
  console.log('PASS concurrent admin adjustments do not lose credits');

  const claims = await Promise.allSettled([asyncSql("select claim_ugc_trial('trial')"), asyncSql("select claim_ugc_trial('trial')")]);
  assert.equal(claims.filter(a => a.status === 'fulfilled').length, 1);
  assert.equal(sql("select credits from user_credits where user_id='trial'"), '100');
  assert.equal(sql("select plan from user_apps where user_id='trial'"), 'free');
  assert.equal(sql("select has_function_privilege('anon','fulfill_stripe_event(jsonb)','EXECUTE')"), 'f');
  assert.equal(sql("select has_function_privilege('authenticated','reserve_app_credits(uuid,text,text,integer)','EXECUTE')"), 'f');
  assert.equal(sql("select has_function_privilege('service_role','fulfill_stripe_event(jsonb)','EXECUTE')"), 't');
  console.log('PASS trial atomic and once only; public clients cannot modify billing');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
