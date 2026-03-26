const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const root = process.cwd();
loadEnvFile(path.join(root, '.env.local'));

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY in .env.local');
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase admin config in .env.local');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil',
});

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_PLANS = [
  {
    appId: 'ugc',
    appName: 'UGC Ad Creator',
    planCode: 'default',
    billingType: 'subscription',
    amountCents: 2900,
    interval: 'month',
    currency: 'eur',
    grantPlan: 'pro',
  },
  {
    appId: 'trading',
    appName: 'Trading Fiscale',
    planCode: 'default',
    billingType: 'one_time',
    amountCents: 990,
    currency: 'eur',
    grantPlan: 'default',
  },
  {
    appId: 'ravvedimento',
    appName: 'RavvedimentoFacile',
    planCode: 'default',
    billingType: 'subscription',
    amountCents: 1900,
    interval: 'month',
    currency: 'eur',
    grantPlan: 'pro',
  },
];

async function findExistingProduct(appId, planCode) {
  const products = await stripe.products.list({ limit: 100, active: true });
  return (
    products.data.find(
      (product) =>
        product.metadata?.app_id === appId &&
        product.metadata?.plan_code === planCode,
    ) ?? null
  );
}

async function findExistingPrice(productId, config) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return (
    prices.data.find((price) => {
      const recurringMatches =
        config.billingType !== 'subscription' ||
        (price.recurring && price.recurring.interval === config.interval);

      return (
        price.currency === config.currency &&
        price.unit_amount === config.amountCents &&
        recurringMatches
      );
    }) ?? null
  );
}

async function ensureProduct(config) {
  const existing = await findExistingProduct(config.appId, config.planCode);
  if (existing) {
    return existing;
  }

  return stripe.products.create({
    name: `${config.appName} Demo`,
    metadata: {
      app_id: config.appId,
      plan_code: config.planCode,
      demo: 'true',
    },
  });
}

async function ensurePrice(productId, config) {
  const existing = await findExistingPrice(productId, config);
  if (existing) {
    return existing;
  }

  return stripe.prices.create({
    product: productId,
    currency: config.currency,
    unit_amount: config.amountCents,
    recurring:
      config.billingType === 'subscription'
        ? {
            interval: config.interval,
          }
        : undefined,
    metadata: {
      app_id: config.appId,
      plan_code: config.planCode,
      demo: 'true',
    },
  });
}

async function upsertBillingPlan(config, product, price) {
  const payload = {
    app_id: config.appId,
    plan_code: config.planCode,
    billing_type: config.billingType,
    stripe_product_id: product.id,
    stripe_price_id: price.id,
    grant_plan: config.grantPlan,
    is_active: true,
  };

  const { error } = await supabase
    .from('app_billing_plans')
    .upsert(payload, { onConflict: 'app_id,plan_code' });

  if (error) {
    throw error;
  }
}

async function main() {
  console.log('Bootstrapping Stripe demo products and prices...');

  for (const config of DEMO_PLANS) {
    const product = await ensureProduct(config);
    const price = await ensurePrice(product.id, config);
    await upsertBillingPlan(config, product, price);

    console.log(
      `OK ${config.appId}: ${price.id} (${config.billingType}, ${(
        config.amountCents / 100
      ).toFixed(2)} ${config.currency.toUpperCase()})`,
    );
  }

  console.log('');
  console.log('Done. Next steps:');
  console.log('1. Add STRIPE_WEBHOOK_SECRET to .env.local');
  console.log('2. Forward Stripe events to http://localhost:3000/api/webhooks/stripe');
  console.log('3. Start the app with npm run dev and test checkout from the dashboard');
}

main().catch((error) => {
  console.error('Stripe demo bootstrap failed');
  console.error(error);
  process.exit(1);
});
