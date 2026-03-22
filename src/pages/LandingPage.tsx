import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductSection from '../components/ProductSection';
import Logo from '../components/Logo';
import { useApps } from '../hooks/useApps';

/* ─── Animation helpers ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay },
  }),
};

/* ─── Products data ──────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: 'ugc',
    category: '🎬 Creatività · Video',
    name: 'UGC Ad Creator',
    tagline: 'Da una foto, un video promozionale HD',
    description:
      'Carica la foto del tuo prodotto e in meno di 60 secondi ottieni un video promozionale professionale, ottimizzato per TikTok, Reels e Stories.',
    features: [
      '📸 Carica la foto del tuo prodotto',
      '🎬 AI genera video HD promozionale',
      '📱 Formato 9:16 ottimizzato per social',
      '⚡ Pronto in meno di 60 secondi',
    ],
    accentColor: '#ec4899',
    pricingBadge: 'Scopri prezzi',
    ctaText: 'Prova UGC Ad Creator',
    ctaHref: 'https://ugcvideo.netlify.app',
    layout: 'text-left' as const,
    bgColor: '#F5F5F7',
    videoSrc: '/video/1.mp4',
    posterSrc: '/images/1.png',
  },
  {
    id: 'ai-crisi',
    category: '⚖️ Legal AI · CCII',
    name: 'AI Crisi',
    tagline: 'Gestisci le procedure CCII con l\'intelligenza artificiale',
    description:
      'Lo strumento AI dedicato agli avvocati per la gestione delle procedure di composizione della crisi d\'impresa. Analisi automatica, atti e pareri in secondi.',
    features: [
      '📄 Analisi documenti finanziari automatica',
      '⚖️ Generazione atti e pareri legali in secondi',
      '🔍 Database giurisprudenziale con ricerca semantica',
      '✅ Aggiornamento automatico alla normativa vigente',
    ],
    accentColor: '#3b82f6',
    pricingBadge: 'Da €30/mese',
    ctaText: 'Accedi ad AI Crisi',
    ctaHref: 'https://ai-crisi.vercel.app',
    layout: 'text-right' as const,
    bgColor: '#FFFFFF',
    videoSrc: '/video/2.mp4',
    posterSrc: '/images/2.png',
  },
  {
    id: 'trading',
    category: '📊 Finanza · Tax',
    name: 'Trading Fiscale',
    tagline: 'Report fiscale professionale per il tuo broker',
    description:
      'Carica il file HTML del tuo broker e ottieni in 30 secondi un report fiscale strutturato e professionale. Calcolo automatico P&L, imposte e archivio storico.',
    features: [
      '📁 Carica il file HTML del tuo broker',
      '🧮 Calcolo automatico P&L e imposte dovute',
      '📄 PDF professionale scaricabile',
      '🗂️ Archivio storico consultabile per anno fiscale',
    ],
    accentColor: '#10b981',
    pricingBadge: 'Da €9,90',
    ctaText: 'Prova Trading Fiscale',
    ctaHref: 'https://app-trading-fiscale-v2.netlify.app/',
    layout: 'text-left' as const,
    bgColor: '#F5F5F7',
    videoSrc: '/video/3.mp4',
    posterSrc: '/images/3.png',
  },
  {
    id: 'ravvedimento',
    category: '🏛️ Fiscale · Sanzioni',
    name: 'RavvedimentoFacile',
    tagline: 'Il ravvedimento operoso, finalmente semplice',
    description:
      'Calcola sanzioni e interessi legali in pochi secondi. Lo strumento professionale che sostituisce i fogli Excel, sempre aggiornato alla normativa vigente.',
    features: [
      '⌨️ Inserisci tributo, importo e date',
      '🧮 Calcolo istantaneo sanzioni e interessi',
      '📄 Esporta report PDF professionale',
      '📐 Formule sempre aggiornate alla normativa',
    ],
    accentColor: '#3713ec',
    pricingBadge: 'Gratis · poi da €19/mese',
    ctaText: 'Prova Gratis',
    ctaHref: 'https://adorable-bonbon-d1d407.netlify.app/',
    layout: 'text-right' as const,
    bgColor: '#FFFFFF',
    videoSrc: '/video/4.mp4',
    posterSrc: '/images/4.png',
  },
] as const;

/* ─── Coming soon apps ───────────────────────────────────────── */
const COMING_SOON = [
  {
    emoji: '🧾',
    name: 'Forfettari AI',
    tagline: 'Calcolo tasse regime forfettario con AI',
    id: 'forf',
  },
  {
    emoji: '🤖',
    name: 'Bot AI',
    tagline: 'Crea il tuo agente AI per il supporto clienti',
    id: 'bot',
  },
  {
    emoji: '✨',
    name: 'Prompt Lab',
    tagline: 'Ottimizza i tuoi prompt con l\'intelligenza artificiale',
    id: 'prompt',
  },
];

/* ─── Pricing table data ─────────────────────────────────────── */
const PRICING_ROWS = [
  {
    emoji: '🎬',
    name: 'UGC Ad Creator',
    model: 'Da definire',
    price: '—',
    cta: 'Scopri',
    href: 'https://ugcvideo.netlify.app',
    accent: '#ec4899',
  },
  {
    emoji: '⚖️',
    name: 'AI Crisi',
    model: 'Abbonamento',
    price: 'Da €30/mese',
    cta: 'Inizia',
    href: 'https://ai-crisi.vercel.app',
    accent: '#3b82f6',
  },
  {
    emoji: '📊',
    name: 'Trading Fiscale',
    model: 'Acquisto singolo',
    price: 'Da €9,90',
    cta: 'Acquista',
    href: 'https://app-trading-fiscale-v2.netlify.app/',
    accent: '#10b981',
  },
  {
    emoji: '🏛️',
    name: 'RavvedimentoFacile',
    model: 'Freemium',
    price: 'Gratis → €19/mese',
    cta: 'Prova Gratis',
    href: 'https://adorable-bonbon-d1d407.netlify.app/',
    accent: '#3713ec',
  },
];

/* ─── ComingSoonCard ─────────────────────────────────────────── */
interface ComingSoonCardProps {
  emoji: string;
  name: string;
  tagline: string;
  id: string;
}

const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ emoji, name, tagline, id }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Store locally; will be replaced with Supabase in Phase 2
    const key = `waitlist_${id}`;
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as string[];
    localStorage.setItem(key, JSON.stringify([...existing, email]));
    setSubmitted(true);
  };

  return (
    <motion.div
      className="bcs-coming-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '28px',
            lineHeight: 1,
          }}
        >
          {emoji}
        </span>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '100px',
            background: 'rgba(55,19,236,0.2)',
            color: '#a78bfa',
            border: '1px solid rgba(55,19,236,0.3)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-display)',
          }}
        >
          PROSSIMAMENTE
        </span>
      </div>

      {/* Name + tagline */}
      <div>
        <h3
          style={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {name}
        </h3>
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 400,
            marginTop: '6px',
            margin: '6px 0 0',
          }}
        >
          {tagline}
        </p>
      </div>

      {/* Waitlist form */}
      {submitted ? (
        <p
          style={{
            color: '#4ade80',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          ✓ Sei in lista! Ti avviseremo al lancio.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="La tua email"
            required
            style={{
              flex: '1 1 160px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              outline: 'none',
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#3713ec',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            Ricevi notifica
          </button>
        </form>
      )}
    </motion.div>
  );
};

/* ─── Main LandingPage ───────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const { apps } = useApps();
  const activeApps   = apps.filter(a => !a.is_coming_soon);
  const comingSoon   = apps.filter(a => a.is_coming_soon);

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── 1. HERO ─────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(55,19,236,0.08) 0%, #0a0a0a 70%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 24px 80px',
          overflow: 'hidden',
        }}
      >
        {/* Animated gradient blobs */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            className="hero-blob-1"
            style={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              width: '700px',
              height: '700px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(55,19,236,0.25) 0%, rgba(99,51,255,0.08) 40%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="hero-blob-2"
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '15%',
              width: '550px',
              height: '550px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,51,255,0.2) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          <div
            className="hero-blob-3"
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '800px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(55,19,236,0.15) 0%, rgba(167,139,250,0.04) 50%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '860px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
          }}
        >
          {/* Badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 18px',
                borderRadius: '100px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.01em',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #4ade80',
                }}
              />
              7 strumenti AI · Un solo account · Made in Italy 🇮🇹
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 76px)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              margin: 0,
            }}
          >
            L'intelligenza artificiale
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #3713ec 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              al servizio del tuo business
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(17px, 2vw, 20px)',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
              maxWidth: '560px',
              margin: 0,
            }}
          >
            Strumenti AI professionali per avvocati, trader, consulenti e creator.
            Sviluppati in Italia, per il mercato italiano.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={0.3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link
              to="/signup"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '100px',
                background: '#3713ec',
                color: '#FFFFFF',
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                boxShadow: '0 4px 24px rgba(55,19,236,0.45)',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
              }}
            >
              Inizia Gratis
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <button
              onClick={() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '100px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.4)';
                (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';
              }}
            >
              Scopri i prodotti
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M8 13L4 9M8 13L12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '24px',
              height: '38px',
              borderRadius: '12px',
              border: '1.5px solid rgba(255,255,255,0.2)',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '8px',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '8px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.4)',
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. TRUST BAR ─────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '32px 24px' }}>
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              color: '#9ca3af',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Powered by
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.55 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4285f4" />
              <path d="M2 17L12 22L22 17" stroke="#34a853" strokeWidth="2" strokeLinecap="round" />
              <path d="M2 12L12 17L22 12" stroke="#fbbc04" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1D1D1F',
              }}
            >
              Google Gemini
            </span>
          </div>
          <div
            style={{
              width: '1px',
              height: '20px',
              background: '#e5e7eb',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.55 }}>
            <span style={{ fontSize: '16px' }}>☁️</span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1D1D1F',
              }}
            >
              Vertex AI
            </span>
          </div>
          <div
            style={{
              width: '1px',
              height: '20px',
              background: '#e5e7eb',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
            }}
          >
            🇮🇹 Made in Italy
          </span>
        </div>
      </section>

      {/* ── 3–6. PRODUCT SECTIONS ───────────────────────── */}
      <div id="products">
        {activeApps.map((app) => (
          <ProductSection
            key={app.id}
            id={app.id}
            category={app.category ?? ''}
            name={app.name}
            tagline={app.tagline ?? ''}
            description={app.description ?? ''}
            features={Array.isArray(app.features) ? app.features : []}
            accentColor={app.accent_color ?? '#3713ec'}
            pricingBadge={app.pricing_badge ?? ''}
            ctaText={app.cta_text ?? 'Scopri'}
            ctaHref={app.cta_href ?? '#'}
            videoSrc={app.video_src ?? undefined}
            posterSrc={app.poster_src ?? undefined}
            layout={app.layout ?? 'text-left'}
            bgColor={app.bg_color ?? '#FFFFFF'}
          />
        ))}
      </div>

      {/* ── 7. COMING SOON ──────────────────────────────── */}
      <section
        style={{
          background: '#000',
          padding: '100px 24px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: '56px' }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '5px 14px',
                borderRadius: '100px',
                background: 'rgba(55,19,236,0.15)',
                color: '#a78bfa',
                border: '1px solid rgba(55,19,236,0.25)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                fontFamily: 'var(--font-display)',
                marginBottom: '20px',
              }}
            >
              IN SVILUPPO
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 52px)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Prossimamente
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                marginTop: '12px',
              }}
            >
              Nuovi strumenti AI in arrivo. Registrati per essere il primo a saperlo.
            </p>
          </motion.div>

          {/* Cards grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {comingSoon.map((app) => (
              <ComingSoonCard
                key={app.id}
                id={app.id}
                emoji={app.category?.split(' ')[0] ?? '🔜'}
                name={app.name}
                tagline={app.tagline ?? ''}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. PRICING ──────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          background: '#F5F5F7',
          padding: '100px 24px',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: '56px' }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 800,
                color: '#1D1D1F',
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              Prezzi trasparenti
              <br />
              per ogni strumento
            </h2>
            <p
              style={{
                color: '#6E6E73',
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                marginTop: '12px',
              }}
            >
              Nessun abbonamento unico forzato. Paghi solo quello che usi.
            </p>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr',
                padding: '16px 28px',
                background: '#F5F5F7',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {['Prodotto', 'Modello', 'Prezzo', ''].map((h) => (
                <span
                  key={h}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#6E6E73',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows — generati da Supabase via useApps() */}
            {activeApps.map((app, i) => {
              const accent = app.accent_color ?? '#3713ec';
              const emoji = app.category?.split(' ')[0] ?? '📦';
              return (
                <div
                  key={app.id}
                  className="bcs-pricing-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr',
                    padding: '20px 28px',
                    alignItems: 'center',
                    borderBottom: i < activeApps.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      {emoji}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#1D1D1F' }}>
                      {app.name}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: '#6E6E73' }}>
                    {app.pricing_model ?? '—'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#1D1D1F' }}>
                    {app.price_label ?? app.pricing_badge ?? '—'}
                  </span>
                  <a
                    href={app.cta_href ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', borderRadius: '100px', background: `${accent}15`, color: accent, border: `1px solid ${accent}30`, fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `${accent}25`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `${accent}15`; }}
                  >
                    {app.cta_text ?? 'Scopri'}
                  </a>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── 9. FINAL CTA ────────────────────────────────── */}
      <section
        style={{
          background: '#000',
          padding: '120px 24px',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 60px)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.04em',
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            Crea il tuo
            <br />
            account BCS AI
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Un unico login per accedere a tutti i tuoi strumenti.
            <br />
            Inizia oggi, gratuitamente.
          </p>
          <Link
            to="/signup"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 36px',
              borderRadius: '100px',
              background: '#FFFFFF',
              color: '#000000',
              fontFamily: 'var(--font-display)',
              fontSize: '17px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            }}
          >
            Registrati Gratis
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p
            style={{
              color: 'rgba(255,255,255,0.25)',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
            }}
          >
            Nessuna carta di credito richiesta · Annulla quando vuoi
          </p>
        </motion.div>
      </section>

      {/* ── 10. FOOTER ──────────────────────────────────── */}
      <footer
        style={{
          background: '#000',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '64px 24px 40px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '48px',
              marginBottom: '56px',
            }}
          >
            {/* Brand column */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ marginBottom: '16px' }}>
                <Logo variant="light" size="md" />
              </div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Strumenti AI. Made in Italy.
              </p>
              <div
                style={{
                  marginTop: '16px',
                  color: 'rgba(255,255,255,0.25)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  lineHeight: 1.6,
                }}
              >
                <p style={{ margin: 0 }}>BCS Digital Solutions</p>
                <p style={{ margin: 0 }}>P.IVA IT00000000000</p>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                  margin: '0 0 20px',
                }}
              >
                Prodotti
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'UGC Ad Creator', href: 'https://ugcvideo.netlify.app' },
                  { name: 'AI Crisi', href: 'https://ai-crisi.vercel.app' },
                  { name: 'Trading Fiscale', href: 'https://app-trading-fiscale-v2.netlify.app/' },
                  { name: 'RavvedimentoFacile', href: 'https://adorable-bonbon-d1d407.netlify.app/' },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 20px',
                }}
              >
                Azienda
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Chi Siamo', 'Contatti'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 20px',
                }}
              >
                Legale
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Privacy Policy', 'Termini di Servizio', 'Cookie Policy'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <p
              style={{
                color: 'rgba(255,255,255,0.25)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                margin: 0,
              }}
            >
              © 2026 BCS AI. Tutti i diritti riservati.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  boxShadow: '0 0 6px #4ade80',
                }}
              />
              <span
                style={{
                  color: 'rgba(255,255,255,0.25)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                }}
              >
                Sistemi operativi · 🇮🇹
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
