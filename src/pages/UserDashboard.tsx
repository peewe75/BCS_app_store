import React, { useEffect, useState } from 'react';
import { useSession, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { createClerkSupabaseClient, supabase as publicSupabase } from '../lib/supabase';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

type AppRow = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  badge: string | null;
  accent_color: string | null;
  bg_color: string | null;
  bg_gradient: string | null;
  pricing_badge: string | null;
  pricing_model: string | null;
  price_label: string | null;
  cta_text: string | null;
  cta_href: string | null;
  is_internal: boolean | null;
  internal_route: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  is_coming_soon: boolean | null;
};

type UserAppRow = {
  app_id: string;
  plan: string | null;
  expires_at: string | null;
};

const APP_COLUMNS = `
  id,
  name,
  tagline,
  description,
  badge,
  accent_color,
  bg_color,
  bg_gradient,
  pricing_badge,
  pricing_model,
  price_label,
  cta_text,
  cta_href,
  is_internal,
  internal_route,
  sort_order,
  is_active,
  is_coming_soon
`;

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

function getAppIcon(appId: string) {
  switch (appId) {
    case 'ugc':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'ai-crisi':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'trading':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M3 3v18h18M7 16l4-4 4 4 4-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'ravvedimento':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M13 3h8m0 0v8m0-8L11 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'forf':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm3 4h4m-4 4h4m-4 4h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bot':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M9 3h6M12 3v3M7 9h10a3 3 0 013 3v4a3 3 0 01-3 3H7a3 3 0 01-3-3v-4a3 3 0 013-3zm2 5h.01M15 14h.01M8 21l2-2M16 21l-2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-9zM8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

const UserDashboard: React.FC = () => {
  const { user } = useUser();
  const { session } = useSession();
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [userApps, setUserApps] = useState<UserAppRow[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initials = getInitials(user?.firstName, user?.lastName, user?.primaryEmailAddress?.emailAddress);
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Utente';
  const memberSince = formatDate(user?.createdAt);
  const unlockedApps = userApps.reduce<Record<string, UserAppRow>>((accumulator, currentApp) => {
    accumulator[currentApp.app_id] = currentApp;
    return accumulator;
  }, {});

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!publicSupabase) {
        if (isMounted) {
          setApps([]);
          setUserApps([]);
          setLoadError('Configura VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY per caricare il catalogo.');
          setIsLoadingApps(false);
        }
        return;
      }

      setIsLoadingApps(true);
      setLoadError(null);

      const client = session
        ? createClerkSupabaseClient(() => session.getToken()) ?? publicSupabase
        : publicSupabase;

      const appsPromise = client
        .from('apps')
        .select(APP_COLUMNS)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      const userAppsPromise = user?.id
        ? client
          .from('user_apps')
          .select('app_id, plan, expires_at')
          .eq('user_id', user.id)
        : Promise.resolve({ data: [] as UserAppRow[], error: null });

      const [appsResult, userAppsResult] = await Promise.all([appsPromise, userAppsPromise]);

      if (!isMounted) {
        return;
      }

      if (appsResult.error) {
        setApps([]);
        setUserApps([]);
        setLoadError('Non sono riuscito a leggere il catalogo apps da Supabase.');
      } else {
        setApps((appsResult.data as AppRow[] | null) ?? []);
        setUserApps((userAppsResult.data as UserAppRow[] | null) ?? []);

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
  }, [session, user?.id]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleOpenApp = (app: AppRow) => {
    if (app.is_coming_soon) {
      return;
    }

    if (app.is_internal && app.internal_route) {
      navigate(app.internal_route);
      return;
    }

    if (app.cta_href) {
      window.open(app.cta_href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F5F7',
        paddingTop: '80px',
        fontFamily: '"Inter", system-ui, sans-serif',
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
              <button
                onClick={() => navigate('/admin')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '100px',
                  background: '#3713ec',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: '"Inter", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a5 5 0 015 5v2a5 5 0 01-10 0V7a5 5 0 015-5zM2 20a10 10 0 0120 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Admin
              </button>
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
                fontFamily: '"Inter", sans-serif',
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
              value: isAdmin ? 'Admin' : 'Free',
              sub: isAdmin ? 'Accesso illimitato' : 'Aggiorna per piu funzioni',
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
          <h2 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#1D1D1F',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}>
            Le tue app
          </h2>
          <p style={{ fontSize: '15px', color: '#6E6E73', margin: '0 0 28px', fontWeight: 400 }}>
            Catalogo letto da Supabase. Gli accessi personali arrivano da Clerk tramite RLS.
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

          {!isLoadingApps && !loadError && apps.map((app) => {
            const accentColor = app.accent_color ?? '#3713ec';
            const badge = app.is_coming_soon ? 'Prossimamente' : (app.badge ?? app.pricing_badge ?? 'BCS AI');
            const secondaryLabel = unlockedApps[app.id]?.plan
              ? `Piano ${unlockedApps[app.id].plan}`
              : (app.price_label ?? app.pricing_badge ?? 'Disponibile');

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
                    }}
                  >
                    {getAppIcon(app.id)}
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
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1D1D1F',
                    margin: '0 0 8px',
                    letterSpacing: '-0.02em',
                  }}>
                    {app.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6E6E73',
                    margin: '0 0 10px',
                    lineHeight: 1.5,
                    fontWeight: 400,
                  }}>
                    {app.tagline || app.description || 'Catalogo sincronizzato da Supabase.'}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: accentColor,
                    margin: 0,
                    fontWeight: 600,
                  }}>
                    {secondaryLabel}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: accentColor,
                  fontSize: '14px',
                  fontWeight: 600,
                  marginTop: 'auto',
                }}>
                  {app.is_coming_soon ? (app.cta_text || 'In arrivo') : (app.cta_text || 'Apri app')}
                  {!app.is_coming_soon && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
