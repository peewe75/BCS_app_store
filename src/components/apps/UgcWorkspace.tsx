'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public';

type UgcVideo = {
  id: string;
  product_image_url: string | null;
  video_url: string | null;
  status: string | null;
  prompt?: string | null;
  product_name?: string | null;
  style?: string | null;
  created_at: string;
};

const accent = '#ec4899';
const card: React.CSSProperties = { padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' };

const STYLES = [
  { id: 'professional', label: 'Professionale', emoji: '💼' },
  { id: 'playful', label: 'Giocoso', emoji: '🎨' },
  { id: 'minimal', label: 'Minimale', emoji: '⬜' },
  { id: 'luxury', label: 'Lusso', emoji: '✨' },
  { id: 'energetic', label: 'Energetico', emoji: '⚡' },
  { id: 'natural', label: 'Naturale', emoji: '🌿' },
];

export default function UgcWorkspace() {
  const { getToken, userId } = useAuth();
  const [videos, setVideos] = useState<UgcVideo[]>([]);

  // Form state
  const [productName, setProductName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load history
  const loadVideos = useCallback(async () => {
    if (!userId) return;
    const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase;
    if (!client) return;
    const { data } = await client
      .from('ugc_videos')
      .select('id, product_image_url, video_url, status, prompt, product_name, style, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    setVideos((data as UgcVideo[] | null) ?? []);
  }, [getToken, userId]);

  useEffect(() => { void loadVideos(); }, [loadVideos]);

  // Generate
  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const res = await fetch('/api/ugc/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, prompt, style }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Errore nella generazione');
      } else if (json.imageUrl) {
        setGeneratedImage(json.imageUrl);
        await loadVideos();
      } else {
        setError('Nessuna immagine generata. Riprova con un prompt diverso.');
      }
    } catch {
      setError('Errore di connessione.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setProductName('');
    setPrompt('');
    setStyle('professional');
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Header */}
      <section style={card}>
        <p style={{ margin: '0 0 8px', color: accent, fontWeight: 700, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.06em' }}>UGC Ad Creator</p>
        <h1 style={{ margin: '0 0 10px', fontSize: 34, fontFamily: 'var(--font-display)' }}>Crea contenuti pubblicitari con AI</h1>
        <p style={{ margin: 0, color: '#6E6E73', lineHeight: 1.6 }}>
          Genera immagini pubblicitarie professionali per i tuoi prodotti usando Google Gemini. Perfette per TikTok, Instagram e Facebook Ads.
        </p>
      </section>

      {/* Generator form */}
      <section style={card}>
        <h2 style={{ margin: '0 0 20px', fontFamily: 'var(--font-display)' }}>Genera nuovo contenuto</h2>

        <div style={{ display: 'grid', gap: 16 }}>
          {/* Product name */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 6 }}>Nome prodotto *</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="es. Crema viso idratante Bio"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontSize: 15, background: '#FAFAFA', boxSizing: 'border-box' }}
            />
          </div>

          {/* Style selector */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 8 }}>Stile visivo</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 100,
                    border: style === s.id ? `2px solid ${accent}` : '2px solid rgba(0,0,0,0.06)',
                    background: style === s.id ? `${accent}10` : '#fff',
                    color: style === s.id ? accent : '#333',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 6 }}>Descrizione aggiuntiva (opzionale)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="es. Sfondo rosa con fiori, testo grande con lo sconto del 20%, stile Instagram Stories..."
              rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontSize: 14, background: '#FAFAFA', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: 14, borderRadius: 12, background: '#FEF2F2', color: '#991B1B', fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {generatedImage && (
              <button onClick={handleReset} style={{ padding: '12px 24px', borderRadius: 100, background: '#F5F5F7', color: '#333', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600, cursor: 'pointer' }}>
                Nuovo
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={!productName.trim() || generating}
              style={{
                padding: '12px 28px',
                borderRadius: 100,
                background: productName.trim() && !generating ? accent : '#E5E7EB',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: productName.trim() && !generating ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {generating && (
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              )}
              {generating ? 'Generazione in corso...' : 'Genera con AI'}
            </button>
          </div>
        </div>
      </section>

      {/* Generated result */}
      {generatedImage && (
        <section style={card}>
          <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)' }}>Risultato</h2>
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', maxWidth: 600, margin: '0 auto' }}>
            <img
              src={generatedImage}
              alt={`UGC per ${productName}`}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a
              href={generatedImage}
              download={`ugc-${productName.replace(/\s+/g, '-').toLowerCase()}.png`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 100,
                background: accent,
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              📥 Scarica immagine
            </a>
          </div>
        </section>
      )}

      {/* History */}
      <section style={card}>
        <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)' }}>Generazioni recenti</h2>
        {videos.length === 0 ? (
          <div style={{ padding: 20, borderRadius: 14, background: '#FDF2F8', color: '#9D174D', fontSize: 14 }}>
            Nessun contenuto generato. Inserisci il nome del tuo prodotto per iniziare.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {videos.map((v) => (
              <article key={v.id} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', background: '#FAFAFA' }}>
                {v.video_url && v.video_url.startsWith('data:image') ? (
                  <img src={v.video_url} alt={v.product_name ?? ''} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent}08`, color: accent }}>
                    {v.status === 'processing' ? '⏳' : v.status === 'failed' ? '❌' : '🖼️'}
                  </div>
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{v.product_name ?? 'Senza nome'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 100,
                      fontSize: 10,
                      fontWeight: 700,
                      background: v.status === 'completed' ? '#D1FAE5' : v.status === 'processing' ? '#FEF3C7' : '#FEE2E2',
                      color: v.status === 'completed' ? '#065F46' : v.status === 'processing' ? '#92400E' : '#991B1B',
                    }}>
                      {v.status ?? 'pending'}
                    </span>
                    <span style={{ fontSize: 11, color: '#999' }}>{new Date(v.created_at).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
