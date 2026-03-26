import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { env, hasStripeConfig, hasSupabaseAdminConfig } from '@/src/lib/env';
import { getStripeServerClient } from '@/src/lib/stripe';

async function logEvent(event: Stripe.Event) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return;
  }

  await supabase.from('billing_events').upsert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event,
    processed_at: new Date().toISOString(),
  });
}

async function grantAppAccess(metadata: Record<string, string | undefined>) {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !metadata.user_id || !metadata.app_id) {
    return;
  }

  if (metadata.stripe_customer_id) {
    await supabase.from('billing_customers').upsert({
      user_id: metadata.user_id,
      stripe_customer_id: metadata.stripe_customer_id,
      updated_at: new Date().toISOString(),
    });
  }

  await supabase.from('user_apps').upsert(
    {
      user_id: metadata.user_id,
      app_id: metadata.app_id,
      plan: metadata.grant_plan ?? metadata.plan_code ?? 'paid',
    },
    { onConflict: 'user_id,app_id' },
  );
}

async function grantCredits(metadata: Record<string, string | undefined>) {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !metadata.user_id || !metadata.app_id) return;

  // Legge i crediti configurati nel piano (es. limits.video_credits = 10)
  const planCode = metadata.grant_plan ?? metadata.plan_code;
  if (!planCode) return;

  const { data: planRow } = await supabase
    .from('app_billing_plans')
    .select('limits')
    .eq('app_id', metadata.app_id)
    .eq('plan_code', planCode)
    .maybeSingle();

  const limits = (planRow?.limits ?? {}) as Record<string, unknown>;
  const creditKeys = Object.entries(limits).filter(([k]) => k.endsWith('_credits'));
  if (creditKeys.length === 0) return;

  for (const [key, value] of creditKeys) {
    const amount = typeof value === 'number' ? value : 0;
    if (amount <= 0) continue;

    // Upsert: se esiste somma i crediti, altrimenti crea il record
    const { data: existing } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', metadata.user_id)
      .eq('app_id', metadata.app_id)
      .maybeSingle();

    const newTotal = (existing?.credits ?? 0) + amount;
    await supabase.from('user_credits').upsert(
      { user_id: metadata.user_id, app_id: metadata.app_id, credits: newTotal },
      { onConflict: 'user_id,app_id' },
    );

    console.log(`[webhook] Accreditati ${amount} ${key} a user=${metadata.user_id} app=${metadata.app_id} (tot=${newTotal})`);
  }
}

async function revokeAppAccess(metadata: Record<string, string | undefined>) {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !metadata.user_id || !metadata.app_id) {
    return;
  }

  await supabase
    .from('user_apps')
    .delete()
    .eq('user_id', metadata.user_id)
    .eq('app_id', metadata.app_id);
}

export async function POST(request: Request) {
  if (!hasStripeConfig() || !hasSupabaseAdminConfig() || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook non configurato.' }, { status: 503 });
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe server non disponibile.' }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature Stripe mancante.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook Stripe invalido.' },
      { status: 400 },
    );
  }

  await logEvent(event);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionMeta: Record<string, string | undefined> = {
        ...Object.fromEntries(
          Object.entries(session.metadata ?? {}).map(([key, value]) => [key, value ?? undefined]),
        ),
        stripe_customer_id:
          typeof session.customer === 'string' ? session.customer : undefined,
      };
      await grantAppAccess(sessionMeta);
      await grantCredits(sessionMeta);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        await grantAppAccess(
          Object.fromEntries(
            Object.entries(subscription.metadata ?? {}).map(([key, value]) => [
              key,
              value ?? undefined,
            ]),
          ),
        );
      } else {
        await revokeAppAccess(
          Object.fromEntries(
            Object.entries(subscription.metadata ?? {}).map(([key, value]) => [
              key,
              value ?? undefined,
            ]),
          ),
        );
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await revokeAppAccess(
        Object.fromEntries(
          Object.entries(subscription.metadata ?? {}).map(([key, value]) => [
            key,
            value ?? undefined,
          ]),
        ),
      );
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
