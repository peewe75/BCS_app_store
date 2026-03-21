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

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 } },
};

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
      variants={isTextLeft ? fadeLeft : fadeRight}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '24px',
      }}
    >
      {/* Category chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 14px',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            background: `${accentColor}18`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {category}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 14px',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            background: 'rgba(0,0,0,0.05)',
            color: '#6E6E73',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {pricingBadge}
        </span>
      </div>

      {/* App name */}
      <div>
        <h2
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            color: '#1D1D1F',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          {name}
        </h2>
        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 'clamp(18px, 2vw, 22px)',
            fontWeight: 400,
            color: '#6E6E73',
            lineHeight: 1.4,
            marginTop: '12px',
            margin: '12px 0 0',
          }}
        >
          {tagline}
        </p>
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: '16px',
          fontWeight: 400,
          color: '#6E6E73',
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {description}
      </p>

      {/* Features list */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {features.map((feature, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: '"Inter", sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              color: '#1D1D1F',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: `${accentColor}15`,
                flexShrink: 0,
                fontSize: '14px',
              }}
            >
              {feature.split(' ')[0]}
            </span>
            <span>{feature.replace(/^\S+\s/, '')}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{ paddingTop: '8px' }}>
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            borderRadius: '100px',
            background: accentColor,
            color: '#FFFFFF',
            fontFamily: '"Inter", sans-serif',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
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
      variants={isTextLeft ? fadeRight : fadeLeft}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <VideoPlaceholder
        videoSrc={videoSrc}
        posterSrc={posterSrc}
        accentColor={accentColor}
        title={`Demo ${name}`}
      />
    </motion.div>
  );

  return (
    <section
      id={id}
      style={{ background: bgColor, padding: '100px 0' }}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '64px',
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
