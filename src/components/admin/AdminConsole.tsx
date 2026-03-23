'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { RequireAuth } from '@/src/components/auth/RequireAuth';
import AppFormModal, { type AppFormData } from './AppFormModal';

/* ─── Types ─── */

type OverviewPayload = {
  users: Array<{ id: string; email: string | null; role: string | null; created_at: string | null }>;
  apps: Array<{ id: string; name: string; pricing_model: string | null; is_active: boolean | null }>;
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

type FullApp = AppFormData & { created_at?: string };

type Tab = 'overview' | 'apps';

/* ─── Styles ─── */

const accent = '#3713ec';

const card = {
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

  // App CRUD state
  const [apps, setApps] = useState<FullApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppFormData | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
      if (res.ok && json.apps) {
        setApps(json.apps);
      }
    } catch {
      // silent
    } finally {
      setAppsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'apps') {
      void loadApps();
    }
  }, [tab, loadApps]);

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
      <nav style={{ display: 'flex', gap: 8, padding: '4px', background: '#F5F5F7', borderRadius: 100, width: 'fit-content' }}>
        <button style={tabStyle(tab === 'overview')} onClick={() => setTab('overview')}>Overview</button>
        <button style={tabStyle(tab === 'apps')} onClick={() => setTab('apps')}>Gestione App</button>
      </nav>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {([
              ['Utenti', data.stats.users, '👥'],
              ['App', data.stats.apps, '📱'],
              ['Grant', data.stats.grants, '🔑'],
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
                  <div>
                    <strong style={{ fontSize: 14 }}>{entry.email ?? entry.id}</strong>
                  </div>
                  <div>
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
                  </div>
                  <div style={{ fontSize: 13, color: '#6E6E73' }}>
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString('it-IT') : '-'}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Tab: App Management */}
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
              {/* Table header */}
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
                <span>#</span>
                <span>Nome</span>
                <span>Categoria</span>
                <span>Pricing</span>
                <span>Stato</span>
                <span>Tipo</span>
                <span style={{ textAlign: 'right' }}>Azioni</span>
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
                    transition: 'opacity 0.2s',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#999' }}>{app.sort_order}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: app.accent_color || accent,
                        flexShrink: 0,
                      }} />
                      <strong style={{ fontSize: 15 }}>{app.name}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2, marginLeft: 20 }}>{app.id}</div>
                  </div>
                  <span style={{ fontSize: 13, color: '#666' }}>{app.category || '-'}</span>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    background: 'rgba(0,0,0,0.04)',
                    color: '#666',
                    width: 'fit-content',
                  }}>
                    {app.pricing_model || 'free'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: 100,
                      fontSize: 10,
                      fontWeight: 700,
                      background: app.is_active ? '#D1FAE5' : '#FEE2E2',
                      color: app.is_active ? '#065F46' : '#991B1B',
                    }}>
                      {app.is_active ? 'ON' : 'OFF'}
                    </span>
                    {app.is_coming_soon && (
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: 100,
                        fontSize: 10,
                        fontWeight: 700,
                        background: '#FEF3C7',
                        color: '#92400E',
                      }}>
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
                        if (confirmDelete === app.id) {
                          void handleDelete(app.id);
                        } else {
                          setConfirmDelete(app.id);
                        }
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
          zIndex: 200,
          animation: 'fadeInUp 0.3s ease',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Confirm delete dismiss on click outside */}
      {confirmDelete && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          onClick={() => setConfirmDelete(null)}
        />
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
