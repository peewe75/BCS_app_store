'use client';

import React from 'react';
import { motion } from 'framer-motion';
import VideoPlaceholder from './VideoPlaceholder';

export interface ProductSectionProps {
  id: string;
  category: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  accentColor: string;
  pricingBadge: string;
  ctaText: string;
  ctaHref: string;
  videoSrc?: string;
  posterSrc?: string;
  layout: 'text-left' | 'text-right';
  bgColor: string;
}

const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
};

const slideIn = (direction: 'left' | 'right') => ({
  hidden: { opacity: 0, x: direction === 'left' ? -40 : 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: easeOut, delay: 0.15 },
  },
});

const ProductSection: React.FC<ProductSectionProps> = ({
  id,
  category,
  name,
  tagline,
  description,
  features,
  accentColor,
  pricingBadge,
  ctaText,
  ctaHref,
  videoSrc,
  posterSrc,
  layout,
  bgColor,
}) => {
  const isTextLeft = layout === 'text-left';

  const textContent = (
    <motion.div
      variants={slideIn(isTextLeft ? 'left' : 'right')}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '28px',
      }}
    >
      {/* Category + Pricing chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.02em',
            background: `${accentColor}12`,
            color: accentColor,
            border: `1px solid ${accentColor}20`,
          }}
        >
          {category}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.01em',
            background: 'rgba(0,0,0,0.03)',
            color: '#888',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {pricingBadge}
        </span>
      </div>

      {/* App name + tagline */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.5vw, 48px)',
            fontWeight: 800,
            color: '#1a1a1a',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            margin: 0,
          }}
        >
          {name}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(16px, 1.8vw, 20px)',
            fontWeight: 400,
            color: '#777',
            lineHeight: 1.4,
            margin: '10px 0 0',
            letterSpacing: '-0.01em',
          }}
        >
          {tagline}
        </p>
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          fontWeight: 400,
          color: '#666',
          lineHeight: 1.75,
          margin: 0,
        }}
      >
        {description}
      </p>

      {/* Features */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {features.map((feature, i) => {
          const emoji = feature.split(' ')[0];
          const text = feature.replace(/^\S+\s/, '');
          return (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontFamily: 'var(--font-body)',
                fontSize: '14.5px',
                fontWeight: 500,
                color: '#333',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: `${accentColor}0A`,
                  border: `1px solid ${accentColor}15`,
                  flexShrink: 0,
                  fontSize: '15px',
                }}
              >
                {emoji}
              </span>
              <span>{text}</span>
            </li>
          );
        })}
      </ul>

      {/* CTA */}
      <div style={{ paddingTop: '4px' }}>
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="bcs-cta-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 30px',
            borderRadius: '100px',
            background: accentColor,
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            boxShadow: `0 2px 16px ${accentColor}30`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.transform = 'translateY(-2px)';
            (e.currentTarget).style.boxShadow = `0 6px 24px ${accentColor}40`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.transform = 'translateY(0)';
            (e.currentTarget).style.boxShadow = `0 2px 16px ${accentColor}30`;
          }}
        >
          {ctaText}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </motion.div>
  );

  const videoContent = (
    <motion.div
      variants={slideIn(isTextLeft ? 'right' : 'left')}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <div className="bcs-video-frame" style={{ width: '100%' }}>
        <VideoPlaceholder
          videoSrc={videoSrc}
          posterSrc={posterSrc}
          accentColor={accentColor}
          title={`Demo ${name}`}
        />
      </div>
    </motion.div>
  );

  return (
    <section
      id={id}
      style={{ background: bgColor, padding: '80px 0' }}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        className="bcs-product-grid"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gap: '56px',
          alignItems: 'center',
        }}
      >
        {isTextLeft ? (
          <>
            {textContent}
            {videoContent}
          </>
        ) : (
          <>
            {videoContent}
            {textContent}
          </>
        )}
      </motion.div>
    </section>
  );
};

export default ProductSection;
