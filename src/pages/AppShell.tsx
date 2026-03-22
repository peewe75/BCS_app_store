import React, { Suspense, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import registry, { externalRedirects } from '../apps/registry';

/* ─── Loading fallback ────────────────────────────────────────── */
const LoadingFallback: React.FC = () => (
  <div style={{
    minHeight: '80vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '16px',
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      border: '3px solid #3713ec', borderTopColor: 'transparent',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{
      fontSize: '14px', color: '#6E6E73', margin: 0,
      fontFamily: 'var(--font-body)',
    }}>
      Caricamento app...
    </p>
  </div>
);

/* ─── Not Found ───────────────────────────────────────────────── */
const NotFound: React.FC<{ appId: string }> = ({ appId }) => (
  <div style={{
    minHeight: '80vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '16px',
    fontFamily: 'var(--font-body)',
  }}>
    <div style={{
      width: '64px', height: '64px', borderRadius: '20px',
      background: '#F5F5F7', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '28px',
    }}>
      🔍
    </div>
    <h2 style={{
      fontSize: '22px', fontWeight: 800, color: '#1D1D1F',
      margin: 0, fontFamily: 'var(--font-display)',
    }}>
      App non trovata
    </h2>
    <p style={{ fontSize: '15px', color: '#6E6E73', margin: 0 }}>
      L'app "<strong>{appId}</strong>" non esiste o non e ancora stata integrata.
    </p>
  </div>
);

/* ─── AppShell Component ──────────────────────────────────────── */
const AppShell: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  // Handle external redirects
  useEffect(() => {
    if (appId && externalRedirects[appId]) {
      window.location.href = externalRedirects[appId];
    }
  }, [appId]);

  if (!appId) {
    navigate('/dashboard');
    return null;
  }

  // External redirect — show loading while redirecting
  if (externalRedirects[appId]) {
    return <LoadingFallback />;
  }

  // Check registry
  const entry = registry[appId];
  if (!entry) {
    return <NotFound appId={appId} />;
  }

  const AppComponent = entry.component;

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: '#F5F5F7' }}>
      <Suspense fallback={<LoadingFallback />}>
        <AppComponent />
      </Suspense>
    </div>
  );
};

export default AppShell;
