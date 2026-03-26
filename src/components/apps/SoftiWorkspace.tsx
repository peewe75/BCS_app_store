'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient } from '@/src/lib/supabase/public';
import type { Mt5Signal, AiReport, SoftiTab } from '@/src/apps/softi/types';
import {
  fetchSignals,
  fetchReports,
  generateReport,
  deleteReport,
  analyzeSymbols,
} from '@/src/apps/softi/api-client';

const ACCENT = '#6366f1';

const TABS: { id: SoftiTab; label: string }[] = [
  { id: 'feed', label: '📡 Market Feed' },
  { id: 'analysis', label: '🔍 Analisi AI' },
  { id: 'reports', label: '📊 Report' },
  { id: 'chat', label: '💬 Chat' },
];

function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 700, background: color ?? '#eef2ff', color: ACCENT,
    }}>{children}</span>
  );
}

function ConfidenceBar({ value }: { value: number | null }) {
  const pct = value != null ? Math.round(Math.min(Math.max(value * 100, 0), 100)) : 0;
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color: '#6b7280', minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

// --- Tabs ---

function FeedTab({ signals, loading }: { signals: Mt5Signal[]; loading: boolean }) {
  if (loading) return <div style={{ color: '#9ca3af', padding: 32, textAlign: 'center' }}>Caricamento segnali…</div>;
  if (signals.length === 0) return (
    <div style={{ color: '#9ca3af', padding: 48, textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
      <div style={{ fontWeight: 600 }}>Nessun segnale disponibile</div>
      <div style={{ fontSize: 13, marginTop: 6 }}>
        Configura l&apos;EA MT5 per inviare segnali a:<br />
        <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
          POST /api/softi/mt5/webhook
        </code>
      </div>
    </div>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            {['Simbolo', 'Azione', 'Confidenza', 'Regime', 'Wyckoff', 'Data'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {signals.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px 12px', fontWeight: 700, color: ACCENT }}>{s.symbol}</td>
              <td style={{ padding: '8px 12px' }}>
                <Badge color={s.action === 'BUY' ? '#d1fae5' : s.action === 'SELL' ? '#fee2e2' : '#f3f4f6'}>
                  {s.action ?? '—'}
                </Badge>
              </td>
              <td style={{ padding: '8px 12px', minWidth: 120 }}>
                <ConfidenceBar value={s.confidence_score} />
              </td>
              <td style={{ padding: '8px 12px', color: '#6b7280' }}>{s.market_regime ?? '—'}</td>
              <td style={{ padding: '8px 12px', color: '#6b7280' }}>{s.wyckoff_phase ?? '—'}</td>
              <td style={{ padding: '8px 12px', color: '#9ca3af', fontSize: 11 }}>
                {new Date(s.created_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalysisTab() {
  const [symbols, setSymbols] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    const syms = symbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (syms.length === 0) return;
    setLoading(true); setError(''); setResult('');
    try {
      const { analysis } = await analyzeSymbols({ symbols: syms, mode: 'analysis' });
      setResult(analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore analisi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
          Simboli da analizzare
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={symbols}
            onChange={e => setSymbols(e.target.value)}
            placeholder="EURUSD, XAUUSD, GBPJPY"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none',
            }}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: loading ? '#e0e7ff' : ACCENT, color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Analisi…' : 'Analizza'}
          </button>
        </div>
      </div>
      {error && <div style={{ color: '#ef4444', fontSize: 13, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
      {result && (
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: '16px 20px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap',
          maxHeight: 480, overflowY: 'auto',
        }}>{result}</div>
      )}
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState<AiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports().then(setReports).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true); setError('');
    try {
      const report = await generateReport({ timeframe });
      setReports(prev => [report, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore generazione');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteReport(id);
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {(['daily', 'weekly', 'monthly'] as const).map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            style={{
              padding: '6px 16px', borderRadius: 8, border: `1.5px solid ${timeframe === tf ? ACCENT : '#d1d5db'}`,
              background: timeframe === tf ? '#eef2ff' : '#fff', color: timeframe === tf ? ACCENT : '#374151',
              fontWeight: timeframe === tf ? 700 : 400, fontSize: 13, cursor: 'pointer',
            }}
          >
            {tf === 'daily' ? 'Giornaliero' : tf === 'weekly' ? 'Settimanale' : 'Mensile'}
          </button>
        ))}
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            marginLeft: 'auto', padding: '8px 20px', borderRadius: 10, border: 'none',
            background: generating ? '#e0e7ff' : ACCENT, color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: generating ? 'not-allowed' : 'pointer',
          }}
        >
          {generating ? 'Generazione…' : '+ Genera Report'}
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: 32 }}>Caricamento…</div>
      ) : reports.length === 0 ? (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div>Nessun report generato</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map(r => (
            <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', cursor: 'pointer', background: '#fafafa',
                }}
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <Badge>{r.timeframe}</Badge>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
                  Report {r.timeframe === 'daily' ? 'giornaliero' : r.timeframe === 'weekly' ? 'settimanale' : 'mensile'}
                </span>
                <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
                  {new Date(r.created_at).toLocaleDateString('it-IT')}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16, padding: '0 4px' }}
                >🗑</button>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{expanded === r.id ? '▲' : '▼'}</span>
              </div>
              {expanded === r.id && (
                <div style={{
                  padding: '16px 20px', fontSize: 13, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', background: '#fff', maxHeight: 400, overflowY: 'auto',
                }}>
                  {r.markdown_content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatTab() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { analysis } = await analyzeSymbols({ prompt: userMsg, mode: 'chat' });
      setMessages(prev => [...prev, { role: 'ai', text: analysis }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Errore risposta AI. Riprova.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 460 }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0 8px' }}>
        {messages.length === 0 && (
          <div style={{ color: '#9ca3af', textAlign: 'center', paddingTop: 60, fontSize: 14 }}>
            💬 Fai una domanda sui mercati o sui tuoi segnali MT5
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
              background: m.role === 'user' ? ACCENT : '#f3f4f6',
              color: m.role === 'user' ? '#fff' : '#1f2937',
              fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '10px 14px', borderRadius: 12, background: '#f3f4f6', color: '#9ca3af', fontSize: 13 }}>
              Analisi in corso…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Chiedi qualcosa sui mercati…"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: loading || !input.trim() ? '#e0e7ff' : ACCENT,
            color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >Invia</button>
      </div>
    </div>
  );
}

// --- Main Workspace ---

export default function SoftiWorkspace() {
  const { getToken } = useAuth();
  const [tab, setTab] = useState<SoftiTab>('feed');
  const [signals, setSignals] = useState<Mt5Signal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(true);

  // Carica segnali iniziali
  useEffect(() => {
    fetchSignals({ limit: 100 })
      .then(setSignals)
      .catch(() => {})
      .finally(() => setSignalsLoading(false));
  }, []);

  // Supabase Realtime per nuovi segnali
  useEffect(() => {
    const supabase = createClerkSupabaseBrowserClient(getToken);
    if (!supabase) return;

    const channel = supabase
      .channel('softi_signals_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'softi_mt5_signals' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          setSignals(prev => [payload.new as Mt5Signal, ...prev].slice(0, 200));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
        borderBottom: '1px solid #c7d2fe',
        padding: '24px 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#fff', fontWeight: 800,
          }}>S</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b' }}>Softi AI Analyzer</div>
            <div style={{ fontSize: 13, color: '#6366f1' }}>Analisi AI dei mercati · Powered by Gemini</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: signals.length > 0 ? '#10b981' : '#9ca3af',
            }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {signals.length > 0 ? `${signals.length} segnali` : 'In attesa segnali'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', background: '#fff', padding: '0 32px' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? ACCENT : '#6b7280',
                borderBottom: tab === t.id ? `2px solid ${ACCENT}` : '2px solid transparent',
                fontSize: 14, transition: 'all 0.15s',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px' }}>
        {tab === 'feed' && <FeedTab signals={signals} loading={signalsLoading} />}
        {tab === 'analysis' && <AnalysisTab />}
        {tab === 'reports' && <ReportsTab />}
        {tab === 'chat' && <ChatTab />}
      </div>
    </div>
  );
}
