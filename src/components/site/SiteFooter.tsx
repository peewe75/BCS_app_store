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
          padding: '32px 24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, color: '#1D1D1F', fontWeight: 700 }}>Powered by BCS Advisory</p>
          <p style={{ margin: 0, color: '#6E6E73', maxWidth: 420 }}>
            La suite BCS AI fa parte dello stesso ecosistema societario e professionale di BCS Advisory.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p
            style={{
              margin: 0,
              color: '#6E6E73',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Partner
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a
              href="https://bcs-ai.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1D1D1F', textDecoration: 'none', fontWeight: 600 }}
            >
              BCS Advisory
            </a>
            <a
              href="https://studiodigitale.eu"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1D1D1F', textDecoration: 'none', fontWeight: 600 }}
            >
              Studio Legale BCS
            </a>
            <span style={{ color: '#6E6E73', fontWeight: 600 }}>SBM</span>
          </div>
          <p style={{ margin: 0, color: '#6E6E73', fontSize: 13 }}>BCS Advisory © 2026</p>
        </div>
      </div>
    </footer>
  );
}
