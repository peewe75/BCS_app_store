'use client';

import React from 'react';
import { motion } from 'framer-motion';

const metrics = [
  { value: '500+', label: 'professionisti iscritti' },
  { value: '12.000+', label: 'report generati' },
  { value: '4.8/5', label: 'media recensioni' },
];

export default function SocialProofBar() {
  return (
    <section
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        padding: '28px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Sottile accento viola */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(55,19,236,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          maxWidth: 1140,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '64px',
          flexWrap: 'wrap',
        }}
      >
        {metrics.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: '#1a1a1a',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {item.value}
            </span>
            <span
              style={{
                fontSize: 14,
                color: '#6E6E73',
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
