'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { AppRecord } from '@/src/lib/catalog';

interface LandingComingSoonProps {
  apps: AppRecord[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function LandingComingSoon({ apps }: LandingComingSoonProps) {
  if (apps.length === 0) return null;

  return (
    <section style={{ padding: '60px 24px 100px', background: '#F5F5F7' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 100,
              background: 'rgba(55,19,236,0.06)',
              color: '#3713ec',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Roadmap
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#1a1a1a',
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            Prossimamente
          </h2>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {apps.map((app, i) => (
            <motion.article
              key={app.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              style={{
                padding: 28,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px dashed rgba(0,0,0,0.1)',
                cursor: 'default',
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${app.accent_color ?? '#3713ec'}12`,
                    border: `1px solid ${app.accent_color ?? '#3713ec'}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  {app.category === 'Automation' ? '🤖' : '✨'}
                </div>
                <div>
                  <strong
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    {app.name}
                  </strong>
                </div>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: '#6E6E73',
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                }}
              >
                {app.tagline}
              </p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '5px 14px',
                  borderRadius: 100,
                  background: `${app.accent_color ?? '#3713ec'}0A`,
                  color: app.accent_color ?? '#3713ec',
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${app.accent_color ?? '#3713ec'}15`,
                }}
              >
                Coming Soon
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
