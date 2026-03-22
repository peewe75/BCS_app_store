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
          padding: '28px 24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <p style={{ margin: 0, color: '#6E6E73' }}>Ultrabot Space su Vercel, Clerk, Supabase e Stripe.</p>
        <p style={{ margin: 0, color: '#6E6E73' }}>AI Crisi resta esterna in questa fase.</p>
      </div>
    </footer>
  );
}
