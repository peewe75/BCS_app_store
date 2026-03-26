import { publicSupabase } from '@/src/lib/supabase/public';
import { getAppWorkspaceRoute } from '@/src/lib/app-routes';

export interface PlanTier {
  code: string;
  label: string;
  description?: string;
}

/** Static plan config and admin URLs per app (not stored in Supabase). */
export const APP_PLAN_CONFIG: Record<string, { plans?: PlanTier[]; admin_url?: string }> = {
  softi: {
    plans: [
      { code: 'free', label: 'Gratuito', description: 'Accesso limitato' },
      { code: 'monthly', label: 'Mensile', description: 'Accesso completo' },
    ],
    admin_url: 'https://softi-ai-analyzer.onrender.com/admin',
  },
  trading: {
    plans: [{ code: 'one_time', label: 'Acquisto unico' }],
  },
  ravvedimento: {
    plans: [
      { code: 'free', label: 'Gratuito', description: 'Accesso base' },
      { code: 'monthly', label: 'Mensile', description: 'Accesso completo' },
    ],
  },
  ugc: {
    plans: [{ code: 'base', label: 'Base' }],
  },
  'ai-crisi': {
    plans: [{ code: 'monthly', label: 'Mensile' }],
    admin_url: 'https://ai-crisi.vercel.app/admin',
  },
};

export interface AppLandingSection {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
}

export interface AppLandingContent {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  trustLine?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  problemTitle?: string;
  problemBody?: string;
  sections?: AppLandingSection[];
  benefitsTitle?: string;
  benefits?: string[];
  audienceTitle?: string;
  audienceBody?: string;
  pricingTitle?: string;
  pricingLine?: string;
  supportLine?: string;
  closingHeadline?: string;
  closingBody?: string;
  finalCtaLabel?: string;
}

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
  landing_content?: AppLandingContent | null;
  plans?: PlanTier[] | null;
  admin_url?: string | null;
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
    internal_route: getAppWorkspaceRoute('ugc'),
    video_src: '/video/UGC_video.mp4',
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
    landing_content: {
      eyebrow: "Piattaforma AI verticale per crisi d'impresa e sovraindebitamento",
      headline: 'Gestisci fascicoli, documenti, giurisprudenza e atti in un unico sistema operativo',
      subheadline:
        'AI Crisi aiuta avvocati, OCC, advisor e studi multidisciplinari a organizzare il fascicolo, usare una knowledge base aggiornata e accelerare la redazione senza perdere controllo professionale.',
      trustLine:
        'Nessuna piattaforma generica. Un ambiente di lavoro costruito per procedure CCII e sovraindebitamento.',
      primaryCtaLabel: 'Attiva la prova gratuita',
      secondaryCtaLabel: 'Scopri le funzionalita',
      problemTitle: "Il problema non e solo scrivere un atto. E governare tutto cio che viene prima.",
      problemBody:
        'Nella pratica quotidiana il tempo si disperde tra raccolta documenti, ricostruzione del fascicolo, ricerca di fonti e predisposizione delle prime bozze. AI Crisi riordina questo flusso in un sistema operativo verticale.',
      sections: [
        {
          id: 'fascicolo',
          title: 'Fascicolo digitale strutturato',
          body:
            'Ogni pratica nasce dentro un ambiente ordinato, con documenti classificati e una vista chiara dello stato del lavoro.',
          bullets: [
            'Raccolta documentale centralizzata per pratica.',
            'Estrazione del testo dai documenti caricati.',
            'Dashboard dedicata per stato del fascicolo e atti generati.',
          ],
        },
        {
          id: 'officina',
          title: 'Officina Atti e base giuridica',
          body:
            'Il sistema combina documenti, fonti e conoscenza interna per accelerare la prima bozza di pareri, ricorsi, istanze e memorie.',
          bullets: [
            'Generazione assistita di atti e pareri legali.',
            'Knowledge base vettoriale per normativa, giurisprudenza e template.',
            'Aggiornamento automatico della base informativa nel tempo.',
          ],
        },
        {
          id: 'studio',
          title: 'Controllo operativo di studio',
          body:
            'AI Crisi non sostituisce il professionista: rafforza il metodo di lavoro e rende piu stabile il patrimonio informativo condiviso.',
          bullets: [
            'Area admin per supervisione globale e standardizzazione.',
            'Meno dispersione tra team, fascicoli e fonti.',
            'Piu continuita tra istruttoria, strategia e output finali.',
          ],
        },
      ],
      benefitsTitle: 'Perche adottarla',
      benefits: [
        'Riduce il tempo dedicato alla ricostruzione del fascicolo.',
        'Accelera la predisposizione della prima bozza degli atti.',
        'Centralizza materiali, giurisprudenza e template in un unico sistema.',
        'Aumenta il controllo del professionista sul processo e sul risultato.',
      ],
      audienceTitle: 'Per chi e pensata',
      audienceBody:
        'Per avvocati che seguono procedure CCII, OCC, advisor, commercialisti coinvolti nella regolazione della crisi e studi multidisciplinari che vogliono un metodo piu ordinato e scalabile.',
      pricingTitle: 'Piano Pro',
      pricingLine: '30 euro/mese con 14 giorni di prova gratuita',
      supportLine:
        'Il modo piu semplice per verificare su pratiche reali quanto una piattaforma verticale possa incidere su produttivita, ordine e qualita del lavoro.',
      closingHeadline: 'Porta nel tuo studio un sistema di lavoro, non solo uno strumento di scrittura',
      closingBody:
        'AI Crisi trasforma documenti, fonti e bozze in un processo piu ordinato, piu veloce e piu controllabile.',
      finalCtaLabel: 'Attiva la prova gratuita',
    },
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
    internal_route: getAppWorkspaceRoute('trading'),
    video_src: '/video/trading_fiscale.mp4',
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
    internal_route: getAppWorkspaceRoute('ravvedimento'),
    video_src: '/video/Ravvedimento_demo.mp4',
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
    internal_route: getAppWorkspaceRoute('forf'),
    video_src: '/video/ForfApp_demo.mp4',
    poster_src: '/images/ForfApp.png',
    layout: 'text-left',
    sort_order: 5,
    is_active: true,
    is_coming_soon: false,
    created_at: null,
  },
  {
    id: 'softi',
    name: 'Softi AI Analyzer',
    tagline: 'Analisi AI dei mercati finanziari in tempo reale',
    description: 'Segnali MT5, report Gemini Daily/Weekly/Monthly, analisi interattiva multi-timeframe.',
    category: 'Trading',
    badge: 'Pro',
    features: ['Feed segnali MT5 live', 'Report AI giornalieri', 'Analisi interattiva Gemini', 'Multi-timeframe'],
    accent_color: '#6366f1',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    pricing_badge: 'Piano pro',
    pricing_model: 'subscription',
    price_label: 'Piano pro',
    cta_text: 'Apri Softi AI',
    cta_href: 'https://softi-ai-analyzer.onrender.com',
    is_internal: false,
    internal_route: null,
    video_src: null,
    poster_src: null,
    layout: 'text-left',
    sort_order: 6,
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

export function normalizeApp(app: AppRecord): AppRecord {
  // Merge static plan config when not already set (Supabase doesn't store plans/admin_url)
  const config = APP_PLAN_CONFIG[app.id];
  const enriched: Partial<AppRecord> = config
    ? {
        plans: app.plans ?? config.plans ?? null,
        admin_url: app.admin_url ?? config.admin_url ?? null,
      }
    : {};

  if (app.is_internal) {
    const expectedWorkspaceRoute = getAppWorkspaceRoute(app.id);

    if (!app.internal_route || app.internal_route.startsWith('/apps/')) {
      return {
        ...app,
        ...enriched,
        internal_route: expectedWorkspaceRoute,
      };
    }

    return {
      ...app,
      ...enriched,
      internal_route: app.internal_route,
    };
  }

  if (!app.is_internal && app.internal_route) {
    return {
      ...app,
      ...enriched,
      internal_route: null,
    };
  }

  return { ...app, ...enriched };
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
