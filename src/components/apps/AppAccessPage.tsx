'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public';
import { getPublicAppById, type AppRecord, type UserAppGrant } from '@/src/lib/catalog';
import ForfApp from '@/src/features/ForfApp';
import RavvedimentoApp from '@/src/features/RavvedimentoApp';
import TradingWorkspace from '@/src/components/apps/TradingWorkspace';
import UgcWorkspace from '@/src/components/apps/UgcWorkspace';

const INTERNAL_COMPONENTS: Record<string, React.ComponentType> = {
  forf: ForfApp,
  ravvedimento: RavvedimentoApp,
  trading: TradingWorkspace,
  ugc: UgcWorkspace,
};

function isFreeApp(app: AppRecord) {
  return app.pricing_model === 'free' || app.id === 'forf';
}

export default function AppAccessPage({ slug }: { slug: string }) {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const [app, setApp] = useState<AppRecord | null>(null);
  const [grant, setGrant] = useState<UserAppGrant | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [autoCheckoutStarted, setAutoCheckoutStarted] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const appRow = await getPublicAppById(slug);
      if (!appRow) {
        setApp(null);
        setLoading(false);
        return;
      }

      if (cancelled) {
        return;
      }

      setApp(appRow);

      if (!isSignedIn || !user?.id) {
        setGrant(null);
        setLoading(false);
        return;
      }

      const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase;
      if (!client) {
        setLoading(false);
        return;
      }

      const { data } = await client
        .from('user_apps')
        .select('app_id, plan, expires_at')
        .eq('user_id', user.id)
        .eq('app_id', slug)
        .maybeSingle();

      if (!cancelled) {
        setGrant((data as UserAppGrant | null) ?? null);
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn, slug, user?.id]);

  const isAdmin = (user?.publicMetadata?.role as string | undefined) === 'admin';
  const hasAccess = useMemo(() => {
    if (!app) return false;
    if (isAdmin) return true;
    if (app.is_coming_soon) return true;
    if (isFreeApp(app)) return true;
    return Boolean(grant);
  }, [app, grant, isAdmin]);

  const handleCheckout = async () => {
    if (!app || checkoutLoading) {
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        appId: app.id,
        planCode: 'default',
      }),
    });
    const rawText = await response.text();
    setCheckoutLoading(false);

    let payload: { url?: string; error?: string } | null = null;
    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch {
      payload = null;
    }

    if (response.ok && payload?.url) {
      window.location.href = payload.url;
      return;
    }

    setCheckoutError(payload?.error ?? 'Checkout Stripe non disponibile in questo momento.');
  };

  useEffect(() => {
    const shouldAutoCheckout =
      searchParams.get('checkout') === '1' &&
      isSignedIn &&
      !!app &&
      !app.is_coming_soon &&
      !isFreeApp(app) &&
      !hasAccess &&
      !loading &&
      !checkoutLoading &&
      !autoCheckoutStarted;

    if (!shouldAutoCheckout) {
      return;
    }

    setAutoCheckoutStarted(true);
    void handleCheckout();
  }, [app, autoCheckoutStarted, checkoutLoading, hasAccess, isSignedIn, loading, searchParams]);

  if (!isLoaded || loading) {
    return <div style={{ padding: '120px 24px', textAlign: 'center' }}>Caricamento modulo...</div>;
  }

  if (!isSignedIn) {
    return (
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>Serve il login</h1>
        <p style={{ color: '#6E6E73' }}>L&apos;accesso alle app interne passa dal progetto Clerk unificato.</p>
        <Link href="/sign-in" style={{ display: 'inline-block', marginTop: 20, padding: '12px 20px', borderRadius: 999, background: '#3713ec', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
          Vai al login
        </Link>
      </div>
    );
  }

  if (!app) {
    return <div style={{ padding: '120px 24px', textAlign: 'center' }}>App non trovata.</div>;
  }

  if (app.is_coming_soon) {
    return (
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>{app.name}</h1>
        <p style={{ color: '#6E6E73' }}>Questo modulo e presente nel catalogo unificato ma non e ancora attivo.</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '120px 24px' }}>
        <div style={{ padding: 32, borderRadius: 28, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p style={{ margin: '0 0 8px', color: app.accent_color ?? '#3713ec', fontWeight: 700 }}>{app.name}</p>
          <h1 style={{ marginTop: 0 }}>Accesso non ancora sbloccato</h1>
          <p style={{ color: '#6E6E73', lineHeight: 1.7 }}>
            La pagina e gia interna a Ultrabot Space, ma l&apos;entitlement arriva da `user_apps`. Se Stripe e configurato sul progetto Vercel puoi completare il checkout qui.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{
                border: 'none',
                borderRadius: 999,
                background: app.accent_color ?? '#3713ec',
                color: '#fff',
                padding: '12px 20px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {checkoutLoading ? 'Apro Stripe...' : 'Sblocca con Stripe'}
            </button>
            <Link href="/dashboard" style={{ padding: '12px 20px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.08)', textDecoration: 'none', color: '#1D1D1F', fontWeight: 700 }}>
              Torna alla dashboard
            </Link>
          </div>
          {checkoutError ? (
            <p style={{ margin: '16px 0 0', color: '#b42318', fontWeight: 600 }}>
              {checkoutError}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const Component = INTERNAL_COMPONENTS[slug];
  if (!Component) {
    return (
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>{app.name}</h1>
        <p style={{ color: '#6E6E73' }}>Il catalogo e pronto, ma il modulo React non e ancora stato collegato in questo repo.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 24px 80px' }}>
      <Component />
    </div>
  );
}
