import Stripe from 'stripe';
import { hasStripeConfig, env } from '@/src/lib/env';

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  if (!hasStripeConfig()) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  return stripeClient;
}
