import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { env, hasClerkServerConfig, hasStripeConfig, hasSupabaseAdminConfig } from '@/src/lib/env';
import { getStripeServerClient } from '@/src/lib/stripe';

export async function POST() {
  if (!hasClerkServerConfig() || !hasSupabaseAdminConfig() || !hasStripeConfig()) {
    return NextResponse.json({ error: 'Stripe portal non configurato.' }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const stripe = getStripeServerClient();

  if (!supabase || !stripe) {
    return NextResponse.json({ error: 'Servizi billing non disponibili.' }, { status: 503 });
  }

  const { data: customer } = await supabase
    .from('billing_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!customer?.stripe_customer_id) {
    return NextResponse.json({ error: 'Nessun customer Stripe associato.' }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${env.appUrl}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
