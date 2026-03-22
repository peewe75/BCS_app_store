const fallbackAppUrl = 'http://localhost:3000';

export const env = {
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : fallbackAppUrl),
  clerkPublishableKey:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    process.env.VITE_CLERK_PUBLISHABLE_KEY ??
    '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? '',
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET ?? '',
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    '',
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
};

export function hasClerkServerConfig() {
  return Boolean(env.clerkSecretKey);
}

export function hasSupabasePublicConfig() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasSupabaseAdminConfig() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function hasStripeConfig() {
  return Boolean(env.stripeSecretKey);
}
