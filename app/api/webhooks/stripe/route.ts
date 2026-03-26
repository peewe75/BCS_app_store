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
      await grantAppAccess({
        ...Object.fromEntries(
          Object.entries(session.metadata ?? {}).map(([key, value]) => [key, value ?? undefined]),
        ),
        stripe_customer_id:
          typeof session.customer === 'string' ? session.customer : undefined,
      });
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
