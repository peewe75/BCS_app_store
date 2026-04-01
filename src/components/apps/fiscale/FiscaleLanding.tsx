'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const tools = [
  {
    id: 'trading',
    name: 'Dichiarazione Trading',
    tagline: 'Report fiscale per trading forex e MetaTrader',
    description: 'Carica il report HTML del tuo broker MetaTrader 4/5 e ottieni un riepilogo fiscale professionale con PDF e facsimili RW/RT.',
    color: '#10b981',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    icon: 'TF',
    features: [
      'Import HTML MetaTrader 4/5',
      'Scelta anno fiscale e tipo conto',
      'PDF riepilogativo professionale',
      'Facsimili quadri RW/RT',
      'Storico report nel workspace',
    ],
    pricing: [
      { name: 'Base', price: '€ 9,90', desc: '1 report per anno fiscale' },
      { name: 'Standard', price: '€ 19,90', desc: 'Fino a 3 report per anno' },
      { name: 'Pro', price: '€ 34,90', desc: 'Report illimitati + storico' },
    ],
    workspaceHref: '/workspace/trading',
    videoSrc: '/video/trading_fiscale.mp4',
    posterSrc: '/images/3.png',
  },
  {
    id: 'crypto',
    name: 'Crypto Fiscale',
    tagline: 'Dichiarazione crypto automatica per trader italiani',
    description: 'Carica i report HTML dei tuoi exchange (Binance, Bybit) e ottieni i quadri RW/RT compilati con calcolo LIFO e normativa 2025/2026.',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    icon: 'CF',
    features: [
      'Supporto Binance, Bybit e altri',
      'Calcolo LIFO automatico',
      'Quadri RW e RT compilati',
      'Normativa 2025/2026 aggiornata',
      'Export PDF e XLSX',
    ],
    pricing: [
      { name: 'Free', price: 'Gratis', desc: 'Fino a 50 transazioni' },
      { name: 'Base', price: '€ 14,90', desc: 'Fino a 500 transazioni' },
      { name: 'Pro', price: '€ 39,90', desc: 'Transazioni illimitate' },
    ],
    workspaceHref: '/workspace/crypto-fiscale',
    videoSrc: null,
    posterSrc: null,
  },
];

const sharedFeatures = [
  {
    icon: '🔐',
    title: 'Accesso unificato',
    desc: 'Un solo account Clerk per entrambi gli strumenti. Dashboard condivisa e gestione piani centralizzata.',
  },
  {
    icon: '📊',
    title: 'Report professionali',
    desc: 'Output pronti per la dichiarazione dei redditi: PDF riepilogativi, facsimili RW/RT e storico completo.',
  },
  {
    icon: '🇮🇹',
    title: 'Normativa italiana',
    desc: 'Aggiornati alle ultime disposizioni fiscali italiane. Calcolo plusvalenze, imposta sostitutiva e monitoraggio.',
  },
  {
    icon: '💾',
    title: 'Dati sicuri su Supabase',
    desc: 'Architettura GDPR-compliant con dati crittografati e backup automatici su server europei.',
  },
];

const faqs = [
  {
    q: 'Posso usare entrambi gli strumenti con un solo account?',
    a: 'Sì. Registrazione unica con Clerk, dashboard condivisa e piani attivabili separatamente per ogni strumento.',
  },
  {
    q: 'I dati dei miei broker/exchange sono al sicuro?',
    a: 'Assolutamente. I dati vengono elaborati in modo sicuro su Supabase con crittografia e non vengono condivisi con terze parti.',
  },
  {
    q: 'I quadri RW/RT sono pronti per la dichiarazione?',
    a: 'I facsimili generati sono conformi ai modelli ufficiali dell\'Agenzia delle Entrate. Ti consigliamo comunque di farli verificare dal tuo commercialista.',
  },
  {
    q: 'Posso cambiare piano in qualsiasi momento?',
    a: 'Sì. Puoi effettuare l\'upgrade o il downgrade direttamente dalla dashboard BCS AI Suite.',
  },
];

export default function FiscaleLanding() {
  const [activeTool, setActiveTool] = useState<'trading' | 'crypto'>('trading');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const currentTool = tools.find((t) => t.id === activeTool)!;

  return (
    <main style={{ background: '#fbfbfd' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #fffbeb 50%, #fef3c7 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 24px 80px' }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 16px', borderRadius: 999, background: 'rgba(55,19,236,0.08)', color: '#3713ec', border: '1px solid rgba(55,19,236,0.15)', fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
              Strumenti Fiscali AI
            </span>
            <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.04em', color: '#1a1a1a' }}>
              Trading e Crypto.<br />
              <span style={{ color: '#3713ec' }}>Una sola piattaforma fiscale.</span>
            </h1>
            <p style={{ margin: 0, fontSize: 18, color: '#4b5563', lineHeight: 1.7 }}>
              Dal report del broker ai quadri fiscali compilati. Due strumenti specializzati, un unico ecosistema BCS AI Suite.
            </p>
          </motion.div>

          {/* Tool selector tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as 'trading' | 'crypto')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 24px',
                  borderRadius: 100,
                  background: activeTool === tool.id ? tool.color : '#fff',
                  color: activeTool === tool.id ? '#fff' : '#6b7280',
                  border: activeTool === tool.id ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: activeTool === tool.id ? `0 8px 24px ${tool.color}33` : 'none',
                }}
              >
                <span style={{ width: 32, height: 32, borderRadius: 8, background: activeTool === tool.id ? 'rgba(255,255,255,0.2)' : `${tool.color}12`, color: activeTool === tool.id ? '#fff' : tool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                  {tool.icon}
                </span>
                {tool.name}
              </button>
            ))}
          </div>

          {/* Active tool hero content */}
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: 1140, margin: '0 auto' }}
            className="bcs-app-hero-grid"
          >
            {/* Left: text + CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <p style={{ margin: '0 0 8px', color: currentTool.color, fontWeight: 700, fontSize: 14 }}>
                  {currentTool.tagline}
                </p>
                <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 3.5vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                  {currentTool.name}
                </h2>
                <p style={{ margin: 0, color: '#4b5563', fontSize: 16, lineHeight: 1.7 }}>
                  {currentTool.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link
                  href={currentTool.workspaceHref}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 28px',
                    borderRadius: 100,
                    background: currentTool.color,
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: `0 8px 24px ${currentTool.color}33`,
                  }}
                >
                  Apri il workspace
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="#funzionalita"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '14px 28px',
                    borderRadius: 100,
                    background: '#fff',
                    color: '#1a1a1a',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 15,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  Scopri di piu
                </Link>
              </div>

              {/* Features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentTool.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="8" fill={`${currentTool.color}18`} />
                      <path d="M5.5 9L7.5 11L12.5 6" stroke={currentTool.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: video/poster placeholder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: '100%', padding: 16, borderRadius: 24, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 24px 60px rgba(15,23,42,0.12)' }}>
                <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: 16, background: currentTool.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                  <span style={{ width: 56, height: 56, borderRadius: 14, background: `${currentTool.color}18`, color: currentTool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
                    {currentTool.icon}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>
                    {currentTool.name}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shared features */}
      <section id="funzionalita" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Perche scegliere gli strumenti fiscali BCS AI
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 16, maxWidth: 560, marginInline: 'auto' }}>
              Un ecosistema unificato per la dichiarazione fiscale di trading e crypto.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {sharedFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{ padding: 28, borderRadius: 20, background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)' }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{feature.icon}</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>{feature.title}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing comparison */}
      <section style={{ padding: '80px 24px', background: '#f5f5f7' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Piani e prezzi
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 16 }}>
              Scegli lo strumento e il piano adatto alle tue esigenze.
            </p>
          </motion.div>

          {/* Tool toggle for pricing */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as 'trading' | 'crypto')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 100,
                  background: activeTool === tool.id ? tool.color : '#fff',
                  color: activeTool === tool.id ? '#fff' : '#6b7280',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {tool.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {currentTool.pricing.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  padding: 32,
                  borderRadius: 24,
                  background: '#fff',
                  border: i === currentTool.pricing.length - 1 ? `2px solid ${currentTool.color}` : '1px solid rgba(0,0,0,0.08)',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {i === currentTool.pricing.length - 1 && (
                  <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', padding: '4px 12px', borderRadius: 100, background: currentTool.color, color: '#fff', fontSize: 11, fontWeight: 700 }}>
                    Popolare
                  </span>
                )}
                <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#6b7280' }}>{plan.name}</p>
                <p style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800, color: currentTool.color }}>{plan.price}</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>{plan.desc}</p>
                <Link
                  href={currentTool.workspaceHref}
                  style={{
                    display: 'inline-flex',
                    padding: '12px 24px',
                    borderRadius: 100,
                    background: i === currentTool.pricing.length - 1 ? currentTool.color : '#f3f4f6',
                    color: i === currentTool.pricing.length - 1 ? '#fff' : '#374151',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {plan.name === 'Free' ? 'Inizia gratis' : 'Scegli piano'}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Domande frequenti
            </h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{ padding: 24, borderRadius: 16, background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{faq.q}</span>
                  <span style={{ fontSize: 20, color: '#6b7280', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && (
                  <p style={{ margin: '12px 0 0', fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section style={{ padding: '80px 24px', background: '#0f172a' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.1, color: '#fff', letterSpacing: '-0.03em' }}>
            Pronto a semplificare la tua dichiarazione?
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: 16, color: '#94a3b8', lineHeight: 1.7 }}>
            Registrati gratuitamente e accedi a entrambi gli strumenti fiscali dalla dashboard unificata.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/sign-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 32px',
                borderRadius: 100,
                background: '#3713ec',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 16,
                boxShadow: '0 4px 24px rgba(55,19,236,0.4)',
              }}
            >
              Registrati gratis
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '16px 32px',
                borderRadius: 100,
                background: 'transparent',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 16,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              Vai alla dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
