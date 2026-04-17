import { publicSupabase } from '@/src/lib/supabase/public';
import { getAppWorkspaceRoute } from '@/src/lib/app-routes';

export interface PlanTier {
  code: string;
  label: string;
  description?: string;
  /** Default feature list â€” can be overridden by admin via app_billing_plans.features in DB */
  features?: string[];
  trial_days?: number;
}

export interface LimitKey {
  key: string;
  label: string;
  type: 'number' | 'tabs' | 'credits';
  period?: 'daily' | 'monthly';
  options?: string[]; // only for type:'tabs'
  default?: number | string[];
}

/** Static plan config and admin URLs per app (not stored in Supabase). */
export const APP_PLAN_CONFIG: Record<string, { plans?: PlanTier[]; admin_url?: string; limitKeys?: LimitKey[] }> = {
  softi: {
    plans: [
      {
        code: 'free',
        label: 'Gratuito',
        description: 'Accesso limitato',
        features: [
          'Fino a 3 asset selezionabili',
          '5 analisi AI al giorno',
          'Report giornaliero (solo testo)',
          'Feed dati base (Google Finance, Yahoo Finance)',
        ],
      },
      {
        code: 'monthly',
        label: 'Mensile â€” â‚¬29/mese',
        description: 'Accesso completo',
        features: [
          'Asset illimitati',
          'Analisi AI illimitate',
          'Report giornaliero, settimanale e mensile',
          'Segnali MT5 live',
          'Tutti i feed di mercato (Alpha Vantage, Finnhub, Marketaux)',
          'Analisi multi-timeframe',
          'Accesso prioritario alle nuove funzionalitÃ ',
        ],
      },
    ],
    admin_url: 'https://softi-ai-analyzer.onrender.com/admin',
    limitKeys: [
      { key: 'analyses_per_day', label: 'Analisi AI al giorno', type: 'number', period: 'daily', default: 1 },
      { key: 'reports_per_month', label: 'Report al mese', type: 'number', period: 'monthly', default: 0 },
      { key: 'max_assets', label: 'Asset selezionabili', type: 'number', default: 3 },
      { key: 'tabs', label: 'Tab accessibili', type: 'tabs', options: ['overview', 'analysis', 'reports', 'signals', 'mt5'] },
    ],
  },
  trading: {
    plans: [
      {
        code: 'base',
        label: 'Base - EUR 9,90',
        description: 'Per un singolo report annuale.',
        features: ['Anno corrente e precedente', '1 report per anno fiscale', 'Riepilogo fiscale in PDF'],
      },
      {
        code: 'standard',
        label: 'Standard - EUR 19,90',
        description: 'Per chi gestisce piu conti nello stesso anno.',
        features: ['Anno corrente e precedente', 'Fino a 3 report per anno fiscale', 'Storico report e download PDF'],
      },
      {
        code: 'pro',
        label: 'Pro - EUR 34,90',
        description: 'Per studi e trader con storico completo.',
        features: ['Report illimitati', 'Accesso agli anni precedenti', 'Storico completo e priorita operativa'],
      },
    ],
    limitKeys: [
      { key: 'reports_per_year', label: 'Report per anno fiscale', type: 'number', default: 1 },
    ],
  },
  ravvedimento: {
    plans: [
      {
        code: 'free',
        label: 'Gratuito',
        description: 'Accesso base',
        features: ['3 calcoli al mese', 'Imposte principali', 'Esportazione base'],
      },
      {
        code: 'monthly',
        label: 'Mensile â€” â‚¬19/mese',
        description: 'Accesso completo',
        features: ['Calcoli illimitati', 'Tutte le imposte', 'Storico completo', 'Esportazione PDF/Excel'],
      },
    ],
    limitKeys: [
      { key: 'calculations_per_month', label: 'Calcoli al mese', type: 'number', period: 'monthly', default: 10 },
    ],
  },
  ugc: {
    plans: [
      {
        code: 'free',
        label: 'Gratuito',
        description: '1 generazione di prova',
        features: ['1 credito di prova', 'Generazione immagine (25 crediti)', 'Generazione video UGC (75 crediti)'],
      },
      {
        code: 'credits',
        label: '1000 Crediti â€” â‚¬9,60',
        description: 'Pacchetto crediti ricaricabile',
        features: ['1000 crediti', '~13 video UGC completi', '~40 immagini lifestyle', 'Crediti cumulabili', 'Nessuna scadenza'],
      },
    ],
    limitKeys: [
      { key: 'video_credits', label: 'Crediti inclusi', type: 'credits' as const, default: 1000 },
    ],
  },
  'crypto-fiscale': {
    plans: [
      {
        code: 'free',
        label: 'Gratuito',
        description: 'Per provare il servizio',
        features: ['Fino a 50 transazioni', '1 report per anno fiscale', 'Quadro RW e RT base'],
      },
      {
        code: 'base',
        label: 'Base - EUR 14,90',
        description: 'Per investitori retail',
        features: ['Fino a 500 transazioni', 'Report illimitati per anno fiscale', 'Quadro RW e RT completi', 'Export PDF e XLSX'],
      },
      {
        code: 'pro',
        label: 'Pro - EUR 39,90',
        description: 'Per trader e professionisti',
        features: ['Transazioni illimitate', 'Multi-exchange avanzato', 'Report illimitati multi-anno', 'Audit trail completo', 'Priorita operativa'],
      },
    ],
    limitKeys: [
      { key: 'transactions_limit', label: 'Transazioni massime', type: 'number', default: 50 },
      { key: 'reports_per_year', label: 'Report per anno fiscale', type: 'number', default: 1 },
    ],
  },
  'ai-crisi': {
    plans: [
      {
        code: 'monthly',
        label: 'Mensile â€” â‚¬30/mese',
        features: ['Fascicoli illimitati', 'Knowledge base CCII', 'Generazione atti AI', 'Area admin studio'],
      },
    ],
    admin_url: 'https://ai-crisi.vercel.app/admin',
  },
  'legal-ai-penale': {
    plans: [
      {
        code: 'free',
        label: 'Free',
        description: 'Landing e dashboard base',
        features: ['Landing pubblica gratuita', 'Clerk B condiviso', 'DB unico BCS'],
      },
      {
        code: 'monthly',
        label: 'Mensile',
        description: 'Checkout centralizzato pronto per il futuro',
        features: ['Stripe solo in BCS admin', 'Entitlement centralizzati', 'Piano paid predisposto'],
      },
    ],
    admin_url: 'https://ultrabot.space/admin',
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
    id: 'legal-ai-penale',
    name: 'Legal AI Penale',
    tagline: 'Fascicolo penale digitale con AI e database unico BCS',
    description:
      'Landing free, login con Clerk B e pipeline audio centralizzata su Supabase BCS per casi, segmenti, timeline ed eventi.',
    category: 'Legal AI',
    badge: 'Penale',
    features: [],
    accent_color: '#b45309',
    bg_color: '#FFF8E7',
    bg_gradient: 'linear-gradient(135deg, #fff8e7 0%, #fef3c7 100%)',
    pricing_badge: 'Free oggi - billing BCS centralizzato',
    pricing_model: 'free',
    price_label: 'Free oggi - billing BCS centralizzato',
    cta_text: 'Apri Legal AI Penale',
    cta_href: 'https://legal-ai-penale.netlify.app/dashboard',
    is_internal: false,
    internal_route: null,
    video_src: '/video/App_Penale.mp4',
    poster_src: '/images/App_Penale.png',
    layout: 'text-left',
    sort_order: 3,
    is_active: true,
    is_coming_soon: false,
    created_at: null,
    landing_content: {
      eyebrow: 'App penale dentro il sistema BCS',
      headline: 'Fascicolo penale digitale, landing free e dashboard pronta all uso.',
      subheadline:
        'Legal AI Penale resta su Netlify, ma autentica con il progetto Clerk gia usato da ultrabot.space e salva i dati nel DB unico BCS.',
      trustLine:
        'Clerk B per login e registrazione, Supabase BCS per fascicoli e trascrizioni, Stripe centralizzato solo in BCS admin quando il piano diverra paid.',
      primaryCtaLabel: 'Apri dashboard utente',
      secondaryCtaLabel: 'Vai a BCS admin',
      problemTitle: 'Un solo stack, zero doppioni.',
      problemBody:
        'La landing resta semplice e gratuita, mentre il lavoro serio vive nello stack condiviso di BCS: stessi utenti, stessi profili, stessi entitlement e stesso billing.',
      sections: [
        {
          id: 'landing',
          title: 'Landing free e accesso immediato',
          body:
            'Il sito pubblico introduce il prodotto, mostra il valore per il professionista e porta al login o alla dashboard senza una seconda piattaforma di identita.',
          bullets: [
            'Hero dedicato alla pratica penale e ai fascicoli audio.',
            'CTA verso registrazione, dashboard e percorso utenti.',
            'Piano iniziale gratuito con passaggio futuro al paid gia predisposto.',
          ],
        },
        {
          id: 'workflow',
          title: 'Pipeline unica per audio e trascrizioni',
          body:
            'Caricamento audio, Deepgram, estrazione eventi e memoria del fascicolo finiscono tutti nel backend BCS cosi la dashboard amministrativa vede gli stessi dati.',
          bullets: [
            'Upload audio su storage BCS.',
            'Trascrizioni e timeline salvate nello stesso database.',
            'Chat legale collegata ai segmenti del caso.',
          ],
        },
        {
          id: 'billing',
          title: 'Billing e entitlement gestiti da BCS admin',
          body:
            'Il frontend non contiene Stripe separato. Quando il piano diverra paid, il checkout restera nel flusso BCS con prodotti, portal e webhook centralizzati.',
          bullets: [
            'Stripe unico in ultrabot.space.',
            'Entitlement letti da BCS admin.',
            'Migrazione da free a paid senza rifare auth o landing.',
          ],
        },
      ],
      benefitsTitle: 'Perche dentro BCS',
      benefits: [
        'Un solo account Clerk per la suite.',
        'Un solo database per dashboard e app.',
        'Un solo flusso Stripe gestito da BCS admin.',
        'Un solo posto dove governare accessi e piani.',
      ],
      audienceTitle: 'Per chi e pensata',
      audienceBody:
        'Per avvocati penalisti e studi che vogliono un fascicolo digitale ordinato, ma anche una base pronta per il passaggio a piani premium centralizzati.',
      pricingTitle: 'Piano iniziale',
      pricingLine: 'Free oggi, con strada gia pronta per il checkout centralizzato BCS.',
      supportLine:
        'L accesso alla dashboard utenti resta sul sito legal-ai-penale.netlify.app, mentre il controllo amministrativo rimane su ultrabot.space.',
      closingHeadline: 'Stessa identita, stesso database, stesso billing.',
      closingBody:
        'Legal AI Penale entra nella suite senza diventare un isola: resta un prodotto dedicato, ma con controllo centralizzato in BCS.',
      finalCtaLabel: 'Apri dashboard utente',
    },
  },
  {
    id: 'trading',
    name: 'Dichiarazione Trading',
    tagline: 'Report fiscale professionale per il tuo broker',
    description: 'Workspace dati e storico report.',
    category: 'Finanza e tax',
    badge: 'Finanza',
    features: [],
    accent_color: '#10b981',
    bg_color: '#F5F5F7',
    bg_gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    pricing_badge: 'Base da EUR 9,90',
    pricing_model: 'one-time',
    price_label: 'Base da EUR 9,90',
    cta_text: 'Apri Dichiarazione Trading',
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
    landing_content: {
      eyebrow: 'Dichiarazione Trading in BCS AI Suite',
      headline: 'Dal report MetaTrader al materiale fiscale, senza uscire dalla suite.',
      subheadline:
        'Registrazione con Clerk, acquisto nella dashboard unificata e workspace dedicato: carichi un export HTML MetaTrader 4/5, scegli anno fiscale e tipo conto, poi ottieni report e facsimili in un flusso coerente.',
      trustLine:
        'Un solo account, dashboard condivisa con le altre app, accesso al workspace Trading e dati applicativi su Supabase gia integrati nel progetto BCS AI Suite.',
      primaryCtaLabel: 'Registrati ed entra in dashboard',
      secondaryCtaLabel: 'Scopri come funziona',
      problemTitle: 'Non serve un microsito separato. Serve un percorso giusto.',
      problemBody:
        'Dichiarazione Trading non apre un secondo ecosistema: usa lo stesso progetto Clerk, la stessa dashboard e lo stesso modello di accesso delle altre app della suite.',
      sections: [
        {
          id: 'upload',
          title: 'Importa il report del broker',
          body:
            'Il workspace parte da file HTML MetaTrader 4/5, cosi il punto di ingresso resta concreto e aderente al prodotto reale.',
          bullets: [
            'Upload di file HTML MetaTrader 4/5.',
            'Selezione anno fiscale e tipo conto standard o centesimale.',
            'Flusso operativo dentro lo stesso workspace della suite.',
          ],
        },
        {
          id: 'output',
          title: 'Ottieni materiale fiscale riutilizzabile',
          body:
            'Il sistema elabora il report, salva lo storico e mette a disposizione PDF riepilogativo e facsimili RW/RT secondo il piano attivo.',
          bullets: [
            'Riepilogo fiscale in PDF.',
            'Storico report nel workspace.',
            'Facsimili RW/RT e limiti coerenti con il piano.',
          ],
        },
      ],
      benefitsTitle: 'Perche dentro BCS AI Suite',
      benefits: [
        'Registrazione e login condivisi con Clerk.',
        'Grant piano letto da user_apps senza duplicare la logica auth.',
        'Supabase gia collegato a profili, grants e trading_reports.',
        'Passaggio naturale da landing a dashboard e workspace Trading.',
      ],
      audienceTitle: 'Per chi e pensata',
      audienceBody:
        'Per trader retail e studi che vogliono un percorso fiscale piu ordinato, partendo da un export del broker e arrivando a un output consultabile nella suite.',
      pricingTitle: 'Piani Trading',
      pricingLine: 'Base, Standard e Pro: da EUR 9,90 a EUR 34,90 con grant piano dentro la dashboard.',
      supportLine:
        'L accesso resta lo stesso della suite: registrazione, dashboard, attivazione del piano e apertura del workspace dedicato.',
      closingHeadline: 'Entra nella suite, poi apri il workspace giusto',
      closingBody:
        'Il modo piu semplice per usare Dichiarazione Trading e seguire il funnel reale di BCS AI Suite, senza passaggi separati o credenziali duplicate.',
      finalCtaLabel: 'Apri il workspace Trading',
    },
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
    sort_order: 6,
    is_active: true,
    is_coming_soon: false,
    created_at: null,
  },
  {
    id: 'crypto-fiscale',
    name: 'Crypto Fiscale',
    tagline: 'Dichiarazione Crypto in pochi click',
    description: 'Report HTML degli exchange in quadri fiscali pronti per la dichiarazione.',
    category: 'Fiscale',
    badge: 'Crypto',
    features: [],
    accent_color: '#f59e0b',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    pricing_badge: 'Free poi da EUR 14,90',
    pricing_model: 'freemium',
    price_label: 'Free poi da EUR 14,90',
    cta_text: 'Apri Crypto Fiscale',
    cta_href: null,
    is_internal: true,
    internal_route: getAppWorkspaceRoute('crypto-fiscale'),
    video_src: '/video/Trading Crypto.mp4',
    poster_src: '/images/Trading Crypto.png',
    layout: 'text-left',
    sort_order: 7,
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
    poster_src: '/images/Softi.png',
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
  const staticDefaults = STATIC_APPS.find((entry) => entry.id === app.id);
  const mergedApp: AppRecord = staticDefaults
    ? {
        ...staticDefaults,
        ...app,
        tagline: app.tagline ?? staticDefaults.tagline,
        description: app.description ?? staticDefaults.description,
        category: app.category ?? staticDefaults.category,
        badge: app.badge ?? staticDefaults.badge,
        features: app.features?.length ? app.features : staticDefaults.features,
        accent_color: app.accent_color ?? staticDefaults.accent_color,
        bg_color: app.bg_color ?? staticDefaults.bg_color,
        bg_gradient: app.bg_gradient ?? staticDefaults.bg_gradient,
        pricing_badge: app.pricing_badge ?? staticDefaults.pricing_badge,
        pricing_model: app.pricing_model ?? staticDefaults.pricing_model,
        price_label: app.price_label ?? staticDefaults.price_label,
        cta_text: app.cta_text ?? staticDefaults.cta_text,
        cta_href: app.cta_href ?? staticDefaults.cta_href,
        internal_route: app.internal_route ?? staticDefaults.internal_route,
        video_src: app.video_src ?? staticDefaults.video_src,
        poster_src: app.poster_src ?? staticDefaults.poster_src,
        landing_content: app.landing_content ?? staticDefaults.landing_content ?? null,
        plans: app.plans ?? staticDefaults.plans ?? null,
        admin_url: app.admin_url ?? staticDefaults.admin_url ?? null,
      }
    : app;

  // Merge static plan config when not already set (Supabase doesn't store plans/admin_url)
  const config = APP_PLAN_CONFIG[mergedApp.id];
  const enriched: Partial<AppRecord> = config
    ? {
        plans: mergedApp.plans ?? config.plans ?? null,
        admin_url: mergedApp.admin_url ?? config.admin_url ?? null,
      }
    : {};

  // Force internal app routes for known internal slugs regardless of DB value
  const INTERNAL_APP_SLUGS = new Set(['ugc', 'trading', 'ravvedimento', 'forf', 'crypto-fiscale']);
  const forceInternal = INTERNAL_APP_SLUGS.has(mergedApp.id);
  const effectiveIsInternal = forceInternal || mergedApp.is_internal;

  if (effectiveIsInternal) {
    const expectedWorkspaceRoute = getAppWorkspaceRoute(mergedApp.id);

    if (!mergedApp.internal_route || mergedApp.internal_route.startsWith('/apps/')) {
      return {
        ...mergedApp,
        ...enriched,
        is_internal: true,
        internal_route: expectedWorkspaceRoute,
      };
    }

    return {
      ...mergedApp,
      ...enriched,
      is_internal: true,
      internal_route: mergedApp.internal_route,
    };
  }

  if (!mergedApp.is_internal && mergedApp.internal_route) {
    return {
      ...mergedApp,
      ...enriched,
      internal_route: null,
    };
  }

  return { ...mergedApp, ...enriched };
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

