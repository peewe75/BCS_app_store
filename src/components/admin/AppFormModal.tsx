'use client';

import React, { useState, useEffect } from 'react';

export interface AppFormData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  badge: string;
  features: string[];
  accent_color: string;
  bg_color: string;
  bg_gradient: string;
  pricing_badge: string;
  pricing_model: string;
  price_label: string;
  cta_text: string;
  cta_href: string;
  is_internal: boolean;
  internal_route: string;
  video_src: string;
  poster_src: string;
  layout: 'text-left' | 'text-right';
  sort_order: number;
  is_active: boolean;
  is_coming_soon: boolean;
}

const EMPTY_FORM: AppFormData = {
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
  cta_text: 'Apri',
  cta_href: '',
  is_internal: true,
  internal_route: '',
  video_src: '',
  poster_src: '',
  layout: 'text-left',
  sort_order: 10,
  is_active: true,
  is_coming_soon: false,
};

interface AppFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AppFormData, isNew: boolean) => Promise<void>;
  editingApp: AppFormData | null;
}

const s = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 100,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    background: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 720,
    maxHeight: '90vh',
    overflow: 'auto' as const,
    boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
  },
  header: {
    position: 'sticky' as const,
    top: 0,
    background: '#fff',
    padding: '24px 28px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
    borderRadius: '24px 24px 0 0',
  },
  body: { padding: '20px 28px 28px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } as React.CSSProperties,
  fieldFull: { gridColumn: '1 / -1' } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700 as const,
    color: '#6E6E73',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.1)',
    fontSize: 14,
    outline: 'none',
    background: '#FAFAFA',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.1)',
    fontSize: 14,
    background: '#FAFAFA',
    boxSizing: 'border-box' as const,
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 0',
  },
  section: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700 as const,
    color: '#3713ec',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  footer: {
    position: 'sticky' as const,
    bottom: 0,
    background: '#fff',
    padding: '16px 28px 24px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    borderRadius: '0 0 24px 24px',
  },
  btnPrimary: {
    padding: '12px 28px',
    borderRadius: 100,
    background: '#3713ec',
    color: '#fff',
    border: 'none',
    fontWeight: 700 as const,
    fontSize: 14,
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '12px 28px',
    borderRadius: 100,
    background: '#F5F5F7',
    color: '#1D1D1F',
    border: '1px solid rgba(0,0,0,0.08)',
    fontWeight: 600 as const,
    fontSize: 14,
    cursor: 'pointer',
  },
};

export default function AppFormModal({ isOpen, onClose, onSave, editingApp }: AppFormModalProps) {
  const [form, setForm] = useState<AppFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [featuresText, setFeaturesText] = useState('');
  const isNew = !editingApp;

  useEffect(() => {
    if (editingApp) {
      setForm(editingApp);
      setFeaturesText((editingApp.features ?? []).join('\n'));
    } else {
      setForm(EMPTY_FORM);
      setFeaturesText('');
    }
  }, [editingApp, isOpen]);

  if (!isOpen) return null;

  const update = (field: keyof AppFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        ...form,
        features: featuresText.split('\n').map((f) => f.trim()).filter(Boolean),
        internal_route: form.is_internal ? (form.internal_route || `/workspace/${form.id}`) : '',
      };
      await onSave(dataToSave, isNew);
      onClose();
    } catch {
      // errors handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <form
        style={s.modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div style={s.header}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{isNew ? 'Nuova App' : `Modifica: ${form.name}`}</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>
            &times;
          </button>
        </div>

        <div style={s.body}>
          {/* Identita */}
          <div style={s.grid}>
            <div>
              <label style={s.label}>ID (slug univoco)</label>
              <input
                style={s.input}
                value={form.id}
                onChange={(e) => update('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                disabled={!isNew}
                required
                placeholder="es. trading"
              />
            </div>
            <div>
              <label style={s.label}>Nome</label>
              <input style={s.input} value={form.name} onChange={(e) => update('name', e.target.value)} required placeholder="Trading Fiscale" />
            </div>
            <div style={s.fieldFull}>
              <label style={s.label}>Tagline</label>
              <input style={s.input} value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="Report fiscale professionale" />
            </div>
            <div style={s.fieldFull}>
              <label style={s.label}>Descrizione</label>
              <textarea
                style={{ ...s.input, minHeight: 70, resize: 'vertical' }}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Descrizione completa dell'app..."
              />
            </div>
          </div>

          {/* Categorizzazione */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Categorizzazione</div>
            <div style={s.grid}>
              <div>
                <label style={s.label}>Categoria</label>
                <input style={s.input} value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="Fiscale" />
              </div>
              <div>
                <label style={s.label}>Badge</label>
                <input style={s.input} value={form.badge} onChange={(e) => update('badge', e.target.value)} placeholder="Free" />
              </div>
              <div>
                <label style={s.label}>Layout</label>
                <select style={s.select} value={form.layout} onChange={(e) => update('layout', e.target.value)}>
                  <option value="text-left">Testo a sinistra</option>
                  <option value="text-right">Testo a destra</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Ordine</label>
                <input style={s.input} type="number" value={form.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Stile visivo */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Stile visivo</div>
            <div style={s.grid}>
              <div>
                <label style={s.label}>Colore accento</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.accent_color} onChange={(e) => update('accent_color', e.target.value)} style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input style={{ ...s.input, flex: 1 }} value={form.accent_color} onChange={(e) => update('accent_color', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={s.label}>Colore sfondo</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.bg_color} onChange={(e) => update('bg_color', e.target.value)} style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input style={{ ...s.input, flex: 1 }} value={form.bg_color} onChange={(e) => update('bg_color', e.target.value)} />
                </div>
              </div>
              <div style={s.fieldFull}>
                <label style={s.label}>Gradiente sfondo (CSS)</label>
                <input style={s.input} value={form.bg_gradient} onChange={(e) => update('bg_gradient', e.target.value)} placeholder="linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Pricing</div>
            <div style={s.grid}>
              <div>
                <label style={s.label}>Modello</label>
                <select style={s.select} value={form.pricing_model} onChange={(e) => update('pricing_model', e.target.value)}>
                  <option value="free">Gratuito</option>
                  <option value="freemium">Freemium</option>
                  <option value="one-time">Pagamento unico</option>
                  <option value="subscription">Abbonamento</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Badge prezzo</label>
                <input style={s.input} value={form.pricing_badge} onChange={(e) => update('pricing_badge', e.target.value)} placeholder="Gratis" />
              </div>
              <div style={s.fieldFull}>
                <label style={s.label}>Etichetta prezzo</label>
                <input style={s.input} value={form.price_label} onChange={(e) => update('price_label', e.target.value)} placeholder="Da 9,90 euro" />
              </div>
            </div>
          </div>

          {/* CTA + Routing */}
          <div style={s.section}>
            <div style={s.sectionTitle}>CTA & Routing</div>
            <div style={s.grid}>
              <div>
                <label style={s.label}>Testo CTA</label>
                <input style={s.input} value={form.cta_text} onChange={(e) => update('cta_text', e.target.value)} placeholder="Apri app" />
              </div>
              <div>
                <label style={s.label}>Link CTA (esterno)</label>
                <input style={s.input} value={form.cta_href} onChange={(e) => update('cta_href', e.target.value)} placeholder="https://..." />
              </div>
              <div style={s.fieldFull}>
                <label style={s.label}>Route interna</label>
                <input style={s.input} value={form.internal_route} onChange={(e) => update('internal_route', e.target.value)} placeholder={`/workspace/${form.id || 'slug'}`} disabled={!form.is_internal} />
              </div>
            </div>
          </div>

          {/* Media */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Media</div>
            <div style={s.grid}>
              <div>
                <label style={s.label}>Video src</label>
                <input style={s.input} value={form.video_src} onChange={(e) => update('video_src', e.target.value)} placeholder="/video/UGC_video.mp4" />
              </div>
              <div>
                <label style={s.label}>Poster src</label>
                <input style={s.input} value={form.poster_src} onChange={(e) => update('poster_src', e.target.value)} placeholder="/images/1.png" />
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Features (una per riga)</div>
            <textarea
              style={{ ...s.input, minHeight: 90, resize: 'vertical' }}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder={"🚀 Feature 1\n📊 Feature 2\n🔒 Feature 3"}
            />
          </div>

          {/* Toggles */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Stato</div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <label style={s.toggle}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} />
                <span style={{ fontSize: 14 }}>Attiva</span>
              </label>
              <label style={s.toggle}>
                <input type="checkbox" checked={form.is_internal} onChange={(e) => update('is_internal', e.target.checked)} />
                <span style={{ fontSize: 14 }}>Interna (dentro piattaforma)</span>
              </label>
              <label style={s.toggle}>
                <input type="checkbox" checked={form.is_coming_soon} onChange={(e) => update('is_coming_soon', e.target.checked)} />
                <span style={{ fontSize: 14 }}>Coming Soon</span>
              </label>
            </div>
          </div>
        </div>

        <div style={s.footer}>
          <button type="button" style={s.btnSecondary} onClick={onClose}>Annulla</button>
          <button type="submit" style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }} disabled={saving}>
            {saving ? 'Salvataggio...' : isNew ? 'Crea App' : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    </div>
  );
}
