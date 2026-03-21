import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/* ─── Type ───────────────────────────────────────────────────── */
export interface App {
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

/* ─── Static fallback (usato se Supabase non è configurato) ──── */
export const STATIC_APPS: App[] = [
  {
    id: 'ugc',
    name: 'UGC Ad Creator',
    tagline: 'Da una foto, un video promozionale HD',
    description: 'Carica la foto del tuo prodotto e in meno di 60 secondi ottieni un video promozionale professionale, ottimizzato per TikTok, Reels e Stories.',
    category: '🎬 Creatività · Video',
    badge: 'Video AI',
    features: ['📸 Carica la foto del tuo prodotto', '🎬 AI genera video HD promozionale', '📱 Formato 9:16 ottimizzato per social', '⚡ Pronto in meno di 60 secondi'],
    accent_color: '#ec4899',
    bg_color: '#F5F5F7',
    bg_gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    pricing_badge: 'Scopri prezzi',
    pricing_model: 'freemium',
    price_label: 'Scopri prezzi',
    cta_text: 'Prova UGC Ad Creator',
    cta_href: 'https://ugcvideo.netlify.app',
    is_internal: false,
    internal_route: null,
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
    description: "Lo strumento AI dedicato agli avvocati per la gestione delle procedure di composizione della crisi d'impresa. Analisi automatica, atti e pareri in secondi.",
    category: '⚖️ Legal AI · CCII',
    badge: 'Legal AI',
    features: ['📄 Analisi documenti finanziari automatica', '⚖️ Generazione atti e pareri legali in secondi', '🔍 Database giurisprudenziale con ricerca semantica', '✅ Aggiornamento automatico alla normativa vigente'],
    accent_color: '#3b82f6',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    pricing_badge: 'Da €30/mese',
    pricing_model: 'subscription',
    price_label: 'Da €30/mese',
    cta_text: 'Accedi ad AI Crisi',
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
    description: 'Carica il file HTML del tuo broker e ottieni in 30 secondi un report fiscale strutturato e professionale. Calcolo automatico P&L, imposte e archivio storico.',
    category: '📊 Finanza · Tax',
    badge: 'Finanza',
    features: ['📁 Carica il file HTML del tuo broker', '🧮 Calcolo automatico P&L e imposte dovute', '📄 PDF professionale scaricabile', '🗂️ Archivio storico consultabile per anno fiscale'],
    accent_color: '#10b981',
    bg_color: '#F5F5F7',
    bg_gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    pricing_badge: 'Da €9,90',
    pricing_model: 'one-time',
    price_label: 'Da €9,90',
    cta_text: 'Prova Trading Fiscale',
    cta_href: 'https://app-trading-fiscale-v2.netlify.app/',
    is_internal: false,
    internal_route: null,
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
    description: 'Calcola sanzioni e interessi legali in pochi secondi. Lo strumento professionale che sostituisce i fogli Excel, sempre aggiornato alla normativa vigente.',
    category: '🏛️ Fiscale · Sanzioni',
    badge: 'Fiscale',
    features: ['⌨️ Inserisci tributo, importo e date', '🧮 Calcolo istantaneo sanzioni e interessi', '📄 Esporta report PDF professionale', '📐 Formule sempre aggiornate alla normativa'],
    accent_color: '#3713ec',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    pricing_badge: 'Gratis · poi da €19/mese',
    pricing_model: 'freemium',
    price_label: 'Gratis · poi da €19/mese',
    cta_text: 'Prova Gratis',
    cta_href: 'https://adorable-bonbon-d1d407.netlify.app/',
    is_internal: false,
    internal_route: null,
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
    description: 'Strumento in arrivo.',
    category: '🧾 Fiscale · Regime Forfettario',
    badge: 'Fiscale',
    features: [],
    accent_color: '#f59e0b',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    pricing_badge: 'Prossimamente',
    pricing_model: 'free',
    price_label: 'Prossimamente',
    cta_text: 'Ricevi notifica',
    cta_href: '',
    is_internal: false,
    internal_route: null,
    video_src: null,
    poster_src: null,
    layout: 'text-left',
    sort_order: 5,
    is_active: true,
    is_coming_soon: true,
    created_at: null,
  },
  {
    id: 'bot',
    name: 'Bot AI',
    tagline: 'Crea il tuo agente AI per il supporto clienti',
    description: 'Strumento in arrivo.',
    category: '🤖 AI · Automation',
    badge: 'Automation',
    features: [],
    accent_color: '#6366f1',
    bg_color: '#F5F5F7',
    bg_gradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    pricing_badge: 'Prossimamente',
    pricing_model: 'free',
    price_label: 'Prossimamente',
    cta_text: 'Ricevi notifica',
    cta_href: '',
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
    category: '✨ AI · Prompt Engineering',
    badge: 'Prompt',
    features: [],
    accent_color: '#8b5cf6',
    bg_color: '#FFFFFF',
    bg_gradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    pricing_badge: 'Prossimamente',
    pricing_model: 'free',
    price_label: 'Prossimamente',
    cta_text: 'Ricevi notifica',
    cta_href: '',
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

/* ─── Hook ───────────────────────────────────────────────────── */
interface UseAppsOptions {
  onlyActive?: boolean;
}

export function useApps(options: UseAppsOptions = {}) {
  const { onlyActive = true } = options;
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchApps = async () => {
      // Fallback statico se Supabase non configurato
      if (!supabase) {
        const filtered = onlyActive ? STATIC_APPS.filter(a => a.is_active) : STATIC_APPS;
        if (!cancelled) {
          setApps(filtered);
          setLoading(false);
        }
        return;
      }

      try {
        let query = supabase.from('apps').select('*').order('sort_order', { ascending: true });
        if (onlyActive) query = query.eq('is_active', true);

        const { data, error: sbError } = await query;

        if (!cancelled) {
          if (sbError) {
            console.error('[useApps] Supabase error:', sbError.message);
            // Fallback ai dati statici in caso di errore
            const filtered = onlyActive ? STATIC_APPS.filter(a => a.is_active) : STATIC_APPS;
            setApps(filtered);
            setError(sbError.message);
          } else {
            setApps((data as App[]) ?? []);
            setError(null);
          }
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          const filtered = onlyActive ? STATIC_APPS.filter(a => a.is_active) : STATIC_APPS;
          setApps(filtered);
          setError('Errore di rete');
          setLoading(false);
        }
      }
    };

    void fetchApps();
    return () => { cancelled = true; };
  }, [onlyActive]);

  return { apps, loading, error };
}
