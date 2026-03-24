import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(0,0,0,0.06)',
        background: '#fff',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '40px 24px 32px',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr',
          gap: 40,
          flexWrap: 'wrap',
        }}
        className="bcs-footer-grid"
      >
        {/* Colonna 1: Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ margin: 0, color: '#1D1D1F', fontWeight: 700, fontSize: 15 }}>
            BCS AI Suite
          </p>
          <p style={{ margin: 0, color: '#6E6E73', fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
            Suite di strumenti AI verticali per professionisti italiani. Parte dell&apos;ecosistema BCS Advisory.
          </p>
          {/* GDPR notice */}
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 12,
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 1L1.5 3V6C1.5 8.5 3.5 10.8 6 11.5C8.5 10.8 10.5 8.5 10.5 6V3L6 1Z" stroke="#9ca3af" strokeWidth="1" strokeLinejoin="round" />
            </svg>
            Dati elaborati in Europa · Conforme al GDPR
          </p>
        </div>

        {/* Colonna 2: Partner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p
            style={{
              margin: 0,
              color: '#6E6E73',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Gruppo
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a
              href="https://bcs-ai.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1D1D1F', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
            >
              BCS Advisory
            </a>
            <a
              href="https://studiodigitale.eu"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1D1D1F', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
            >
              Studio Digitale
            </a>
            <span style={{ color: '#6E6E73', fontWeight: 600, fontSize: 14 }}>SBM</span>
          </div>
        </div>

        {/* Colonna 3: Link legali */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p
            style={{
              margin: 0,
              color: '#6E6E73',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Legale
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link
              href="/privacy"
              style={{ color: '#1D1D1F', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/termini"
              style={{ color: '#1D1D1F', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}
            >
              Termini di Servizio
            </Link>
            <a
              href="mailto:support@bcs-ai.com"
              style={{ color: '#6E6E73', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}
            >
              Supporto
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>
            BCS Advisory © 2026 · Tutti i diritti riservati
          </p>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>
            Powered by Google Gemini
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .bcs-footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </footer>
  );
}
