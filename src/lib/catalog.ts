import { publicSupabase } from '@/src/lib/supabase/public';

export interface AppRecord {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  badge: string | null;
  features: string[];
  accent_color: string | null;
  bg_color: string | null;
  bg_gradient: string | null;
  pricing_badge: string | null;
  pricing_model: string | null;
  price_label: string | null;
  cta_text: string | null;
  cta_href: string | null;
  is_internal: boolean;
  internal_route: string | null;
  video_src: string | null;
  poster_src: string | null;
  layout: 'text-left' | 'text-right';
  sort_order: number;
  is_active: boolean;
  is_coming_soon: boolean;
  created_at: string | null;
}

export interface UserAppGrant {
  app_id: string;
  plan: string | null;
  expires_at: string | null;
}

const STATIC_APPS: AppRecord[] = [
  {
    id: 'ugc',
    name: 'UGC Ad Creator',
    tagline: 'Da una foto, un video promozionale HD',
    description: 'Modulo base interno pronto per job e libreria video.',
    category: 'Creativita e video',
    badge: 'Video AI',
    features: [],
    accent_color: '#ec4899',
    bg_color: '#F5F5F7',
    bg_gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    pricing_badge: 'Scopri prezzi',
    pricing_model: 'freemium',
    price_label: 'Scopri prezzi',
    cta_text: 'Apri workspace',
    cta_href: null,
    is_internal: true,
    internal_route: '/apps/ugc',
    video_src: '/video/1.mp4',
    poster_src: '/images/1.png',
    layout: 'text-left',
    sort_order: 1,
    is_active: true,
    is_coming_soon: false,
    created_at: null,
  },
  {
    id: 'ai-crisi',
    name: 'AI Crisi',
    tagline: "Gestisci le procedure CCII con l'intelligenza artificiale",
    description: "Resta esterna in questa fase.",
    category: 'Legal AI',
    badge: 'Legal AI',
    features: [],
    accent_color: '#3b82f6',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    pricing_badge: 'Da 30 euro/mese',
    pricing_model: 'subscription',
    price_label: 'Da 30 euro/mese',
    cta_text: 'Apri AI Crisi',
    cta_href: 'https://ai-crisi.vercel.app',
    is_internal: false,
    internal_route: null,
    video_src: '/video/2.mp4',
    poster_src: '/images/2.png',
    layout: 'text-right',
    sort_order: 2,
    is_active: true,
    is_coming_soon: false,
    created_at: null,
  },
  {
    id: 'trading',
    name: 'Trading Fiscale',
    tagline: 'Report fiscale professionale per il tuo broker',
    description: 'Workspace dati e storico report.',
    category: 'Finanza e tax',
    badge: 'Finanza',
    features: [],
    accent_color: '#10b981',
    bg_color: '#F5F5F7',
    bg_gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    pricing_badge: 'Da 9,90',
    pricing_model: 'one-time',
    price_label: 'Da 9,90',
    cta_text: 'Apri Trading',
    cta_href: null,
    is_internal: true,
    internal_route: '/apps/trading',
    video_src: '/video/3.mp4',
    poster_src: '/images/3.png',
    layout: 'text-left',
    sort_order: 3,
    is_active: true,
    is_coming_soon: false,
    created_at: null,
  },
  {
    id: 'ravvedimento',
    name: 'RavvedimentoFacile',
    tagline: 'Il ravvedimento operoso, finalmente semplice',
    description: 'Calcolo interno con storico su Supabase.',
    category: 'Fiscale',
    badge: 'Fiscale',
    features: [],
    accent_color: '#3713ec',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    pricing_badge: 'Gratis poi da 19 euro/mese',
    pricing_model: 'freemium',
    price_label: 'Gratis poi da 19 euro/mese',
    cta_text: 'Apri Ravvedimento',
    cta_href: null,
    is_internal: true,
    internal_route: '/apps/ravvedimento',
    video_src: '/video/4.mp4',
    poster_src: '/images/4.png',
    layout: 'text-right',
    sort_order: 4,
    is_active: true,
    is_coming_soon: false,
    created_at: null,
  },
  {
    id: 'forf',
    name: 'Forfettari AI',
    tagline: 'Calcolo tasse regime forfettario con AI',
    description: 'Gratis per ogni utente autenticato.',
    category: 'Fiscale',
    badge: 'Free',
    features: [],
    accent_color: '#f59e0b',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    pricing_badge: 'Gratis',
    pricing_model: 'free',
    price_label: 'Gratis',
    cta_text: 'Apri Forfettari AI',
    cta_href: null,
    is_internal: true,
    internal_route: '/apps/forf',
    video_src: '/video/ForfApp.mp4',
    poster_src: '/images/ForfApp.png',
    layout: 'text-left',
    sort_order: 5,
    is_active: true,
    is_coming_soon: false,
    created_at: null,
  },
  {
    id: 'bot',
    name: 'Bot AI',
    tagline: 'Crea il tuo agente AI per il supporto clienti',
    description: 'Strumento in arrivo.',
    category: 'Automation',
    badge: 'Soon',
    features: [],
    accent_color: '#6366f1',
    bg_color: '#F5F5F7',
    bg_gradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    pricing_badge: 'Prossimamente',
    pricing_model: 'free',
    price_label: 'Prossimamente',
    cta_text: 'Prossimamente',
    cta_href: null,
    is_internal: false,
    internal_route: null,
    video_src: null,
    poster_src: null,
    layout: 'text-right',
    sort_order: 6,
    is_active: true,
    is_coming_soon: true,
    created_at: null,
  },
  {
    id: 'prompt',
    name: 'Prompt Lab',
    tagline: "Ottimizza i tuoi prompt con l'intelligenza artificiale",
    description: 'Strumento in arrivo.',
    category: 'Prompt',
    badge: 'Soon',
    features: [],
    accent_color: '#8b5cf6',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    pricing_badge: 'Prossimamente',
    pricing_model: 'free',
    price_label: 'Prossimamente',
    cta_text: 'Prossimamente',
    cta_href: null,
    is_internal: false,
    internal_route: null,
    video_src: null,
    poster_src: null,
    layout: 'text-left',
    sort_order: 7,
    is_active: true,
    is_coming_soon: true,
    created_at: null,
  },
];

function normalizeApp(app: AppRecord): AppRecord {
  if (app.is_internal && !app.internal_route) {
    return {
      ...app,
      internal_route: `/apps/${app.id}`,
    };
  }

  return app;
}

export async function getPublicApps() {
  if (!publicSupabase) {
    return STATIC_APPS;
  }

  const { data, error } = await publicSupabase
    .from('apps')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) {
    return STATIC_APPS;
  }

  return (data as AppRecord[]).map(normalizeApp);
}

export async function getPublicAppById(id: string) {
  const apps = await getPublicApps();
  return apps.find((app) => app.id === id) ?? null;
}
