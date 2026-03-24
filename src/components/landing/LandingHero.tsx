'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SignedIn, SignedOut } from '@clerk/nextjs';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

// Mini app preview cards per il lato destro dell'hero
const previewApps = [
  { name: 'UGC Ad Creator', icon: 'UC', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', desc: 'Video AI in 60s' },
  { name: 'AI Crisi', icon: 'AI', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', desc: 'Procedure CCII' },
  { name: 'Trading Fiscale', icon: 'TF', color: '#10b981', bg: 'rgba(16,185,129,0.08)', desc: 'Report P&L' },
  { name: 'RavvedimentoFacile', icon: 'RF', color: '#3713ec', bg: 'rgba(55,19,236,0.08)', desc: 'Calcolo sanzioni' },
  { name: 'Forfettari AI', icon: 'FA', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', desc: 'Tasse forfettario' },
];

export default function LandingHero() {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 24px 72px',
        background: '#fafafa',
      }}
    >
      {/* Sottile gradiente di sfondo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 30% 40%, rgba(55,19,236,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 80% 60%, rgba(236,72,153,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1140,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
        className="bcs-hero-grid"
      >
        {/* === COLONNA SINISTRA: testo + CTA === */}
        <div>
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 100,
                background: 'rgba(55,19,236,0.08)',
                color: '#3713ec',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 24,
                border: '1px solid rgba(55,19,236,0.12)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <circle cx="6" cy="6" r="5" fill="#3713ec" opacity="0.2" />
                <circle cx="6" cy="6" r="3" fill="#3713ec" />
              </svg>
              Strumenti AI · Mercato italiano
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 60px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: '#1a1a1a',
              margin: '0 0 20px',
            }}
          >
            {"L'AI che lavora"}
            <br />
            <span style={{ color: '#3713ec' }}>per il tuo studio</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(16px, 1.8vw, 18px)',
              color: '#6E6E73',
              lineHeight: 1.7,
              maxWidth: 480,
              margin: '0 0 32px',
            }}
          >
            Strumenti AI verticali pensati per il mercato italiano: procedure legali,
            fiscalità, trading e contenuti video.{' '}
            <strong style={{ color: '#1a1a1a', fontWeight: 600 }}>Tutto in un unico accesso.</strong>
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}
          >
            {/* CTA primario: scorrere alla sezione prodotti */}
            <a
              href="#prodotti"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 100,
                background: '#3713ec',
                color: '#fff',
                textDecoration: 'none',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 4px 20px rgba(55,19,236,0.28)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(55,19,236,0.38)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(55,19,236,0.28)';
              }}
            >
              Scopri gli strumenti
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            {/* CTA secondario: sign-up per i non loggati, dashboard per i loggati */}
            <SignedOut>
              <Link
                href="/sign-up"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '14px 28px',
                  borderRadius: 100,
                  background: 'rgba(255,255,255,0.9)',
                  color: '#1D1D1F',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 15,
                  border: '1px solid rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Inizia gratis
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '14px 28px',
                  borderRadius: 100,
                  background: 'rgba(255,255,255,0.9)',
                  color: '#1D1D1F',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 15,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                Vai alla Dashboard
              </Link>
            </SignedIn>
          </motion.div>

          {/* Microcopy trust row */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            {[
              'Nessuna carta richiesta',
              'Dati in Europa · GDPR',
              'Powered by BCS Advisory',
            ].map((text) => (
              <span
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  color: '#6E6E73',
                  fontWeight: 500,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <path d="M2.5 6.5L5 9L10.5 4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {text}
              </span>
            ))}
          </motion.div>
        </div>

        {/* === COLONNA DESTRA: preview mini-grid delle app === */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          {previewApps.map((app, i) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '18px 16px',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                // Quinta card occupa tutta la larghezza
                gridColumn: i === 4 ? '1 / -1' : undefined,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: app.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  fontSize: 11,
                  fontWeight: 800,
                  color: app.color,
                  letterSpacing: '-0.02em',
                }}
              >
                {app.icon}
              </div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#1a1a1a',
                  margin: '0 0 3px',
                  letterSpacing: '-0.02em',
                }}
              >
                {app.name}
              </p>
              <p style={{ fontSize: 11, color: '#6E6E73', margin: 0, fontWeight: 400 }}>
                {app.desc}
              </p>
              <div
                style={{
                  marginTop: 10,
                  height: 3,
                  borderRadius: 99,
                  background: app.bg,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 99,
                    background: app.color,
                    width: i === 0 ? '75%' : i === 1 ? '60%' : i === 2 ? '85%' : i === 3 ? '50%' : '65%',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Responsive: stack verticale su mobile */}
      <style>{`
        @media (max-width: 860px) {
          .bcs-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
