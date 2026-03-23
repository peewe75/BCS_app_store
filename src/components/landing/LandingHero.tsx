'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const blobAnimation = {
  x: [0, 30, -20, 0],
  y: [0, -20, 15, 0],
  scale: [1, 1.08, 0.95, 1],
  transition: { duration: 18, repeat: Infinity, ease: 'easeInOut' as const },
};

const blobAnimation2 = {
  x: [0, -25, 20, 0],
  y: [0, 15, -25, 0],
  scale: [1, 0.92, 1.06, 1],
  transition: { duration: 22, repeat: Infinity, ease: 'easeInOut' as const },
};

export default function LandingHero() {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 24px 80px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
      }}
    >
      {/* Animated gradient blobs */}
      <motion.div
        animate={blobAnimation}
        style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(55,19,236,0.15) 0%, rgba(55,19,236,0.02) 70%, transparent 100%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={blobAnimation2}
        style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.01) 70%, transparent 100%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <span
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: 100,
              background: 'rgba(55,19,236,0.08)',
              color: '#3713ec',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 24,
              border: '1px solid rgba(55,19,236,0.12)',
            }}
          >
            BCS AI Suite
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 7vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            color: '#1a1a1a',
            margin: '0 0 20px',
          }}
        >
          La Prima Suite AI
          <br />
          <span style={{ color: '#3713ec' }}>per Business & Creator</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#6E6E73',
            lineHeight: 1.65,
            maxWidth: 620,
            margin: '0 auto 36px',
          }}
        >
          Un ecosistema completo potenziato da Google Gemini.
          Genera <strong style={{ color: '#1a1a1a' }}>Video UGC</strong> per TikTok,
          calcola le <strong style={{ color: '#1a1a1a' }}>Tasse</strong> e gestisci il{' '}
          <strong style={{ color: '#1a1a1a' }}>Ravvedimento Operoso</strong> in pochi click.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
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
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 4px 24px rgba(55,19,236,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(55,19,236,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(55,19,236,0.3)';
            }}
          >
            Inizia Gratuitamente
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '16px 32px',
              borderRadius: 100,
              background: 'rgba(255,255,255,0.9)',
              color: '#1D1D1F',
              textDecoration: 'none',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 16,
              border: '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(10px)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
            }}
          >
            Vai alla Dashboard
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
