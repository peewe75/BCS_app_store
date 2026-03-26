'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public';
import { getPublicAppById, APP_PLAN_CONFIG, type AppRecord, type UserAppGrant } from '@/src/lib/catalog';
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
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);

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
        const rawGrant = (data as UserAppGrant | null) ?? null;
        const isExpired = rawGrant?.expires_at ? new Date(rawGrant.expires_at) < new Date() : false;
        setGrant(isExpired ? null : rawGrant);
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

  const handleRedeem = async () => {
    if (!redeemCode.trim() || redeemLoading) return;
    setRedeemLoading(true);
    setRedeemError(null);
    const res = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: redeemCode.trim().toUpperCase() }),
    });
    const json = await res.json() as { app_id?: string; plan?: string; expires_at?: string | null; error?: string };
    setRedeemLoading(false);
    if (res.ok) {
      setRedeemSuccess(true);
      setGrant({ app_id: json.app_id ?? '', plan: json.plan ?? null, expires_at: json.expires_at ?? null });
    } else {
      setRedeemError(json.error ?? 'Codice non valido.');
    }
  };

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
    const accentColor = app.accent_color ?? '#3713ec';
    // Check if this app has a paid Stripe plan configured (non-free plans)
    const appConfig = APP_PLAN_CONFIG[app.id];
    const hasPaidPlan = appConfig?.plans?.some((p) => p.code !== 'free') ?? false;
    const planCfgForTrial = appConfig?.plans?.find((p) => p.code !== 'free');
    const trialDays = planCfgForTrial?.trial_days;
    return (
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '120px 24px' }}>
        <div style={{ padding: 32, borderRadius: 28, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{
            display: 'inline-block',
            marginBottom: 16,
            padding: '6px 14px',
            borderRadius: 100,
            background: `${accentColor}15`,
            color: accentColor,
            fontWeight: 700,
            fontSize: 12,
          }}>
            {app.name}
          </div>
          <h1 style={{ marginTop: 0, fontSize: 28, letterSpacing: '-0.02em' }}>Accesso non attivo</h1>
          <p style={{ color: '#6E6E73', lineHeight: 1.7, maxWidth: 480 }}>
            {hasPaidPlan
              ? 'Questo strumento richiede un abbonamento attivo. Acquista direttamente o contatta l\'amministratore.'
              : 'Questo strumento richiede un accesso attivo. Contatta l\'amministratore per riceverlo.'}
          </p>
          {!hasPaidPlan && (
            <div style={{
              marginTop: 24,
              padding: '16px 20px',
              borderRadius: 16,
              background: `${accentColor}08`,
              border: `1px solid ${accentColor}20`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>✉️</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1D1D1F' }}>Richiedi accesso</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6E6E73' }}>
                  L&apos;admin può attivare il tuo piano direttamente dal pannello di gestione.
                </p>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            {hasPaidPlan && (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  background: accentColor,
                  color: '#fff',
                  padding: '12px 20px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: checkoutLoading ? 'default' : 'pointer',
                  opacity: checkoutLoading ? 0.7 : 1,
                }}
              >
                {checkoutLoading
                  ? 'Apro Stripe…'
                  : trialDays
                    ? `${trialDays} giorni gratis, poi ${app.price_label ?? 'Abbonati'}`
                    : `Abbonati — ${app.price_label ?? app.pricing_badge ?? 'Acquista'}`}
              </button>
            )}
            <Link href="/dashboard" style={{
              padding: '12px 20px',
              borderRadius: 999,
              border: '1px solid rgba(0,0,0,0.08)',
              textDecoration: 'none',
              color: '#1D1D1F',
              fontWeight: 700,
              fontSize: 14,
            }}>
              Torna alla dashboard
            </Link>
          </div>
          {checkoutError ? (
            <p style={{ margin: '16px 0 0', color: '#b42318', fontWeight: 600 }}>{checkoutError}</p>
          ) : null}

          {/* Redeem code box */}
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => setRedeemOpen((o) => !o)}
              style={{ background: 'none', border: 'none', color: '#6E6E73', fontSize: 13, cursor: 'pointer', padding: 0 }}
            >
              {redeemOpen ? '▲' : '▼'} Hai un codice di accesso?
            </button>
            {redeemOpen && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <input
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="CODICE"
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.12)', fontSize: 13,
                    fontFamily: 'monospace', letterSpacing: '0.05em',
                  }}
                />
                <button
                  onClick={() => void handleRedeem()}
                  disabled={redeemLoading}
                  style={{
                    padding: '10px 18px', borderRadius: 10,
                    background: accentColor, color: '#fff', border: 'none',
                    fontWeight: 700, fontSize: 13,
                    cursor: redeemLoading ? 'default' : 'pointer',
                  }}
                >
                  {redeemLoading ? '…' : 'Riscatta'}
                </button>
              </div>
            )}
            {redeemError && (
              <p style={{ margin: '8px 0 0', color: '#b42318', fontSize: 13, fontWeight: 600 }}>{redeemError}</p>
            )}
            {redeemSuccess && (
              <p style={{ margin: '8px 0 0', color: '#059669', fontSize: 13, fontWeight: 600 }}>&#10003; Accesso attivato!</p>
            )}
          </div>
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
