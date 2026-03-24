'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public';
import type { AppRecord, UserAppGrant } from '@/src/lib/catalog';
import { getAppWorkspaceRoute } from '@/src/lib/app-routes';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

function formatDate(date?: Date | null): string {
  if (!date) return '-';
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getAppHref(app: AppRecord) {
  if (app.is_internal) {
    return app.internal_route ?? getAppWorkspaceRoute(app);
  }

  return app.cta_href ?? '#';
}

export default function UserDashboard() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [userApps, setUserApps] = useState<UserAppGrant[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initials = getInitials(user?.firstName, user?.lastName, user?.primaryEmailAddress?.emailAddress);
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Utente';
  const memberSince = formatDate(user?.createdAt);
  const isAdmin = (user?.publicMetadata?.role as string | undefined) === 'admin';

  const unlockedApps = useMemo(
    () =>
      userApps.reduce<Record<string, UserAppGrant>>((accumulator, currentApp) => {
        accumulator[currentApp.app_id] = currentApp;
        return accumulator;
      }, {}),
    [userApps],
  );

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!publicSupabase) {
        if (isMounted) {
          setApps([]);
          setUserApps([]);
          setLoadError('Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY per caricare il catalogo.');
          setIsLoadingApps(false);
        }
        return;
      }

      setIsLoadingApps(true);
      setLoadError(null);

      const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase;

      const appsPromise = client
        .from('apps')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      const userAppsPromise = user?.id
        ? client
            .from('user_apps')
            .select('app_id, plan, expires_at')
            .eq('user_id', user.id)
        : Promise.resolve({ data: [] as UserAppGrant[], error: null });

      const [appsResult, userAppsResult] = await Promise.all([appsPromise, userAppsPromise]);

      if (!isMounted) {
        return;
      }

      if (appsResult.error) {
        setApps([]);
        setUserApps([]);
        setLoadError('Non sono riuscito a leggere il catalogo apps da Supabase.');
      } else {
        setApps((appsResult.data as AppRecord[] | null) ?? []);
        setUserApps((userAppsResult.data as UserAppGrant[] | null) ?? []);

        if (userAppsResult.error) {
          console.error('Failed to load user_apps', userAppsResult.error);
        }
      }

      setIsLoadingApps(false);
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [getToken, user?.id]);

  const handleLogout = async () => {
    await signOut({ redirectUrl: '/' });
  };

  const handleOpenApp = (app: AppRecord) => {
    const href = getAppHref(app);
    if (app.is_internal) {
      router.push(href);
      return;
    }

    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F5F7',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '48px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#3713ec',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px',
                  letterSpacing: '-0.02em',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D1D1F', margin: 0, letterSpacing: '-0.02em' }}>
                Ciao, {displayName}
              </h1>
              <p style={{ fontSize: '14px', color: '#6E6E73', margin: '2px 0 0', fontWeight: 400 }}>
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  padding: '10px 20px',
                  borderRadius: '100px',
                  background: '#3713ec',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                borderRadius: '100px',
                background: 'transparent',
                color: '#6E6E73',
                border: '1px solid rgba(0,0,0,0.15)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Esci
            </button>
          </div>
        </motion.header>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          {[
            {
              label: 'Piano attivo',
              value: isAdmin ? 'Admin' : 'User',
              sub: isAdmin ? 'Accesso completo' : 'Autenticazione Clerk unificata',
              color: isAdmin ? '#3713ec' : '#10b981',
            },
            {
              label: 'Membro dal',
              value: memberSince,
              sub: 'Data registrazione',
              color: '#6E6E73',
            },
            {
              label: 'App disponibili',
              value: String(apps.length),
              sub: isLoadingApps ? 'Sincronizzazione in corso' : 'Catalogo Supabase',
              color: '#ec4899',
            },
            {
              label: 'Accessi personali',
              value: String(userApps.length),
              sub: 'Lettura protetta via RLS',
              color: '#3b82f6',
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '28px',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#6E6E73', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '22px', fontWeight: 800, color: stat.color, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '12px', color: '#6E6E73', margin: 0, fontWeight: 400 }}>
                {stat.sub}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1D1D1F', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Le tue app
          </h2>
          <p style={{ fontSize: '15px', color: '#6E6E73', margin: '0 0 28px', fontWeight: 400 }}>
            Catalogo letto da Supabase. Gli accessi personali arrivano da Clerk tramite RLS e Stripe aggiorna `user_apps`.
          </p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {isLoadingApps && (
            <motion.div
              variants={fadeUp}
              style={{
                gridColumn: '1 / -1',
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '28px 32px',
                border: '1px solid rgba(0,0,0,0.06)',
                color: '#6E6E73',
              }}
            >
              Sincronizzo il catalogo con Supabase...
            </motion.div>
          )}

          {!isLoadingApps && loadError && (
            <motion.div
              variants={fadeUp}
              style={{
                gridColumn: '1 / -1',
                background: '#FFF1F2',
                borderRadius: '24px',
                padding: '28px 32px',
                border: '1px solid #FECDD3',
                color: '#BE123C',
              }}
            >
              {loadError}
            </motion.div>
          )}

          {!isLoadingApps &&
            !loadError &&
            apps.map((app) => {
              const accentColor = app.accent_color ?? '#3713ec';
              const isUnlocked =
                isAdmin ||
                app.pricing_model === 'free' ||
                app.id === 'forf' ||
                Boolean(unlockedApps[app.id]);
              const badge = app.is_coming_soon
                ? 'Prossimamente'
                : isUnlocked
                  ? 'Accesso attivo'
                  : app.badge ?? app.pricing_badge ?? 'BCS AI';
              const secondaryLabel = unlockedApps[app.id]?.plan
                ? `Piano ${unlockedApps[app.id].plan}`
                : isUnlocked
                  ? app.price_label ?? app.pricing_badge ?? 'Disponibile'
                  : 'Richiede acquisto o grant';

              return (
                <motion.button
                  key={app.id}
                  type="button"
                  variants={fadeUp}
                  onClick={() => handleOpenApp(app)}
                  whileHover={app.is_coming_soon ? undefined : { y: -4, boxShadow: `0 20px 48px ${accentColor}22` }}
                  whileTap={app.is_coming_soon ? undefined : { scale: 0.98 }}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    padding: '32px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    cursor: app.is_coming_soon ? 'default' : 'pointer',
                    transition: 'box-shadow 0.3s ease',
                    textAlign: 'left',
                    opacity: app.is_coming_soon ? 0.72 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: app.bg_gradient || app.bg_color || '#F5F5F7',
                        color: accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontWeight: 800,
                      }}
                    >
                      {app.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        padding: '4px 12px',
                        borderRadius: '100px',
                        background: `${accentColor}15`,
                        color: accentColor,
                        border: `1px solid ${accentColor}25`,
                      }}
                    >
                      {badge}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1D1D1F', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                      {app.name}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6E6E73', margin: '0 0 10px', lineHeight: 1.5, fontWeight: 400 }}>
                      {app.tagline || app.description || 'Catalogo sincronizzato da Supabase.'}
                    </p>
                    <p style={{ fontSize: '12px', color: accentColor, margin: 0, fontWeight: 600 }}>
                      {secondaryLabel}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: accentColor, fontSize: '14px', fontWeight: 600, marginTop: 'auto' }}>
                    {app.is_coming_soon ? 'In arrivo' : app.is_internal ? 'Apri workspace' : 'Apri app esterna'}
                  </div>
                </motion.button>
              );
            })}
        </motion.div>
      </div>
    </div>
  );
}
