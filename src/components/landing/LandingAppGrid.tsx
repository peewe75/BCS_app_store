'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppRecord } from '@/src/lib/catalog';
import { getAppPublicRoute } from '@/src/lib/app-routes';

const APP_IMAGES: Record<string, string> = {
  ugc: '/images/1.png',
  'ai-crisi': '/images/2.png',
  trading: '/images/3.png',
  ravvedimento: '/images/4.png',
  forf: '/images/ForfApp.png',
  softi: '/images/Softi.png',
};

const CTA_COPY: Record<string, string> = {
  ugc: 'Genera il tuo primo video',
  'ai-crisi': 'Prova 14 giorni gratis',
  trading: 'Genera il tuo report',
  ravvedimento: 'Calcola adesso',
  forf: 'Calcola le tue tasse',
};

// Mappa audience per tab filter
const AUDIENCE_MAP: Record<string, string[]> = {
  'ai-crisi':    ['professionisti'],
  ravvedimento:  ['professionisti'],
  softi:         ['professionisti', 'trader'],
  trading:       ['trader'],
  forf:          ['creator'],
  ugc:           ['creator'],
};

const TABS = [
  { id: 'tutti',          label: 'Tutti' },
  { id: 'professionisti', label: 'Professionisti' },
  { id: 'trader',         label: 'Trader' },
  { id: 'creator',        label: 'Creator & Freelancer' },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface LandingAppGridProps {
  apps: AppRecord[];
}

export default function LandingAppGrid({ apps }: LandingAppGridProps) {
  const [activeTab, setActiveTab] = useState('tutti');

  const activeApps = apps.filter((app) => !app.is_coming_soon);

  const visibleApps = activeTab === 'tutti'
    ? activeApps
    : activeApps.filter((app) => (AUDIENCE_MAP[app.id] ?? []).includes(activeTab));

  return (
    <section
      id="prodotti"
      style={{
        padding: '80px 24px',
        background: '#f5f5f7',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial gradient per profondita */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(55,19,236,0.03) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Intestazione sezione */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 100,
              background: 'rgba(55,19,236,0.08)',
              color: '#3713ec',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
              border: '1px solid rgba(55,19,236,0.12)',
            }}
          >
            Il catalogo
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              color: '#1a1a1a',
              margin: '0 0 12px',
              letterSpacing: '-0.03em',
            }}
          >
            Strumenti AI. Una sola piattaforma.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: '#6E6E73',
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Ogni strumento è pensato per un caso d&apos;uso specifico del mercato professionale italiano.
            Il catalogo cresce.
          </p>
        </motion.div>

        {/* Tab filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 40,
            flexWrap: 'wrap',
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '9px 20px',
                  borderRadius: 100,
                  border: isActive ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  background: isActive ? '#3713ec' : 'rgba(255,255,255,0.8)',
                  color: isActive ? '#fff' : '#6E6E73',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.01em',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 16px rgba(55,19,236,0.25)' : 'none',
                  backdropFilter: isActive ? 'none' : 'blur(8px)',
                  WebkitBackdropFilter: isActive ? 'none' : 'blur(8px)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Bento grid con AnimatePresence per il cambio tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              minHeight: 200,
            }}
            className="bcs-app-bento"
          >
            {visibleApps.map((app) => {
              const accentColor = app.accent_color ?? '#3713ec';
              const ctaText = CTA_COPY[app.id] ?? `Scopri ${app.name}`;
              const href = getAppPublicRoute(app);
              const imageSrc = APP_IMAGES[app.id];

              return (
                <motion.div
                  key={app.id}
                  variants={fadeUp}
                  whileHover={{ y: -5, boxShadow: `0 24px 56px ${accentColor}22` }}
                  layout
                  style={{
                    background: '#ffffff',
                    borderRadius: 24,
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Contenuto testo con padding */}
                  <div style={{ padding: '24px 24px 20px' }}>
                    {/* Header card: icona + badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: app.bg_gradient || `${accentColor}12`,
                          color: accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: '-0.01em',
                          flexShrink: 0,
                        }}
                      >
                        {app.name.slice(0, 2).toUpperCase()}
                      </div>
                      {app.pricing_badge && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 100,
                            background: `${accentColor}12`,
                            color: accentColor,
                            border: `1px solid ${accentColor}20`,
                          }}
                        >
                          {app.pricing_badge}
                        </span>
                      )}
                    </div>

                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: '#1a1a1a',
                        margin: '0 0 6px',
                        letterSpacing: '-0.02em',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {app.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#6E6E73',
                        margin: '0 0 16px',
                        lineHeight: 1.55,
                      }}
                    >
                      {app.tagline || app.description}
                    </p>

                    <Link
                      href={href}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '9px 16px',
                        borderRadius: 100,
                        background: accentColor,
                        color: '#fff',
                        textDecoration: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                      {ctaText}
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                        <path d="M2 5.5H9M9 5.5L6.5 3M9 5.5L6.5 8" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>

                  {/* Immagine con effetto glass fade */}
                  {imageSrc && (
                    <div
                      style={{
                        position: 'relative',
                        height: 160,
                        overflow: 'hidden',
                        marginTop: 'auto',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt={app.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center top',
                          display: 'block',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0) 100%)',
                          pointerEvents: 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 40,
                          background: `linear-gradient(to top, ${accentColor}18, transparent)`,
                          backdropFilter: 'blur(6px)',
                          WebkitBackdropFilter: 'blur(6px)',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Messaggio tab vuoto (se nessuna app nel filtro) */}
        {visibleApps.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 48 }}>
            Nuovi strumenti in arrivo per questa categoria.
          </p>
        )}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 860px) {
          .bcs-app-bento { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .bcs-app-bento { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
