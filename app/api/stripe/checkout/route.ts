import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { env, hasClerkServerConfig, hasStripeConfig, hasSupabaseAdminConfig } from '@/src/lib/env';
import { getStripeServerClient } from '@/src/lib/stripe';

export async function POST(request: Request) {
  if (!hasClerkServerConfig() || !hasSupabaseAdminConfig() || !hasStripeConfig()) {
    return NextResponse.json(
      { error: 'Stripe checkout non configurato su Vercel.' },
      { status: 503 },
    );
  }

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
  }

  const body = await request.json();
  const appId = body?.appId as string | undefined;
  const planCode = (body?.planCode as string | undefined) ?? 'default';

  if (!appId) {
    return NextResponse.json({ error: 'appId mancante.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const stripe = getStripeServerClient();

  if (!supabase || !stripe) {
    return NextResponse.json({ error: 'Servizi billing non disponibili.' }, { status: 503 });
  }

  const { data: plan, error } = await supabase
    .from('app_billing_plans')
    .select('app_id, plan_code, billing_type, stripe_price_id, grant_plan')
    .eq('app_id', appId)
    .eq('plan_code', planCode)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !plan?.stripe_price_id) {
    return NextResponse.json(
      { error: 'Piano Stripe non trovato per questa app.' },
      { status: 404 },
    );
  }

  const successUrl = `${env.appUrl}/apps/${appId}?checkout=success`;
  const cancelUrl = `${env.appUrl}/apps/${appId}?checkout=cancelled`;

  const session = await stripe.checkout.sessions.create({
    mode: plan.billing_type === 'subscription' ? 'subscription' : 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: user.primaryEmailAddress?.emailAddress ?? undefined,
    line_items: [
      {
        price: plan.stripe_price_id,
        quantity: 1,
      },
    ],
    metadata: {
      app_id: plan.app_id,
      plan_code: plan.plan_code,
      grant_plan: plan.grant_plan ?? plan.plan_code,
      user_id: userId,
    },
    subscription_data:
      plan.billing_type === 'subscription'
        ? {
            metadata: {
              app_id: plan.app_id,
              plan_code: plan.plan_code,
              grant_plan: plan.grant_plan ?? plan.plan_code,
              user_id: userId,
            },
          }
        : undefined,
  });

  return NextResponse.json({ url: session.url });
}
