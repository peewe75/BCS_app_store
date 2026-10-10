const fallbackAppUrl = 'http://localhost:3000';

function normalizeAppUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export const env = {
  appUrl:
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeAppUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeAppUrl(process.env.VERCEL_URL) ??
    fallbackAppUrl,
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
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  swaSsoSecret: process.env.SWA_MARKETPLACE_SSO_SECRET ?? '',
  veoAudioModel:
    process.env.VEO_AUDIO_MODEL ??
    'veo-3.1-generate-preview',
  // Google serves the 2.5 models only to accounts that used them before, so
  // personal keys created later get a 404. Override via env when Google
  // retires these IDs.
  ugcTextModel:
    process.env.UGC_TEXT_MODEL ??
    'gemini-3.8-flash',
  ugcImageModel:
    process.env.UGC_IMAGE_MODEL ??
    'gemini-3.1-flash-image',
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

export function hasGeminiApiKey() {
  return Boolean(env.geminiApiKey);
}
