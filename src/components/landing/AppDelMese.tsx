'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { AppRecord } from '@/src/lib/catalog';
import { getAppPublicRoute } from '@/src/lib/app-routes';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

interface AppDelMeseProps {
  app: AppRecord;
}

export default function AppDelMese({ app }: AppDelMeseProps) {
  const accent = app.accent_color ?? '#10b981';
  const href = getAppPublicRoute(app);

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 24px',
        background: '#fafbfc',
      }}
    >
      {/* Radial glow sottile */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 80% 70% at 20% 50%, ${accent}14 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 85% 40%, ${accent}0d 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1140,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
        className="bcs-app-month-grid"
      >
        {/* === COLONNA SINISTRA: copy === */}
        <div>
          {/* Badge "App del Mese" */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 16px',
                borderRadius: 100,
                background: accent,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="currentColor" />
              </svg>
              App del Mese
            </span>
          </motion.div>

          {/* Pill categoria */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span
              style={{
                display: 'inline-block',
                padding: '5px 12px',
                borderRadius: 100,
                background: `${accent}12`,
                color: accent,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${accent}20`,
                marginBottom: 16,
              }}
            >
              {app.category}
            </span>
          </motion.div>

          {/* Titolo */}
          <motion.h2
            custom={2}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#1a1a1a',
              margin: '0 0 14px',
            }}
          >
            {app.name}
          </motion.h2>

          {/* Tagline */}
          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 17,
              color: '#6E6E73',
              lineHeight: 1.7,
              margin: '0 0 28px',
              maxWidth: 460,
            }}
          >
            {app.tagline}
          </motion.p>

          {/* Features */}
          <motion.ul
            custom={4}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {app.features.slice(0, 4).map((feat) => (
              <li
                key={feat}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  lineHeight: 1.5,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                  style={{ flexShrink: 0, marginTop: 2 }}
                >
                  <circle cx="9" cy="9" r="9" fill={`${accent}18`} />
                  <path d="M5.5 9L8 11.5L12.5 7" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {feat}
              </li>
            ))}
          </motion.ul>

          {/* CTA + Prezzo */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            <Link
              href={href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 100,
                background: accent,
                color: '#fff',
                textDecoration: 'none',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: `0 4px 20px ${accent}48`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 28px ${accent}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 20px ${accent}48`;
              }}
            >
              {app.cta_text ?? 'Scopri'}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            {app.price_label && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#6E6E73',
                }}
              >
                {app.price_label}
              </span>
            )}
          </motion.div>
        </div>

        {/* === COLONNA DESTRA: media card === */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${accent}20`,
            borderRadius: 24,
            padding: 16,
            boxShadow: `0 8px 40px ${accent}12`,
          }}
        >
          {/* Video / immagine */}
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              aspectRatio: '16 / 10',
              background: '#f5f5f7',
            }}
          >
            {app.video_src ? (
              <video
                src={app.video_src}
                poster={app.poster_src ?? undefined}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : app.poster_src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={app.poster_src}
                alt={app.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : null}

            {/* Glass strip in basso */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 48,
                background: `linear-gradient(to top, ${accent}20, transparent)`,
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Info strip sotto il video */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 8px 4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${accent}14`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: accent,
                }}
              >
                {app.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: '-0.02em' }}>
                  {app.name}
                </p>
                <p style={{ fontSize: 12, color: '#6E6E73', margin: 0 }}>
                  {app.badge}
                </p>
              </div>
            </div>

            {app.pricing_badge && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: 100,
                  background: `${accent}12`,
                  color: accent,
                  border: `1px solid ${accent}20`,
                }}
              >
                {app.pricing_badge}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 860px) {
          .bcs-app-month-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 560px) {
          .bcs-app-month-grid {
            padding: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
