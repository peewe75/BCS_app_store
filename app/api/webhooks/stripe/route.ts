import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { env, hasStripeConfig, hasSupabaseAdminConfig } from '@/src/lib/env';
import { getStripeServerClient } from '@/src/lib/stripe';

export async function POST(request: Request) {
  if (!hasStripeConfig() || !hasSupabaseAdminConfig() || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook non configurato.' }, { status: 503 });
  }
  const stripe = getStripeServerClient();
  const supabase = createSupabaseAdminClient();
  if (!stripe || !supabase) return NextResponse.json({ error: 'Servizi billing non disponibili.' }, { status: 503 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Signature Stripe mancante.' }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: 'Webhook Stripe invalido.' }, { status: 400 });
  }
  // The event receipt, access and credits commit together; failure permits a retry.
  const { error } = await supabase.rpc('fulfill_stripe_event', { p_event: event });
  if (error) {
    console.error('[stripe/fulfillment]', { eventId: event.id, error });
    return NextResponse.json({ error: 'Elaborazione pagamento non riuscita.' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
