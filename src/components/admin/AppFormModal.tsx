import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { App } from '../../hooks/useApps';

/* ─── Types ───────────────────────────────────────────────────── */
interface AppFormModalProps {
  app: App | null;            // null = create mode
  onSave: (data: Partial<App> & { id: string }) => Promise<void>;
  onClose: () => void;
}

/* ─── Field row helper ────────────────────────────────────────── */
const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, children, hint }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{
      fontSize: '12px', fontWeight: 700, color: '#6E6E73',
      letterSpacing: '0.04em', textTransform: 'uppercase',
      fontFamily: 'var(--font-body)',
    }}>
      {label}
    </label>
    {children}
    {hint && <span style={{ fontSize: '11px', color: '#999' }}>{hint}</span>}
  </div>
);

/* ─── Input style ─────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(0,0,0,0.1)',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: '#1D1D1F',
  background: '#FAFAFA',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: '80px',
  resize: 'vertical' as const,
};

/* ─── Default empty app ──────────────────────────────────────── */
const emptyApp: Omit<App, 'created_at'> = {
  id: '',
  name: '',
  tagline: '',
  description: '',
  category: '',
  badge: '',
  features: [],
  accent_color: '#3713ec',
  bg_color: '#F5F5F7',
  bg_gradient: '',
  pricing_badge: '',
  pricing_model: 'free',
  price_label: '',
  cta_text: '',
  cta_href: '',
  is_internal: false,
  internal_route: null,
  video_src: null,
  poster_src: null,
  layout: 'text-left',
  sort_order: 99,
  is_active: true,
  is_coming_soon: false,
};

/* ─── Component ───────────────────────────────────────────────── */
const AppFormModal: React.FC<AppFormModalProps> = ({ app, onSave, onClose }) => {
  const isEdit = app !== null;
  const [form, setForm] = useState<Omit<App, 'created_at'>>(emptyApp);
  const [featuresText, setFeaturesText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (app) {
      const { created_at, ...rest } = app;
      setForm(rest);
      setFeaturesText((app.features ?? []).join('\n'));
    }
  }, [app]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id.trim() || !form.name.trim()) {
      setError('ID e Nome sono obbligatori');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...form,
        features: featuresText.split('\n').map(l => l.trim()).filter(Boolean),
      });
    } catch (err: any) {
      setError(err?.message ?? 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)', zIndex: 80,
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: '640px', maxHeight: '90vh',
          background: '#FFFFFF', borderRadius: '24px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          zIndex: 90, overflowY: 'auto',
          fontFamily: 'var(--font-body)',
        }}
      >
        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '28px',
          }}>
            <h2 style={{
              fontSize: '20px', fontWeight: 800, color: '#1D1D1F',
              margin: 0, fontFamily: 'var(--font-display)',
            }}>
              {isEdit ? `Modifica: ${form.name}` : 'Nuova App'}
            </h2>
            <button
              type="button" onClick={onClose}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: 'none', background: '#F5F5F7', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: '#FEF2F2', color: '#DC2626', fontSize: '13px',
              fontWeight: 600, marginBottom: '20px', border: '1px solid #FECACA',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Row: ID + Nome */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <Field label="ID (slug)" hint="Es: trading, ugc, ravvedimento">
                <input
                  style={inputStyle}
                  value={form.id}
                  onChange={(e) => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  disabled={isEdit}
                  placeholder="my-app"
                />
              </Field>
              <Field label="Nome">
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Nome App"
                />
              </Field>
            </div>

            {/* Tagline */}
            <Field label="Tagline">
              <input
                style={inputStyle}
                value={form.tagline ?? ''}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder="Breve frase promozionale"
              />
            </Field>

            {/* Description */}
            <Field label="Descrizione">
              <textarea
                style={textareaStyle}
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Descrizione completa dell'app"
              />
            </Field>

            {/* Row: Category + Badge */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Categoria" hint="Es: Legal AI, Finanza">
                <input
                  style={inputStyle}
                  value={form.category ?? ''}
                  onChange={(e) => set('category', e.target.value)}
                  placeholder="Emoji + Categoria"
                />
              </Field>
              <Field label="Badge">
                <input
                  style={inputStyle}
                  value={form.badge ?? ''}
                  onChange={(e) => set('badge', e.target.value)}
                  placeholder="Es: Legal AI"
                />
              </Field>
            </div>

            {/* Features (one per line) */}
            <Field label="Features (una per riga)" hint="Formato: emoji + testo">
              <textarea
                style={textareaStyle}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder={"📸 Upload foto prodotto\n🎬 Video AI generato in 60s"}
              />
            </Field>

            {/* Row: Accent Color + BG Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>
              <Field label="Colore accento">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={form.accent_color ?? '#3713ec'}
                    onChange={(e) => set('accent_color', e.target.value)}
                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={form.accent_color ?? ''}
                    onChange={(e) => set('accent_color', e.target.value)}
                  />
                </div>
              </Field>
              <Field label="BG Color">
                <input
                  style={inputStyle}
                  value={form.bg_color ?? ''}
                  onChange={(e) => set('bg_color', e.target.value)}
                  placeholder="#F5F5F7"
                />
              </Field>
              <Field label="BG Gradient">
                <input
                  style={inputStyle}
                  value={form.bg_gradient ?? ''}
                  onChange={(e) => set('bg_gradient', e.target.value)}
                  placeholder="linear-gradient(135deg, ...)"
                />
              </Field>
            </div>

            {/* Row: Pricing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <Field label="Pricing Badge">
                <input
                  style={inputStyle}
                  value={form.pricing_badge ?? ''}
                  onChange={(e) => set('pricing_badge', e.target.value)}
                  placeholder="Es: Da 9,90"
                />
              </Field>
              <Field label="Pricing Model">
                <select
                  style={inputStyle}
                  value={form.pricing_model ?? 'free'}
                  onChange={(e) => set('pricing_model', e.target.value)}
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="one-time">Acquisto</option>
                  <option value="subscription">Abbonamento</option>
                </select>
              </Field>
              <Field label="Price Label">
                <input
                  style={inputStyle}
                  value={form.price_label ?? ''}
                  onChange={(e) => set('price_label', e.target.value)}
                  placeholder="Gratis / Da 19/mese"
                />
              </Field>
            </div>

            {/* Row: CTA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <Field label="CTA Text">
                <input
                  style={inputStyle}
                  value={form.cta_text ?? ''}
                  onChange={(e) => set('cta_text', e.target.value)}
                  placeholder="Prova Gratis"
                />
              </Field>
              <Field label="CTA Link">
                <input
                  style={inputStyle}
                  value={form.cta_href ?? ''}
                  onChange={(e) => set('cta_href', e.target.value)}
                  placeholder="https://... o /app/my-app"
                />
              </Field>
            </div>

            {/* Row: Media */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Video Src" hint="Path relativo: /video/1.mp4">
                <input
                  style={inputStyle}
                  value={form.video_src ?? ''}
                  onChange={(e) => set('video_src', e.target.value || null)}
                />
              </Field>
              <Field label="Poster Src" hint="Path relativo: /images/1.png">
                <input
                  style={inputStyle}
                  value={form.poster_src ?? ''}
                  onChange={(e) => set('poster_src', e.target.value || null)}
                />
              </Field>
            </div>

            {/* Row: Layout + Sort + Route */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>
              <Field label="Layout">
                <select
                  style={inputStyle}
                  value={form.layout}
                  onChange={(e) => set('layout', e.target.value as 'text-left' | 'text-right')}
                >
                  <option value="text-left">Testo a sinistra</option>
                  <option value="text-right">Testo a destra</option>
                </select>
              </Field>
              <Field label="Ordine">
                <input
                  type="number"
                  style={inputStyle}
                  value={form.sort_order}
                  onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)}
                />
              </Field>
              <Field label="Route interna" hint="Es: /app/trading (vuoto = link esterno)">
                <input
                  style={inputStyle}
                  value={form.internal_route ?? ''}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    set('internal_route', v || null);
                    set('is_internal', !!v);
                  }}
                />
              </Field>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {([
                { key: 'is_active' as const, label: 'Attiva' },
                { key: 'is_coming_soon' as const, label: 'Coming Soon' },
                { key: 'is_internal' as const, label: 'Integrata' },
              ]).map(({ key, label }) => (
                <label key={key} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#1D1D1F',
                }}>
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#3713ec' }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex', gap: '12px', justifyContent: 'flex-end',
            marginTop: '32px', paddingTop: '24px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}>
            <button
              type="button" onClick={onClose}
              style={{
                padding: '12px 24px', borderRadius: '100px',
                border: '1px solid rgba(0,0,0,0.12)', background: '#fff',
                color: '#6E6E73', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-display)',
              }}
            >
              Annulla
            </button>
            <button
              type="submit" disabled={saving}
              style={{
                padding: '12px 28px', borderRadius: '100px',
                border: 'none', background: '#3713ec',
                color: '#fff', fontSize: '14px', fontWeight: 700,
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.6 : 1,
                fontFamily: 'var(--font-display)',
              }}
            >
              {saving ? 'Salvataggio...' : isEdit ? 'Salva modifiche' : 'Crea App'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
};

export default AppFormModal;
