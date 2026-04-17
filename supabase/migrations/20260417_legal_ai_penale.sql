-- ============================================================
-- MIGRATION: Legal AI Penale inside BCS
-- Target project: knuuqldetklmsrtvggtk (BCS / ultrabot.space)
-- Date: 2026-04-17
-- ============================================================

-- Storage bucket for penale audio
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('legal-ai-penale-audio', 'legal-ai-penale-audio', false, 104857600)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit;

-- App catalog entry
INSERT INTO public.apps (
  id,
  name,
  slug,
  description,
  category,
  badge,
  features,
  accent_color,
  bg_color,
  bg_gradient,
  pricing_badge,
  pricing_model,
  price_label,
  cta_text,
  cta_href,
  is_internal,
  internal_route,
  video_src,
  poster_src,
  layout,
  sort_order,
  is_active,
  is_coming_soon,
  landing_content,
  admin_url
)
VALUES (
  'legal-ai-penale',
  'Legal AI Penale',
  'legal-ai-penale',
  'Landing free, login Clerk B e pipeline audio centralizzata su Supabase BCS per casi, segmenti, timeline ed eventi.',
  'Legal AI',
  'Penale',
  ARRAY[]::text[],
  '#f59e0b',
  '#0F172A',
  'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
  'Free oggi - billing BCS centralizzato',
  'free',
  'Free oggi - billing BCS centralizzato',
  'Apri Legal AI Penale',
  'https://legal-ai-penale.netlify.app',
  false,
  null,
  null,
  null,
  'text-left',
  8,
  true,
  false,
  '{
    "eyebrow": "App penale dentro il sistema BCS",
    "headline": "Fascicolo penale digitale, landing free e billing centralizzato in BCS.",
    "subheadline": "Legal AI Penale resta su Netlify, ma autentica con il progetto Clerk gia usato da ultrabot.space e salva i dati nel DB unico BCS.",
    "trustLine": "Clerk B per login e registrazione, Supabase BCS per fascicoli e trascrizioni, Stripe solo in BCS admin quando il piano diverra paid.",
    "primaryCtaLabel": "Apri la dashboard",
    "secondaryCtaLabel": "Vai a BCS admin",
    "problemTitle": "Non serve un sistema separato per ogni app.",
    "problemBody": "La landing resta semplice e gratuita, mentre il lavoro serio vive nello stack condiviso di BCS: stessi utenti, stessi profili, stessi entitlement e stesso billing.",
    "sections": [
      {
        "id": "landing",
        "title": "Landing free e accesso chiaro",
        "body": "Il sito pubblico introduce il prodotto, mostra il valore per il professionista e porta al login o alla dashboard senza una seconda piattaforma di identita.",
        "bullets": [
          "Hero dedicato alla pratica penale.",
          "CTA verso registrazione e accesso dashboard.",
          "Piano iniziale gratuito con passaggio futuro al paid gia predisposto."
        ]
      },
      {
        "id": "workflow",
        "title": "Pipeline unica per audio e trascrizioni",
        "body": "Caricamento audio, Deepgram, estrazione eventi e memoria del fascicolo finiscono tutti nel backend BCS cosi la dashboard amministrativa vede gli stessi dati.",
        "bullets": [
          "Upload audio su storage BCS.",
          "Trascrizioni e timeline salvate nello stesso database.",
          "Chat legale collegata ai segmenti del caso."
        ]
      },
      {
        "id": "billing",
        "title": "Billing e entitlement gestiti da BCS admin",
        "body": "Il frontend non contiene Stripe separato. Quando il piano diverra paid, il checkout restera nel flusso BCS con prodotti, portal e webhook centralizzati.",
        "bullets": [
          "Stripe unico in ultrabot.space.",
          "Entitlement letti da BCS admin.",
          "Migrazione da free a paid senza rifare auth o landing."
        ]
      }
    ],
    "benefitsTitle": "Perche dentro BCS",
    "benefits": [
      "Un solo account Clerk per la suite.",
      "Un solo database per dashboard e app.",
      "Un solo flusso Stripe gestito da BCS admin.",
      "Un solo posto dove governare accessi e piani."
    ],
    "audienceTitle": "Per chi e pensata",
    "audienceBody": "Per avvocati penalisti e studi che vogliono un fascicolo digitale ordinato, ma anche una base pronta per il passaggio a piani premium centralizzati.",
    "pricingTitle": "Piano iniziale",
    "pricingLine": "Free oggi, con strada gia pronta per il checkout centralizzato BCS.",
    "supportLine": "Quando il piano salira a paid, il cambio avverra dal billing BCS senza cambiare landing, auth o storage.",
    "closingHeadline": "Stessa identita, stesso database, stesso billing.",
    "closingBody": "Legal AI Penale entra nella suite senza diventare un isola: resta un prodotto dedicato, ma con controllo centralizzato in BCS.",
    "finalCtaLabel": "Apri la dashboard"
  }'::jsonb,
  'https://ultrabot.space/admin'
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  features = EXCLUDED.features,
  accent_color = EXCLUDED.accent_color,
  bg_color = EXCLUDED.bg_color,
  bg_gradient = EXCLUDED.bg_gradient,
  pricing_badge = EXCLUDED.pricing_badge,
  pricing_model = EXCLUDED.pricing_model,
  price_label = EXCLUDED.price_label,
  cta_text = EXCLUDED.cta_text,
  cta_href = EXCLUDED.cta_href,
  is_internal = EXCLUDED.is_internal,
  internal_route = EXCLUDED.internal_route,
  video_src = EXCLUDED.video_src,
  poster_src = EXCLUDED.poster_src,
  layout = EXCLUDED.layout,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  is_coming_soon = EXCLUDED.is_coming_soon,
  landing_content = EXCLUDED.landing_content,
  admin_url = EXCLUDED.admin_url,
  updated_at = now();

-- Billing plans
INSERT INTO public.app_billing_plans (
  app_id,
  plan_code,
  billing_type,
  stripe_product_id,
  stripe_price_id,
  grant_plan,
  features,
  limits,
  trial_days,
  is_active
)
VALUES
  (
    'legal-ai-penale',
    'free',
    'one_time',
    NULL,
    NULL,
    'free',
    ARRAY['Landing pubblica gratuita', 'Clerk B condiviso', 'DB unico BCS']::text[],
    '{}'::jsonb,
    0,
    true
  ),
  (
    'legal-ai-penale',
    'monthly',
    'subscription',
    NULL,
    NULL,
    'monthly',
    ARRAY['Stripe solo in BCS admin', 'Entitlement centralizzati', 'Piano paid predisposto']::text[],
    '{}'::jsonb,
    0,
    true
  )
ON CONFLICT (app_id, plan_code) DO UPDATE
SET
  billing_type = EXCLUDED.billing_type,
  grant_plan = EXCLUDED.grant_plan,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  trial_days = EXCLUDED.trial_days,
  is_active = EXCLUDED.is_active;

-- Main legal penale tables
CREATE TABLE IF NOT EXISTS public.legal_ai_penale_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  procedure_number TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'penale',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending')),
  audio_count INTEGER NOT NULL DEFAULT 0,
  audio_url TEXT,
  audio_path TEXT,
  audio_mime_type TEXT,
  audio_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_update TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_ai_penale_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.legal_ai_penale_cases(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time DOUBLE PRECISION NOT NULL,
  end DOUBLE PRECISION NOT NULL,
  speaker TEXT NOT NULL,
  text TEXT NOT NULL,
  importance TEXT NOT NULL DEFAULT 'normal' CHECK (importance IN ('critical', 'normal')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_ai_penale_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.legal_ai_penale_cases(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'speaker', 'alert', 'legal')),
  title TEXT NOT NULL,
  desc TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_penale_cases_owner ON public.legal_ai_penale_cases(owner_id, last_update DESC);
CREATE INDEX IF NOT EXISTS idx_penale_segments_case_time ON public.legal_ai_penale_segments(case_id, time);
CREATE INDEX IF NOT EXISTS idx_penale_events_case_time ON public.legal_ai_penale_events(case_id, created_at DESC);

ALTER TABLE public.legal_ai_penale_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_ai_penale_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_ai_penale_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "penale_cases_own" ON public.legal_ai_penale_cases;
CREATE POLICY "penale_cases_own" ON public.legal_ai_penale_cases
  FOR ALL USING ((auth.jwt() ->> 'sub') = owner_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = owner_id);

DROP POLICY IF EXISTS "penale_segments_own" ON public.legal_ai_penale_segments;
CREATE POLICY "penale_segments_own" ON public.legal_ai_penale_segments
  FOR ALL USING ((auth.jwt() ->> 'sub') = owner_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = owner_id);

DROP POLICY IF EXISTS "penale_events_own" ON public.legal_ai_penale_events;
CREATE POLICY "penale_events_own" ON public.legal_ai_penale_events
  FOR ALL USING ((auth.jwt() ->> 'sub') = owner_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = owner_id);
