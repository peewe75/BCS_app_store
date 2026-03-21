import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { text: '16px', spark: 14, gap: '6px' },
  md: { text: '20px', spark: 18, gap: '8px' },
  lg: { text: '26px', spark: 24, gap: '10px' },
};

const Logo: React.FC<LogoProps> = ({ variant = 'dark', size = 'md' }) => {
  const s = sizes[size];
  const textColor = variant === 'dark' ? '#1D1D1F' : '#FFFFFF';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap, userSelect: 'none' }}>
      {/* Neural spark SVG icon */}
      <svg
        width={s.spark}
        height={s.spark}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer glow circle */}
        <circle cx="12" cy="12" r="11" fill="url(#logoGradient)" opacity="0.15" />
        {/* Central node */}
        <circle cx="12" cy="12" r="2.5" fill="#3713ec" />
        {/* Neural connections - spark lines */}
        <line x1="12" y1="12" x2="12" y2="3" stroke="#3713ec" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="12" x2="20.2" y2="16.5" stroke="#3713ec" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="12" x2="3.8" y2="16.5" stroke="#3713ec" strokeWidth="1.5" strokeLinecap="round" />
        {/* Outer nodes */}
        <circle cx="12" cy="3" r="1.5" fill="#3713ec" />
        <circle cx="20.2" cy="16.5" r="1.5" fill="#3713ec" />
        <circle cx="3.8" cy="16.5" r="1.5" fill="#3713ec" />
        {/* Diagonal micro-connections */}
        <line x1="12" y1="3" x2="20.2" y2="16.5" stroke="#3713ec" strokeWidth="0.5" strokeLinecap="round" opacity="0.4" />
        <line x1="20.2" y1="16.5" x2="3.8" y2="16.5" stroke="#3713ec" strokeWidth="0.5" strokeLinecap="round" opacity="0.4" />
        <line x1="3.8" y1="16.5" x2="12" y2="3" stroke="#3713ec" strokeWidth="0.5" strokeLinecap="round" opacity="0.4" />
        <defs>
          <radialGradient id="logoGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3713ec" />
            <stop offset="100%" stopColor="#3713ec" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: s.text,
          fontWeight: 700,
          color: textColor,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        BCS{' '}
        <span style={{ color: '#3713ec' }}>AI</span>
      </span>
    </div>
  );
};

export default Logo;
