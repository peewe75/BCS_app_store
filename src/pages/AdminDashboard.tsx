import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useApps } from '../hooks/useApps';
import AppManagementTab from '../components/admin/AppManagementTab';

/* ─── Types ──────────────────────────────────────────────────── */
interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'premium';
  plan: string;
  credits: number;
  createdAt: string;
  apps: string[];
}

/* ─── Animation variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

/* ─── KPI Card ───────────────────────────────────────────────── */
interface KpiProps {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}
const KpiCard: React.FC<KpiProps> = ({ label, value, sub, color, icon }) => (
  <motion.div
    variants={fadeUp}
    style={{
      background: '#FFFFFF',
      borderRadius: '20px',
      padding: '28px',
      border: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}
  >
    <div style={{
      width: '44px', height: '44px', borderRadius: '12px',
      background: `${color}15`, color, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#6E6E73', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>
        {label}
      </p>
      <p style={{ fontSize: '28px', fontWeight: 800, color: '#1D1D1F', margin: 0, letterSpacing: '-0.03em' }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '12px', color: '#6E6E73', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  </motion.div>
);

/* ─── Role Badge ─────────────────────────────────────────────── */
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const styles: Record<string, { bg: string; color: string }> = {
    admin: { bg: '#3713ec15', color: '#3713ec' },
    premium: { bg: '#10b98115', color: '#10b981' },
    user: { bg: '#6E6E7315', color: '#6E6E73' },
  };
  const s = styles[role] ?? styles.user;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
      fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      background: s.bg, color: s.color,
    }}>
      {role}
    </span>
  );
};

/* ─── Empty State ────────────────────────────────────────────── */
const EmptyState: React.FC<{ isDbConnected: boolean }> = ({ isDbConnected }) => (
  <tr>
    <td colSpan={5} style={{ padding: '64px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '20px',
          background: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
              stroke="#6E6E73" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#1D1D1F', margin: '0 0 6px' }}>
            {isDbConnected ? 'Nessun utente trovato' : 'Database non connesso'}
          </p>
          <p style={{ fontSize: '14px', color: '#6E6E73', margin: 0, maxWidth: '320px' }}>
            {isDbConnected
              ? 'Nessun utente corrisponde alla ricerca.'
              : 'Configura VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel file .env.local per visualizzare gli utenti.'}
          </p>
        </div>
        {!isDbConnected && (
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px', borderRadius: '100px',
              background: '#3713ec', color: '#fff', textDecoration: 'none',
              fontSize: '14px', fontWeight: 600,
            }}
          >
            Apri Supabase →
          </a>
        )}
      </div>
    </td>
  </tr>
);

/* ─── User Detail Panel ──────────────────────────────────────── */
const UserDetailPanel: React.FC<{ user: UserRecord; onClose: () => void }> = ({ user, onClose }) => (
  <>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 60 }}
    />
    <motion.aside
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      style={{
        position: 'fixed', right: 0, top: 0, height: '100%', width: '100%', maxWidth: '440px',
        background: '#FFFFFF', zIndex: 70, overflowY: 'auto',
        borderLeft: '1px solid rgba(0,0,0,0.08)',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1D1D1F', margin: 0 }}>Dettagli utente</h2>
          <button
            onClick={onClose}
            style={{
              width: '36px', height: '36px', borderRadius: '50%', border: 'none',
              background: '#F5F5F7', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Avatar card */}
        <div style={{
          padding: '24px', borderRadius: '20px', background: '#F5F5F7',
          border: '1px solid rgba(0,0,0,0.06)', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', background: '#3713ec',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 800,
          }}>
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#1D1D1F', margin: '0 0 4px' }}>{user.name}</p>
            <p style={{ fontSize: '13px', color: '#6E6E73', margin: '0 0 8px' }}>{user.email}</p>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Piano', value: user.plan || 'Free' },
            { label: 'Crediti', value: user.role === 'admin' ? '∞' : user.credits },
            { label: 'Iscrizione', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('it-IT') : '—' },
            { label: 'App attive', value: user.apps?.length ?? 0 },
          ].map((item, i) => (
            <div key={i} style={{ padding: '16px', borderRadius: '14px', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#6E6E73', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>{item.label}</p>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#1D1D1F', margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Pagamento placeholder */}
        <div style={{
          padding: '20px', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.15)',
          textAlign: 'center', marginBottom: '24px',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#6E6E73', margin: '0 0 4px' }}>Pagamenti</p>
          <p style={{ fontSize: '12px', color: '#6E6E73', margin: 0 }}>In attesa integrazione Stripe</p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
            background: '#3713ec', color: '#fff', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', fontFamily: '"Inter", sans-serif',
          }}>
            Aggiorna crediti
          </button>
          <button style={{
            padding: '14px 20px', borderRadius: '14px',
            background: '#fff0f0', color: '#ef4444', border: '1px solid #fecaca',
            fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: '"Inter", sans-serif',
          }}>
            Sospendi
          </button>
        </div>
      </div>
    </motion.aside>
  </>
);

/* ─── Main Component ─────────────────────────────────────────── */
const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'admin' | 'premium' | 'user'>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'apps'>('users');
  const isDbConnected = supabase !== null;

  // Apps data for the App management tab
  const { apps: allApps, loading: appsLoading, refetch: refetchApps } = useApps({ onlyActive: false });

  useEffect(() => {
    const fetchUsers = async () => {
      if (!supabase) { setLoading(false); return; }
      try {
        const { data, error } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
        if (!error && data) setUsers(data as UserRecord[]);
      } catch (_) { /* silent */ }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === 'all' || u.role === activeFilter;
    return matchSearch && matchFilter;
  });

  const kpis: KpiProps[] = [
    {
      label: 'Utenti totali',
      value: users.length,
      sub: isDbConnected ? 'Nel database' : 'DB non connesso',
      color: '#3b82f6',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Premium',
      value: users.filter((u) => u.role === 'premium').length,
      sub: 'Con abbonamento',
      color: '#10b981',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Admin',
      value: users.filter((u) => u.role === 'admin').length,
      sub: 'Accesso completo',
      color: '#3713ec',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Revenue',
      value: '—',
      sub: 'In attesa Stripe',
      color: '#f59e0b',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F7',
      paddingTop: '80px',
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', background: '#3713ec15',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3713ec',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1D1D1F', margin: 0, letterSpacing: '-0.02em' }}>
                Console Admin
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#6E6E73', margin: 0 }}>
              Monitoraggio e gestione — BCS AI Suite
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 20px', borderRadius: '100px',
                background: '#FFFFFF', color: '#1D1D1F',
                border: '1px solid rgba(0,0,0,0.12)', fontWeight: 600,
                fontSize: '14px', cursor: 'pointer', fontFamily: '"Inter", sans-serif',
              }}
            >
              Vista utente
            </button>
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              style={{
                padding: '10px 20px', borderRadius: '100px',
                background: 'transparent', color: '#6E6E73',
                border: '1px solid rgba(0,0,0,0.12)', fontWeight: 600,
                fontSize: '14px', cursor: 'pointer', fontFamily: '"Inter", sans-serif',
              }}
            >
              Esci
            </button>
          </div>
        </motion.header>

        {/* ── Tab Navigation ──────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '32px',
          background: '#FFFFFF', borderRadius: '14px', padding: '4px',
          border: '1px solid rgba(0,0,0,0.06)', width: 'fit-content',
        }}>
          {([
            { key: 'users' as const, label: 'Utenti', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )},
            { key: 'apps' as const, label: 'App', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            )},
          ]).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: 600,
                fontFamily: 'var(--font-display)',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: activeTab === key ? '#3713ec' : 'transparent',
                color: activeTab === key ? '#fff' : '#6E6E73',
                transition: 'all 0.2s ease',
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────────── */}
        {activeTab === 'apps' ? (
          <AppManagementTab
            apps={allApps}
            loading={appsLoading}
            onRefetch={refetchApps}
          />
        ) : (
        <>
        {/* ── KPIs ───────────────────────────────────────────── */}
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}
        >
          {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
        </motion.div>

        {/* ── User Table ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            background: '#FFFFFF', borderRadius: '24px',
            border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
          }}
        >
          {/* Table toolbar */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex', flexWrap: 'wrap', gap: '12px',
            alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1D1D1F', margin: 0 }}>
                Utenti
              </h2>
              <span style={{
                padding: '2px 10px', borderRadius: '100px',
                background: '#F5F5F7', fontSize: '12px', fontWeight: 700, color: '#6E6E73',
              }}>
                {filtered.length}
              </span>

              {/* Filter pills */}
              <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', flexWrap: 'wrap' }}>
                {(['all', 'admin', 'premium', 'user'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    style={{
                      padding: '4px 12px', borderRadius: '100px', border: 'none',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      fontFamily: '"Inter", sans-serif',
                      background: activeFilter === f ? '#3713ec' : '#F5F5F7',
                      color: activeFilter === f ? '#fff' : '#6E6E73',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {f === 'all' ? 'Tutti' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6E6E73', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Cerca email o nome…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '36px', paddingRight: '16px', paddingTop: '9px', paddingBottom: '9px',
                  borderRadius: '100px', border: '1px solid rgba(0,0,0,0.1)',
                  fontSize: '14px', color: '#1D1D1F', background: '#F5F5F7',
                  outline: 'none', fontFamily: '"Inter", sans-serif', width: '220px',
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  {['Utente', 'Ruolo', 'Piano', 'Iscrizione', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '12px 16px', fontSize: '11px', fontWeight: 700,
                      color: '#6E6E73', letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: '#FAFAFA', textAlign: i === 4 ? 'right' : 'left',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: '3px solid #3713ec', borderTopColor: 'transparent',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                          <p style={{ color: '#6E6E73', fontSize: '14px', margin: 0 }}>Caricamento…</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <EmptyState isDbConnected={isDbConnected} />
                  ) : (
                    filtered.map((u) => (
                      <motion.tr
                        key={u.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedUser(u)}
                        style={{
                          borderBottom: '1px solid rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Avatar + info */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '50%',
                              background: '#3713ec15', color: '#3713ec',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: 800, flexShrink: 0,
                            }}>
                              {u.name?.slice(0, 2).toUpperCase() || u.email?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1D1D1F', margin: 0 }}>{u.name}</p>
                              <p style={{ fontSize: '12px', color: '#6E6E73', margin: 0 }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}><RoleBadge role={u.role} /></td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1D1D1F', fontWeight: 500 }}>
                          {u.plan || 'Free'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6E6E73' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('it-IT') : '—'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: '#F5F5F7', color: '#6E6E73',
                          }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
        </>
        )}
      </div>

      {/* ── User Detail Slide-over ──────────────────────────── */}
      <AnimatePresence>
        {selectedUser && (
          <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
