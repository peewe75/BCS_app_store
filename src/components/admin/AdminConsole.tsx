'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { RequireAuth } from '@/src/components/auth/RequireAuth';
import AppFormModal, { type AppFormData } from './AppFormModal';
import { APP_PLAN_CONFIG, type PlanTier } from '@/src/lib/catalog';

/* ─── Types ─── */

type OverviewPayload = {
  users: Array<{ id: string; email: string | null; role: string | null; created_at: string | null }>;
  apps: Array<{
    id: string;
    name: string;
    pricing_model: string | null;
    is_active: boolean | null;
  }>;
  grants: Array<{ user_id: string; app_id: string; plan: string | null; granted_at: string | null }>;
  stats: {
    users: number;
    apps: number;
    grants: number;
    tradingReports: number;
    ravvedimentoCalcs: number;
    ugcVideos: number;
  };
  error?: string;
};

type FullApp = AppFormData & {
  created_at?: string;
  is_internal?: boolean;
  is_coming_soon?: boolean;
  cta_href?: string | null;
  internal_route?: string | null;
};

type UserWithGrants = {
  id: string;
  email: string | null;
  role: string | null;
  created_at: string | null;
  grants: Array<{ user_id: string; app_id: string; plan: string | null; expires_at: string | null }>;
};

type PaymentEvent = {
  id: string;
  stripe_event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  processed_at: string | null;
};

type Tab = 'overview' | 'users' | 'payments' | 'hub' | 'apps';

type DbPlanRow = {
  app_id: string;
  plan_code: string;
  billing_type: string | null;
  stripe_price_id: string | null;
  grant_plan: string | null;
  features: string[] | null;
  is_active: boolean | null;
};

/* ─── Helpers ─── */

function getEventLabel(type: string): string {
  if (type === 'checkout.session.completed') return 'Acquisto';
  if (type.includes('subscription') && type.includes('deleted')) return 'Abbonamento cancellato';
  if (type.includes('subscription')) return 'Abbonamento aggiornato';
  return type;
}

function getEventAmount(payload: Record<string, unknown>): string {
  const amt = (payload as { amount_total?: number }).amount_total;
  if (typeof amt === 'number') return `€${(amt / 100).toFixed(2)}`;
  return '—';
}

function getEventUser(payload: Record<string, unknown>): string {
  const meta = (payload as { metadata?: { user_id?: string } }).metadata;
  if (meta?.user_id) return meta.user_id.slice(0, 16) + '…';
  const cust = (payload as { customer?: string }).customer;
  if (typeof cust === 'string') return cust.slice(0, 16) + '…';
  return '—';
}

function getEventApp(payload: Record<string, unknown>): string {
  const meta = (payload as { metadata?: { app_id?: string } }).metadata;
  return meta?.app_id ?? '—';
}

/* ─── Styles ─── */

const accent = '#3713ec';

const card: React.CSSProperties = {
  padding: 28,
  borderRadius: 24,
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.06)',
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '10px 22px',
  borderRadius: 100,
  border: 'none',
  background: active ? accent : 'transparent',
  color: active ? '#fff' : '#6E6E73',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
});

const btnIcon: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.08)',
  background: '#fff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: 16,
  transition: 'background 0.2s',
};

/* ─── Component ─── */

function AdminConsoleContent() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // App CRUD state
  const [apps, setApps] = useState<FullApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppFormData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Users & Grants state
  const [usersData, setUsersData] = useState<UserWithGrants[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithGrants | null>(null);
  const [grantSaving, setGrantSaving] = useState<string | null>(null);

  // Payments state
  const [paymentsData, setPaymentsData] = useState<PaymentEvent[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Plan features config state
  const [planConfigApp, setPlanConfigApp] = useState<FullApp | null>(null);
  const [dbPlans, setDbPlans] = useState<DbPlanRow[]>([]);
  const [editingFeatures, setEditingFeatures] = useState<Record<string, string[]>>({});
  const [newFeatureInput, setNewFeatureInput] = useState<Record<string, string>>({});
  const [featuresSaving, setFeaturesSaving] = useState<string | null>(null);

  // Load overview
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const response = await fetch('/api/admin/overview', { cache: 'no-store' });
      const payload = (await response.json()) as OverviewPayload;
      if (cancelled) return;
      if (!response.ok) {
        setStatus('error');
        setMessage(payload.error ?? 'Admin overview non disponibile.');
        return;
      }
      setData(payload);
      setStatus('ready');
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  // Load full apps list
  const loadApps = useCallback(async () => {
    setAppsLoading(true);
    try {
      const res = await fetch('/api/admin/apps', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.apps) setApps(json.apps);
    } catch { /* silent */ } finally {
      setAppsLoading(false);
    }
  }, []);

  // Load users with grants
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.users) setUsersData(json.users);
    } catch { /* silent */ } finally {
      setUsersLoading(false);
    }
  }, []);

  // Load payments
  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch('/api/admin/payments', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.payments) setPaymentsData(json.payments);
    } catch { /* silent */ } finally {
      setPaymentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'apps' || tab === 'hub') void loadApps();
    if (tab === 'users') void loadUsers();
    if (tab === 'payments') void loadPayments();
  }, [tab, loadApps, loadUsers, loadPayments]);

  // Load plan features from DB for a given app
  const loadPlanFeatures = useCallback(async (app: FullApp) => {
    setPlanConfigApp(app);
    setDbPlans([]);
    setEditingFeatures({});
    setNewFeatureInput({});
    try {
      const res = await fetch(`/api/admin/plan-features?app_id=${app.id}`, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.plans) {
        const rows = json.plans as DbPlanRow[];
        setDbPlans(rows);
        const feats: Record<string, string[]> = {};
        for (const row of rows) {
          feats[row.plan_code] = row.features ?? [];
        }
        setEditingFeatures(feats);
      }
    } catch { /* silent */ }
  }, []);

  // Save features for a single plan
  const handleSaveFeatures = useCallback(async (appId: string, planCode: string) => {
    setFeaturesSaving(planCode);
    try {
      const features = editingFeatures[planCode] ?? [];
      const res = await fetch('/api/admin/plan-features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId, plan_code: planCode, features }),
      });
      if (res.ok) {
        setToastMsg(`Piano "${planCode}" aggiornato.`);
      } else {
        const json = await res.json();
        setToastMsg(`Errore: ${json.error ?? 'Salvataggio fallito'}`);
      }
    } catch { setToastMsg('Errore di rete.'); } finally {
      setFeaturesSaving(null);
    }
  }, [editingFeatures]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  // CRUD handlers
  const handleSave = async (formData: AppFormData, isNew: boolean) => {
    const url = isNew ? '/api/admin/apps' : `/api/admin/apps/${formData.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Errore salvataggio');
    setToastMsg(isNew ? `App "${formData.name}" creata!` : `App "${formData.name}" aggiornata!`);
    await loadApps();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/apps/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      setToastMsg(`Errore: ${json.error}`);
      return;
    }
    setToastMsg('App eliminata.');
    setConfirmDelete(null);
    await loadApps();
  };

  // Grant management
  const handleGrantChange = async (userId: string, appId: string, plan: string) => {
    setGrantSaving(appId);
    try {
      if (plan === '') {
        await fetch('/api/admin/grants', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, app_id: appId }),
        });
      } else {
        await fetch('/api/admin/grants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, app_id: appId, plan }),
        });
      }
      setToastMsg(plan === '' ? 'Accesso revocato.' : `Piano "${plan}" attivato.`);
      // Update selectedUser optimistically
      setSelectedUser((prev) => {
        if (!prev || prev.id !== userId) return prev;
        if (plan === '') {
          return { ...prev, grants: prev.grants.filter((g) => g.app_id !== appId) };
        }
        const exists = prev.grants.find((g) => g.app_id === appId);
        if (exists) {
          return { ...prev, grants: prev.grants.map((g) => g.app_id === appId ? { ...g, plan } : g) };
        }
        return { ...prev, grants: [...prev.grants, { user_id: userId, app_id: appId, plan, expires_at: null }] };
      });
      // Update global list
      setUsersData((prev) => prev.map((u) => {
        if (u.id !== userId) return u;
        if (plan === '') {
          return { ...u, grants: u.grants.filter((g) => g.app_id !== appId) };
        }
        const exists = u.grants.find((g) => g.app_id === appId);
        if (exists) {
          return { ...u, grants: u.grants.map((g) => g.app_id === appId ? { ...g, plan } : g) };
        }
        return { ...u, grants: [...u.grants, { user_id: userId, app_id: appId, plan, expires_at: null }] };
      }));
    } finally {
      setGrantSaving(null);
    }
  };

  const openCreate = () => { setEditingApp(null); setModalOpen(true); };
  const openEdit = (app: FullApp) => {
    setEditingApp({
      ...app,
      tagline: app.tagline ?? '',
      description: app.description ?? '',
      category: app.category ?? '',
      badge: app.badge ?? '',
      features: app.features ?? [],
      accent_color: app.accent_color ?? '#3713ec',
      bg_color: app.bg_color ?? '#F5F5F7',
      bg_gradient: app.bg_gradient ?? '',
      pricing_badge: app.pricing_badge ?? '',
      pricing_model: app.pricing_model ?? 'free',
      price_label: app.price_label ?? '',
      cta_text: app.cta_text ?? 'Apri',
      cta_href: app.cta_href ?? '',
      internal_route: app.internal_route ?? '',
      video_src: app.video_src ?? '',
      poster_src: app.poster_src ?? '',
    });
    setModalOpen(true);
  };

  /* ─── Apps with plan config (for Users grant modal) ─── */
  const appsWithPlans = Object.entries(APP_PLAN_CONFIG)
    .filter(([, cfg]) => cfg.plans && cfg.plans.length > 0)
    .map(([id, cfg]) => ({ id, plans: cfg.plans as PlanTier[] }));

  /* ─── Render ─── */

  if (status === 'loading') {
    return <div style={{ padding: '120px 24px', textAlign: 'center' }}>Sincronizzo la console admin...</div>;
  }

  if (status === 'error' || !data) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '120px 24px' }}>
        <div style={{ padding: 28, borderRadius: 24, background: '#FFF7ED', color: '#9A3412', border: '1px solid #FED7AA' }}>
          <strong>Console admin non completa.</strong>
          <div style={{ marginTop: 8 }}>{message}</div>
          <div style={{ marginTop: 12 }}>
            Per attivarla servono almeno <code>CLERK_SECRET_KEY</code> e <code>SUPABASE_SERVICE_ROLE_KEY</code> nel progetto Vercel.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gap: 24 }}>
      {/* Header */}
      <section style={card}>
        <p style={{ margin: '0 0 8px', color: accent, fontWeight: 700 }}>Console Admin</p>
        <h1 style={{ margin: '0 0 10px', fontSize: 34, fontFamily: 'var(--font-display)' }}>Pannello unificato</h1>
        <p style={{ margin: 0, color: '#6E6E73' }}>
          {user?.primaryEmailAddress?.emailAddress} &mdash; stack unico Clerk + Supabase + Stripe.
        </p>
      </section>

      {/* Tabs */}
      <nav style={{
        display: 'flex',
        gap: 6,
        padding: '4px',
        background: '#F5F5F7',
        borderRadius: 100,
        width: 'fit-content',
        flexWrap: 'wrap',
      }}>
        <button style={tabStyle(tab === 'overview')} onClick={() => setTab('overview')}>📊 Overview</button>
        <button style={tabStyle(tab === 'users')} onClick={() => setTab('users')}>👥 Utenti & Piani</button>
        <button style={tabStyle(tab === 'payments')} onClick={() => setTab('payments')}>💳 Pagamenti</button>
        <button style={tabStyle(tab === 'hub')} onClick={() => setTab('hub')}>🔗 App Hub</button>
        <button style={tabStyle(tab === 'apps')} onClick={() => setTab('apps')}>⚙️ Gestione App</button>
      </nav>

      {/* ─── Tab: Overview ─── */}
      {tab === 'overview' && (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {([
              ['Utenti', data.stats.users, '👥'],
              ['App', data.stats.apps, '📱'],
              ['Grant attivi', data.stats.grants, '🔑'],
              ['Trading report', data.stats.tradingReports, '📊'],
              ['Calcoli ravvedimento', data.stats.ravvedimentoCalcs, '🧮'],
              ['UGC job', data.stats.ugcVideos, '🎬'],
            ] as const).map(([label, value, icon]) => (
              <article key={label} style={{ ...card, borderRadius: 22, padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: '#6E6E73', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{value}</div>
              </article>
            ))}
          </section>

          <section style={card}>
            <h2 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>Utenti recenti</h2>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, padding: '8px 16px', fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                <span>Email</span><span>Ruolo</span><span>Registrato</span>
              </div>
              {data.users.map((entry) => (
                <article key={entry.id} style={{ padding: '12px 16px', borderRadius: 14, background: '#FAFAFA', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
                  <strong style={{ fontSize: 14 }}>{entry.email ?? entry.id}</strong>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    background: entry.role === 'admin' ? `${accent}12` : 'rgba(0,0,0,0.04)',
                    color: entry.role === 'admin' ? accent : '#666',
                  }}>
                    {entry.role ?? 'user'}
                  </span>
                  <span style={{ fontSize: 13, color: '#6E6E73' }}>
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString('it-IT') : '-'}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ─── Tab: Users & Grants ─── */}
      {tab === 'users' && (
        <>
          <section style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px' }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Utenti & Piani</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6E6E73' }}>
                Gestisci i piani di ogni utente per ciascuna app.
              </p>
            </div>
            <button
              onClick={() => void loadUsers()}
              style={{ padding: '10px 18px', borderRadius: 100, background: '#F5F5F7', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#444' }}
            >
              ↺ Ricarica
            </button>
          </section>

          {usersLoading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>Caricamento utenti...</div>
          ) : (
            <section style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 120px', gap: 12, padding: '8px 20px', fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                <span>Email</span><span>Ruolo</span><span>Membro dal</span><span>Grant</span><span style={{ textAlign: 'right' }}>Azioni</span>
              </div>
              {usersData.map((u) => (
                <article key={u.id} style={{ ...card, borderRadius: 16, padding: '14px 20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 120px', gap: 12, alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{u.email ?? u.id}</strong>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{u.id.slice(0, 20)}…</div>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    background: u.role === 'admin' ? `${accent}12` : 'rgba(0,0,0,0.04)',
                    color: u.role === 'admin' ? accent : '#666',
                    width: 'fit-content',
                  }}>
                    {u.role ?? 'user'}
                  </span>
                  <span style={{ fontSize: 13, color: '#6E6E73' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('it-IT') : '-'}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: u.grants.length > 0 ? '#059669' : '#6E6E73' }}>
                    {u.grants.length}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      style={{
                        padding: '8px 16px',
                        borderRadius: 100,
                        border: 'none',
                        background: accent,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedUser(u)}
                    >
                      Gestisci
                    </button>
                  </div>
                </article>
              ))}
              {usersData.length === 0 && (
                <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>Nessun utente trovato.</div>
              )}
            </section>
          )}

          {/* Grant management modal */}
          {selectedUser && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}
            >
              <div style={{
                background: '#fff', borderRadius: 28, padding: 32, width: '100%', maxWidth: 560,
                maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <p style={{ margin: 0, color: accent, fontWeight: 700, fontSize: 12 }}>Gestione piani</p>
                    <h2 style={{ margin: '4px 0 0', fontSize: 20 }}>{selectedUser.email}</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>
                      {selectedUser.role ?? 'user'} &bull; membro dal {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('it-IT') : '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#F5F5F7', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {appsWithPlans.map(({ id: appId, plans }) => {
                    const grant = selectedUser.grants.find((g) => g.app_id === appId);
                    const currentPlan = grant?.plan ?? '';
                    const isSaving = grantSaving === appId;
                    return (
                      <div key={appId} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px', borderRadius: 14, background: '#FAFAFA',
                        border: '1px solid rgba(0,0,0,0.05)',
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>{appId}</div>
                          {grant && (
                            <div style={{
                              fontSize: 11, marginTop: 2, fontWeight: 700,
                              color: '#059669',
                            }}>
                              Piano attivo: {plans.find((p) => p.code === currentPlan)?.label ?? currentPlan}
                            </div>
                          )}
                        </div>
                        <select
                          value={currentPlan}
                          disabled={isSaving}
                          onChange={(e) => void handleGrantChange(selectedUser.id, appId, e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 10,
                            border: '1px solid rgba(0,0,0,0.12)',
                            background: isSaving ? '#F5F5F7' : '#fff',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: isSaving ? 'default' : 'pointer',
                            minWidth: 160,
                          }}
                        >
                          <option value="">Nessun accesso</option>
                          {plans.map((p) => (
                            <option key={p.code} value={p.code}>{p.label}{p.description ? ` — ${p.description}` : ''}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  style={{
                    marginTop: 24, width: '100%', padding: '14px',
                    borderRadius: 14, border: 'none', background: '#F5F5F7',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#444',
                  }}
                >
                  Chiudi
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Tab: Payments ─── */}
      {tab === 'payments' && (
        <>
          <section style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px' }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Pagamenti Stripe</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6E6E73' }}>
                Ultime {paymentsData.length} transazioni registrate dal webhook.
              </p>
            </div>
            <button
              onClick={() => void loadPayments()}
              style={{ padding: '10px 18px', borderRadius: 100, background: '#F5F5F7', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#444' }}
            >
              ↺ Ricarica
            </button>
          </section>

          {paymentsLoading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>Caricamento pagamenti...</div>
          ) : paymentsData.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: 48, color: '#999' }}>
              Nessun evento Stripe registrato. I pagamenti appariranno qui dopo il primo checkout.
            </div>
          ) : (
            <section style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr 1fr 100px', gap: 12, padding: '8px 20px', fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                <span>Data</span><span>Tipo</span><span>Utente</span><span>App</span><span style={{ textAlign: 'right' }}>Importo</span>
              </div>
              {paymentsData.map((ev) => (
                <article key={ev.id} style={{ ...card, borderRadius: 16, padding: '14px 20px', display: 'grid', gridTemplateColumns: '160px 1fr 1fr 1fr 100px', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#6E6E73' }}>
                    {ev.processed_at ? new Date(ev.processed_at).toLocaleDateString('it-IT') : '—'}
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    background: ev.event_type === 'checkout.session.completed' ? '#D1FAE5' : ev.event_type.includes('deleted') ? '#FEE2E2' : '#EDE9FE',
                    color: ev.event_type === 'checkout.session.completed' ? '#065F46' : ev.event_type.includes('deleted') ? '#991B1B' : '#5B21B6',
                    width: 'fit-content',
                  }}>
                    {getEventLabel(ev.event_type)}
                  </span>
                  <span style={{ fontSize: 13, color: '#444' }}>{getEventUser(ev.payload)}</span>
                  <span style={{ fontSize: 13, color: '#444', fontWeight: 600 }}>{getEventApp(ev.payload)}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#059669', textAlign: 'right' }}>
                    {getEventAmount(ev.payload)}
                  </span>
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {/* ─── Tab: App Hub ─── */}
      {tab === 'hub' && (
        <>
          <section style={card}>
            <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>App Hub</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#6E6E73' }}>
              Tutte le app della suite. Apri workspace interni o accedi ai pannelli admin delle app esterne.
            </p>
          </section>

          {appsLoading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>Caricamento app...</div>
          ) : (
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {apps.map((app) => {
                const cfg = APP_PLAN_CONFIG[app.id];
                const adminUrl = cfg?.admin_url;
                const isInternal = app.is_internal ?? false;
                const workspaceHref = app.internal_route || `/workspace/${app.id}`;
                const externalHref = app.cta_href ?? '#';
                const accentColor = app.accent_color ?? accent;
                return (
                  <article key={app.id} style={{
                    ...card,
                    borderRadius: 20,
                    opacity: app.is_active ? 1 : 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${accentColor}15`,
                        color: accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                        flexShrink: 0,
                      }}>
                        {app.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{app.name}</div>
                        <div style={{ fontSize: 12, color: '#6E6E73' }}>
                          {isInternal ? 'App interna' : 'App esterna'} &bull; {app.pricing_model ?? 'free'}
                        </div>
                      </div>
                    </div>

                    {cfg?.plans && cfg.plans.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {cfg.plans.map((p) => (
                          <span key={p.code} style={{
                            padding: '2px 10px',
                            borderRadius: 100,
                            fontSize: 11,
                            fontWeight: 700,
                            background: `${accentColor}12`,
                            color: accentColor,
                          }}>
                            {p.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                      {isInternal ? (
                        <Link href={workspaceHref} style={{
                          padding: '10px 18px',
                          borderRadius: 100,
                          background: accentColor,
                          color: '#fff',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: 13,
                        }}>
                          Apri workspace
                        </Link>
                      ) : (
                        <a href={externalHref} target="_blank" rel="noopener noreferrer" style={{
                          padding: '10px 18px',
                          borderRadius: 100,
                          background: accentColor,
                          color: '#fff',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: 13,
                        }}>
                          Apri app ↗
                        </a>
                      )}
                      {adminUrl && (
                        <a href={adminUrl} target="_blank" rel="noopener noreferrer" style={{
                          padding: '10px 18px',
                          borderRadius: 100,
                          border: `1px solid ${accentColor}40`,
                          color: accentColor,
                          background: `${accentColor}08`,
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: 13,
                        }}>
                          Admin ↗
                        </a>
                      )}
                      {cfg?.plans && cfg.plans.length > 0 && (
                        <button
                          onClick={() => void loadPlanFeatures(app)}
                          style={{
                            padding: '10px 18px',
                            borderRadius: 100,
                            border: '1px solid rgba(0,0,0,0.1)',
                            background: '#F5F5F7',
                            color: '#444',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          ⚙️ Piani
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}

      {/* ─── Tab: App Management ─── */}
      {tab === 'apps' && (
        <>
          <section style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px' }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Catalogo App</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6E6E73' }}>
                {apps.length} app nel catalogo &mdash; Aggiungi, modifica o rimuovi app dalla piattaforma.
              </p>
            </div>
            <button
              onClick={openCreate}
              style={{
                padding: '12px 24px',
                borderRadius: 100,
                background: accent,
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nuova App
            </button>
          </section>

          {appsLoading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>Caricamento app...</div>
          ) : (
            <section style={{ display: 'grid', gap: 12 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '48px 2fr 1fr 1fr 100px 80px 100px',
                gap: 12,
                padding: '8px 20px',
                fontSize: 11,
                color: '#999',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}>
                <span>#</span><span>Nome</span><span>Categoria</span><span>Pricing</span><span>Stato</span><span>Tipo</span><span style={{ textAlign: 'right' }}>Azioni</span>
              </div>

              {apps.map((app) => (
                <article
                  key={app.id}
                  style={{
                    ...card,
                    borderRadius: 16,
                    padding: '14px 20px',
                    display: 'grid',
                    gridTemplateColumns: '48px 2fr 1fr 1fr 100px 80px 100px',
                    gap: 12,
                    alignItems: 'center',
                    opacity: app.is_active ? 1 : 0.5,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#999' }}>{app.sort_order}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: app.accent_color || accent, flexShrink: 0 }} />
                      <strong style={{ fontSize: 15 }}>{app.name}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2, marginLeft: 20 }}>{app.id}</div>
                  </div>
                  <span style={{ fontSize: 13, color: '#666' }}>{app.category || '-'}</span>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: 'rgba(0,0,0,0.04)', color: '#666', width: 'fit-content' }}>
                    {app.pricing_model || 'free'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, background: app.is_active ? '#D1FAE5' : '#FEE2E2', color: app.is_active ? '#065F46' : '#991B1B' }}>
                      {app.is_active ? 'ON' : 'OFF'}
                    </span>
                    {app.is_coming_soon && (
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#92400E' }}>
                        SOON
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#999' }}>{app.is_internal ? 'Interna' : 'Esterna'}</span>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      style={btnIcon}
                      title="Modifica"
                      onClick={() => openEdit(app)}
                      onMouseEnter={(e) => { (e.currentTarget).style.background = '#F0F0FF'; }}
                      onMouseLeave={(e) => { (e.currentTarget).style.background = '#fff'; }}
                    >
                      ✏️
                    </button>
                    <button
                      style={{ ...btnIcon, borderColor: confirmDelete === app.id ? '#EF4444' : undefined }}
                      title="Elimina"
                      onClick={() => {
                        if (confirmDelete === app.id) void handleDelete(app.id);
                        else setConfirmDelete(app.id);
                      }}
                      onMouseEnter={(e) => { (e.currentTarget).style.background = '#FEF2F2'; }}
                      onMouseLeave={(e) => { (e.currentTarget).style.background = '#fff'; }}
                    >
                      {confirmDelete === app.id ? '⚠️' : '🗑️'}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {/* ─── Plan Features Modal ─── */}
      {planConfigApp && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) setPlanConfigApp(null); }}
        >
          <div style={{
            background: '#fff', borderRadius: 28, padding: 32, width: '100%', maxWidth: 780,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <p style={{ margin: 0, color: accent, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configurazione Piani</p>
                <h2 style={{ margin: '4px 0 4px', fontSize: 22 }}>{planConfigApp.name}</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#6E6E73' }}>
                  Definisci le funzionalità incluse in ciascun piano. L&apos;admin ha sempre accesso completo.
                </p>
              </div>
              <button
                onClick={() => setPlanConfigApp(null)}
                style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#F5F5F7', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >×</button>
            </div>

            {/* Admin always full access badge */}
            <div style={{
              marginBottom: 24, padding: '12px 18px', borderRadius: 14,
              background: `${accent}0D`, border: `1px solid ${accent}25`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>🛡️</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: accent }}>Accesso Admin</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6E6E73' }}>Gli admin hanno sempre accesso completo a tutte le funzionalità, indipendentemente dal piano.</p>
              </div>
            </div>

            {dbPlans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#999', fontSize: 14 }}>
                Nessun piano trovato nel DB per questa app.<br />
                <span style={{ fontSize: 12 }}>Assicurati che i piani siano inseriti in <code>app_billing_plans</code>.</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 20 }}>
                {dbPlans.map((row) => {
                  const planCfg = APP_PLAN_CONFIG[planConfigApp.id]?.plans?.find((p) => p.code === row.plan_code);
                  const features = editingFeatures[row.plan_code] ?? [];
                  const inputVal = newFeatureInput[row.plan_code] ?? '';
                  const isSaving = featuresSaving === row.plan_code;
                  const planAccentColor = planConfigApp.accent_color ?? accent;

                  return (
                    <div key={row.plan_code} style={{
                      padding: 24, borderRadius: 18, background: '#FAFAFA',
                      border: '1px solid rgba(0,0,0,0.07)',
                    }}>
                      {/* Plan header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              padding: '3px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                              background: `${planAccentColor}15`, color: planAccentColor,
                            }}>
                              {planCfg?.label ?? row.plan_code}
                            </span>
                            {row.billing_type && (
                              <span style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>{row.billing_type}</span>
                            )}
                            {!row.is_active && (
                              <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, background: '#FEE2E2', color: '#991B1B' }}>Inattivo</span>
                            )}
                          </div>
                          {planCfg?.description && (
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>{planCfg.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => void handleSaveFeatures(planConfigApp.id, row.plan_code)}
                          disabled={isSaving}
                          style={{
                            padding: '9px 20px', borderRadius: 100,
                            background: isSaving ? '#999' : planAccentColor,
                            color: '#fff', border: 'none', fontWeight: 700, fontSize: 13,
                            cursor: isSaving ? 'default' : 'pointer', flexShrink: 0,
                          }}
                        >
                          {isSaving ? 'Salvataggio…' : 'Salva'}
                        </button>
                      </div>

                      {/* Feature list */}
                      <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                        {features.length === 0 && (
                          <p style={{ margin: 0, fontSize: 13, color: '#bbb', fontStyle: 'italic' }}>Nessuna funzionalità definita.</p>
                        )}
                        {features.map((feat, idx) => (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 10,
                            background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
                          }}>
                            <span style={{ color: '#059669', fontSize: 14, flexShrink: 0 }}>✓</span>
                            <span style={{ flex: 1, fontSize: 13, color: '#1D1D1F' }}>{feat}</span>
                            <button
                              onClick={() => {
                                setEditingFeatures((prev) => ({
                                  ...prev,
                                  [row.plan_code]: prev[row.plan_code]?.filter((_, i) => i !== idx) ?? [],
                                }));
                              }}
                              style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#999', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >×</button>
                          </div>
                        ))}
                      </div>

                      {/* Add feature input */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={inputVal}
                          placeholder="Aggiungi funzionalità…"
                          onChange={(e) => setNewFeatureInput((prev) => ({ ...prev, [row.plan_code]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && inputVal.trim()) {
                              setEditingFeatures((prev) => ({
                                ...prev,
                                [row.plan_code]: [...(prev[row.plan_code] ?? []), inputVal.trim()],
                              }));
                              setNewFeatureInput((prev) => ({ ...prev, [row.plan_code]: '' }));
                            }
                          }}
                          style={{
                            flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)',
                            fontSize: 13, outline: 'none', background: '#fff',
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!inputVal.trim()) return;
                            setEditingFeatures((prev) => ({
                              ...prev,
                              [row.plan_code]: [...(prev[row.plan_code] ?? []), inputVal.trim()],
                            }));
                            setNewFeatureInput((prev) => ({ ...prev, [row.plan_code]: '' }));
                          }}
                          style={{
                            padding: '10px 18px', borderRadius: 10, border: 'none',
                            background: '#1D1D1F', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                          }}
                        >
                          + Aggiungi
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setPlanConfigApp(null)}
              style={{ marginTop: 24, width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#F5F5F7', fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#444' }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <AppFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingApp(null); }}
        onSave={handleSave}
        editingApp={editingApp}
      />

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          padding: '14px 24px',
          borderRadius: 14,
          background: '#1a1a1a',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 300,
        }}>
          {toastMsg}
        </div>
      )}

      {/* Confirm delete dismiss */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}

export default function AdminConsole() {
  return (
    <RequireAuth requireAdmin>
      <AdminConsoleContent />
    </RequireAuth>
  );
}
