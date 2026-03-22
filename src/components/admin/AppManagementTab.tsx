import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { App } from '../../hooks/useApps';
import { createApp, updateApp, deleteApp, toggleAppActive } from '../../hooks/useAppsCrud';
import AppFormModal from './AppFormModal';

/* ─── Props ───────────────────────────────────────────────────── */
interface AppManagementTabProps {
  apps: App[];
  loading: boolean;
  onRefetch: () => void;
}

/* ─── Status Badge ────────────────────────────────────────────── */
const StatusBadge: React.FC<{ active: boolean; comingSoon: boolean }> = ({ active, comingSoon }) => {
  if (comingSoon) return (
    <span style={{
      padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
      fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      background: '#f59e0b15', color: '#f59e0b',
    }}>
      Coming Soon
    </span>
  );
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
      fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      background: active ? '#10b98115' : '#ef444415',
      color: active ? '#10b981' : '#ef4444',
    }}>
      {active ? 'Attiva' : 'Disattivata'}
    </span>
  );
};

/* ─── Pricing Model Badge ─────────────────────────────────────── */
const PricingBadge: React.FC<{ model: string | null }> = ({ model }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    free: { bg: '#10b98115', color: '#10b981' },
    freemium: { bg: '#3b82f615', color: '#3b82f6' },
    'one-time': { bg: '#f59e0b15', color: '#f59e0b' },
    subscription: { bg: '#3713ec15', color: '#3713ec' },
  };
  const s = colors[model ?? 'free'] ?? colors.free;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
      fontWeight: 700, letterSpacing: '0.03em',
      background: s.bg, color: s.color,
    }}>
      {model ?? 'free'}
    </span>
  );
};

/* ─── Main Component ──────────────────────────────────────────── */
const AppManagementTab: React.FC<AppManagementTabProps> = ({ apps, loading, onRefetch }) => {
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSave = async (data: Partial<App> & { id: string }) => {
    setActionError(null);
    if (editingApp) {
      // Update
      const { error } = await updateApp(data);
      if (error) throw new Error(error);
    } else {
      // Create
      const { error } = await createApp(data as any);
      if (error) throw new Error(error);
    }
    setEditingApp(null);
    setShowCreate(false);
    onRefetch();
  };

  const handleToggle = async (app: App) => {
    setActionError(null);
    const { error } = await toggleAppActive(app.id, !app.is_active);
    if (error) {
      setActionError(error);
    } else {
      onRefetch();
    }
  };

  const handleDelete = async (id: string) => {
    setActionError(null);
    const { error } = await deleteApp(id);
    if (error) {
      setActionError(error);
    } else {
      setConfirmDelete(null);
      onRefetch();
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{
            fontSize: '17px', fontWeight: 700, color: '#1D1D1F',
            margin: 0, fontFamily: 'var(--font-display)',
          }}>
            Gestione App
          </h2>
          <span style={{
            padding: '2px 10px', borderRadius: '100px',
            background: '#F5F5F7', fontSize: '12px', fontWeight: 700, color: '#6E6E73',
          }}>
            {apps.length}
          </span>
        </div>
        <button
          onClick={() => { setEditingApp(null); setShowCreate(true); }}
          style={{
            padding: '10px 20px', borderRadius: '100px',
            border: 'none', background: '#3713ec', color: '#fff',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Nuova App
        </button>
      </div>

      {/* Error banner */}
      {actionError && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px',
          background: '#FEF2F2', color: '#DC2626', fontSize: '13px',
          fontWeight: 600, marginBottom: '16px', border: '1px solid #FECACA',
        }}>
          {actionError}
        </div>
      )}

      {/* App Table */}
      <div style={{
        background: '#FFFFFF', borderRadius: '24px',
        border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['#', 'App', 'Categoria', 'Pricing', 'Stato', 'Tipo', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '12px 16px', fontSize: '11px', fontWeight: 700,
                    color: '#6E6E73', letterSpacing: '0.06em', textTransform: 'uppercase',
                    background: '#FAFAFA', fontFamily: 'var(--font-body)',
                    textAlign: i === 6 ? 'right' : 'left',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      border: '3px solid #3713ec', borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite', margin: '0 auto',
                    }} />
                  </td>
                </tr>
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '15px', color: '#6E6E73', margin: 0 }}>
                      Nessuna app configurata. Clicca "Nuova App" per iniziare.
                    </p>
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Sort order */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6E6E73', fontWeight: 600 }}>
                      {app.sort_order}
                    </td>

                    {/* Name + ID */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '12px',
                          background: `${app.accent_color ?? '#3713ec'}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <div style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            background: app.accent_color ?? '#3713ec',
                          }} />
                        </div>
                        <div>
                          <p style={{
                            fontSize: '14px', fontWeight: 700, color: '#1D1D1F', margin: 0,
                            fontFamily: 'var(--font-display)',
                          }}>
                            {app.name}
                          </p>
                          <p style={{ fontSize: '11px', color: '#999', margin: '2px 0 0', fontFamily: 'monospace' }}>
                            {app.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555', maxWidth: '150px' }}>
                      {app.category ?? '—'}
                    </td>

                    {/* Pricing */}
                    <td style={{ padding: '14px 16px' }}>
                      <PricingBadge model={app.pricing_model} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge active={app.is_active} comingSoon={app.is_coming_soon} />
                    </td>

                    {/* Internal / External */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6E6E73', fontWeight: 600 }}>
                      {app.is_internal ? (
                        <span style={{ color: '#3713ec' }}>Integrata</span>
                      ) : (
                        <span>Esterna</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {/* Edit */}
                        <button
                          onClick={() => { setEditingApp(app); setShowCreate(false); }}
                          title="Modifica"
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: 'none', background: '#F5F5F7', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                              stroke="#6E6E73" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                              stroke="#6E6E73" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggle(app)}
                          title={app.is_active ? 'Disattiva' : 'Attiva'}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: 'none',
                            background: app.is_active ? '#10b98115' : '#f5f5f7',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {app.is_active ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#10b981" strokeWidth="1.8" />
                              <circle cx="12" cy="12" r="3" stroke="#10b981" strokeWidth="1.8" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"
                                stroke="#6E6E73" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setConfirmDelete(app.id)}
                          title="Elimina"
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: 'none', background: '#FEF2F2', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
                              stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {(editingApp || showCreate) && (
          <AppFormModal
            app={editingApp}
            onSave={handleSave}
            onClose={() => { setEditingApp(null); setShowCreate(false); }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)', zIndex: 80,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#fff', borderRadius: '20px', padding: '32px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.2)', zIndex: 90,
                width: '100%', maxWidth: '380px', textAlign: 'center',
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: '#FEF2F2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
                    stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '18px', fontWeight: 800, color: '#1D1D1F',
                margin: '0 0 8px', fontFamily: 'var(--font-display)',
              }}>
                Elimina app?
              </h3>
              <p style={{ fontSize: '14px', color: '#6E6E73', margin: '0 0 24px' }}>
                Questa azione non puo essere annullata. L'app "{confirmDelete}" verra rimossa definitivamente.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setConfirmDelete(null)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.12)', background: '#fff',
                    color: '#6E6E73', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    border: 'none', background: '#ef4444',
                    color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Elimina
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppManagementTab;
