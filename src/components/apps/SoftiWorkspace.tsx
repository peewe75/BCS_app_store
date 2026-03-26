'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient } from '@/src/lib/supabase/public';
import {
  BarChart3, LayoutDashboard, Database, Zap, FileBarChart, Settings,
  Search, RefreshCw, Loader2, Sparkles, ChevronRight, Star,
  ArrowUpRight, ArrowDownRight, Minus, Globe2, TrendingUp, Activity,
  Newspaper, MousePointerClick, Filter, Send, Bot, User as UserIcon,
  Upload, Play, Square,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mt5Signal, AiReport } from '@/src/apps/softi/types';
import {
  fetchSignals,
  fetchReports,
  generateReport as apiGenerateReport,
  deleteReport as apiDeleteReport,
  analyzeSymbols,
} from '@/src/apps/softi/api-client';
import { ASSET_DATABASE, type Asset } from '@/src/apps/softi/market';

// ─── Types ───────────────────────────────────────────────────────────────────

type SoftiView = 'overview' | 'analysis' | 'automation' | 'reports';

interface MarketRow {
  symbol: string;
  price: string | null;
  market_regime: string | null;
  bias_h4: string | null;
  bias_d1: string | null;
  bias_w1: string | null;
  wyckoff_phase: string | null;
  wyckoff_event: string | null;
  liquidity_above: boolean;
  liquidity_below: boolean;
  liquidity_sweep: boolean;
  confidence_score: number | null;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cx(...args: (string | boolean | undefined | null)[]): string {
  return args.filter(Boolean).join(' ');
}

function signalToRow(s: Mt5Signal): MarketRow {
  const p = (s.raw_payload ?? {}) as Record<string, unknown>;
  return {
    symbol: s.symbol,
    price: (p.price as string) ?? null,
    market_regime: s.market_regime,
    bias_h4: (p.bias_h4 as string) ?? null,
    bias_d1: (p.bias_d1 as string) ?? null,
    bias_w1: (p.bias_w1 as string) ?? null,
    wyckoff_phase: s.wyckoff_phase,
    wyckoff_event: (p.wyckoff_event as string) ?? null,
    liquidity_above: Boolean(p.liquidity_above),
    liquidity_below: Boolean(p.liquidity_below),
    liquidity_sweep: Boolean(p.liquidity_sweep),
    confidence_score: s.confidence_score,
    updated_at: s.created_at,
  };
}

function confidencePct(score?: number | null): number {
  if (typeof score !== 'number' || isNaN(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

function confidenceColor(pct: number): string {
  if (pct >= 80) return '#F2CC60';
  if (pct >= 60) return '#3FB950';
  if (pct >= 40) return '#7DCBFF';
  return '#F85149';
}

// SVG semicircle gauge (no recharts needed)
function ConfidenceGauge({ score }: { score?: number | null }) {
  const pct = confidencePct(score);
  const fill = confidenceColor(pct);
  // Arc: center (40,38), radius 28 — stroke-dasharray on semicircle path
  // Total semicircle length = π * 28 ≈ 87.96
  const totalLen = 87.96;
  const dashLen = (pct / 100) * totalLen;

  return (
    <div style={{ position: 'relative', width: 80, height: 50 }}>
      <svg width="80" height="50" viewBox="0 0 80 50">
        {/* Track */}
        <path d="M12,38 A28,28 0 0,1 68,38" fill="none" stroke="#21262D" strokeWidth="8" strokeLinecap="round" />
        {/* Fill */}
        <path
          d="M12,38 A28,28 0 0,1 68,38"
          fill="none"
          stroke={fill}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dashLen} ${totalLen}`}
        />
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 900, color: fill, display: 'block' }}>{pct}%</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#6E7681', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Confidence</span>
      </div>
    </div>
  );
}

// Simple markdown-to-formatted-text renderer
function MarkdownText({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div style={{ fontFamily: 'inherit', lineHeight: 1.7, color: '#C9D1D9' }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} style={{ fontSize: 15, fontWeight: 900, color: '#E1E4E8', margin: '16px 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '20px 0 8px' }}>{line.slice(2)}</h1>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} style={{ fontSize: 13, fontWeight: 700, color: '#8B949E', margin: '12px 0 4px', textTransform: 'uppercase' }}>{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <p key={i} style={{ margin: '2px 0', paddingLeft: 16, position: 'relative', fontSize: 13 }}>
            <span style={{ position: 'absolute', left: 0, color: '#00A3FF' }}>•</span>
            {line.slice(2)}
          </p>;
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} style={{ margin: '2px 0', fontSize: 13 }}>{line}</p>;
      })}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: SoftiView; icon: React.ComponentType<{ size?: number; color?: string; className?: string }>; label: string; desc: string }[] = [
  { id: 'overview', icon: LayoutDashboard, label: 'Market Overview', desc: 'Real-time global market grid' },
  { id: 'analysis', icon: Database, label: 'Interactive Analysis', desc: 'Deep dive AI research' },
  { id: 'automation', icon: Zap, label: 'EA Automation', desc: 'MT5 Bridge active' },
  { id: 'reports', icon: FileBarChart, label: 'Market Reports', desc: 'Daily/Weekly intelligence' },
];

function Sidebar({ active, setActive }: { active: SoftiView; setActive: (v: SoftiView) => void }) {
  return (
    <aside style={{
      width: 256,
      minWidth: 256,
      background: '#141921',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #2D333B',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #2D333B' }}>
        <div style={{ background: '#00A3FF', padding: 8, borderRadius: 10, boxShadow: '0 0 16px rgba(0,163,255,0.3)' }}>
          <BarChart3 size={20} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, color: '#fff', fontSize: 18, letterSpacing: '-0.03em' }}>
          SOFTI <span style={{ color: '#00A3FF' }}>PRO</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                textAlign: 'left', width: '100%', transition: 'all 0.15s',
                background: isActive ? '#00A3FF' : 'transparent',
                boxShadow: isActive ? '0 4px 16px rgba(0,163,255,0.25)' : 'none',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#1C2128'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Icon size={20} color={isActive ? '#fff' : '#8B949E'} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: isActive ? '#fff' : '#C9D1D9', letterSpacing: '-0.01em' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: isActive ? 'rgba(255,255,255,0.7)' : '#6E7681' }}>{item.desc}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid #2D333B' }}>
        <div style={{ padding: '8px 14px', borderRadius: 10, background: '#0D1117', border: '1px solid #30363D' }}>
          <p style={{ margin: 0, fontSize: 10, color: '#6E7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Webhook MT5</p>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: '#00A3FF', fontFamily: 'monospace', wordBreak: 'break-all' }}>POST /api/softi/mt5/webhook</p>
        </div>
      </div>
    </aside>
  );
}

// ─── TopBar ──────────────────────────────────────────────────────────────────

function TopBar({ isLoading, isBridgeActive, lastUpdate, onRefresh }: {
  isLoading: boolean;
  isBridgeActive: boolean;
  lastUpdate: Date;
  onRefresh: () => void;
}) {
  return (
    <header style={{
      height: 72, background: 'rgba(13,17,23,0.9)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #30363D', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 40,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400, flex: 1 }}>
        <Search size={16} color="#8B949E" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search assets, news, or ask Trading Genius..."
          style={{
            width: '100%', background: '#161B22', border: '1px solid #30363D', borderRadius: 12,
            padding: '10px 14px 10px 40px', fontSize: 13, color: '#E1E4E8', outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = '#00A3FF')}
          onBlur={e => (e.target.style.borderColor = '#30363D')}
        />
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Bridge status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isBridgeActive ? '#238636' : '#DA3633',
              boxShadow: isBridgeActive ? '0 0 8px #238636' : 'none',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              {isBridgeActive ? 'Bridge Active' : 'Bridge Offline'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 10, color: '#484F58' }}>MT5 Gateway v2.9</p>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
            background: '#161B22', border: '1px solid #30363D', borderRadius: 12,
            cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#30363D'; }}
          onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#161B22'; }}
          title={`Last update: ${lastUpdate.toLocaleTimeString()}`}
        >
          {isLoading
            ? <Loader2 size={16} color="#00A3FF" style={{ animation: 'spin 1s linear infinite' }} />
            : <RefreshCw size={16} color="#8B949E" />}
          <span style={{ fontSize: 12, fontWeight: 700, color: '#8B949E' }}>Refresh</span>
        </button>

        <div style={{ width: 1, height: 28, background: '#30363D' }} />

        {/* PRO badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(35,134,54,0.1)', border: '1px solid rgba(35,134,54,0.2)', borderRadius: 8 }}>
          <Sparkles size={13} color="#3FB950" />
          <span style={{ fontSize: 10, fontWeight: 900, color: '#3FB950', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PRO PLAN</span>
        </div>
      </div>
    </header>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ marketRows, assets, selectedAssets, toggleAsset, expandedCats, toggleCat, isLoading, lastUpdate, onOpenAnalysis }: {
  marketRows: MarketRow[];
  assets: Asset[];
  selectedAssets: string[];
  toggleAsset: (id: string) => void;
  expandedCats: string[];
  toggleCat: (c: string) => void;
  isLoading: boolean;
  lastUpdate: Date;
  onOpenAnalysis: (symbol: string) => void;
}) {
  const categories = Array.from(new Set(assets.map(a => a.category)));
  const avgConf = marketRows.length > 0
    ? Math.round(marketRows.reduce((s, r) => s + (r.confidence_score || 0), 0) / marketRows.length * 100)
    : 0;
  const liquiditySweeps = marketRows.filter(r => r.liquidity_sweep).length;
  const lastMt5 = marketRows[0]?.updated_at
    ? new Date(marketRows[0].updated_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    : lastUpdate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const stats = [
    { label: 'MT5 Stream', value: marketRows.length > 0 ? `${marketRows.length} symbols` : 'Waiting', hint: marketRows[0]?.symbol ? `Top: ${marketRows[0].symbol}` : 'No packets yet', color: '#00A3FF', Icon: Globe2 },
    { label: 'Avg Confidence', value: `${avgConf}%`, hint: 'From live market overview', color: '#F2CC60', Icon: TrendingUp },
    { label: 'Liquidity Sweeps', value: String(liquiditySweeps), hint: 'Active sweep signals', color: '#3FB950', Icon: Activity },
    { label: 'Last MT5 Update', value: lastMt5, hint: 'Latest bridge timestamp', color: '#7DCBFF', Icon: Newspaper },
  ];

  // Build price map from signals for Global Asset Matrix
  const priceBySymbol = new Map<string, string>(marketRows.filter(r => r.price).map(r => [r.symbol, r.price!]));

  return (
    <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 20, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 14, padding: 10 }}>
                <s.Icon size={18} color={s.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.22em' }}>{s.label}</p>
                <p style={{ margin: '3px 0 2px', fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#6E7681' }}>{s.hint}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MT5 Stream Table */}
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 24, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1C2128', padding: '14px 24px', borderBottom: '1px solid #30363D' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.22em' }}>Market Overview (MT5 Stream)</h3>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6E7681' }}>Click su un asset per aprire Interactive Analysis con l&apos;ultimo analyzer JSON.</p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,163,255,0.1)', border: '1px solid rgba(0,163,255,0.3)', borderRadius: 100, padding: '5px 12px', fontSize: 10, fontWeight: 700, color: '#7DCBFF', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            <MousePointerClick size={11} /> Click to inspect
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363D' }}>
                {['Asset', 'Price', 'Market Regime', 'Bias (H4/D1/W1)', 'Wyckoff', 'Liquidity', 'Confidence Arc'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 700, color: '#6E7681', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marketRows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#6E7681' }}>
                  Nessun pacchetto MT5 ricevuto. Il bridge popolerà questa griglia in tempo reale.
                </td></tr>
              ) : marketRows.map(row => (
                <tr
                  key={row.symbol}
                  onClick={() => onOpenAnalysis(row.symbol)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid rgba(48,54,61,0.5)', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1C2128'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', display: 'block' }}>{row.symbol}</span>
                    <span style={{ fontSize: 10, color: '#6E7681', textTransform: 'uppercase' }}>
                      {new Date(row.updated_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', fontFamily: 'monospace', fontSize: 13, color: '#C9D1D9' }}>{row.price ?? 'N/A'}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, color: '#8B949E', textTransform: 'uppercase' }}>
                      {row.market_regime || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 11, color: '#8B949E' }}>
                    {`${row.bias_h4 || 'N/A'} / ${row.bias_d1 || 'N/A'} / ${row.bias_w1 || 'N/A'}`}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    {row.wyckoff_phase
                      ? <span style={{ background: 'rgba(139,148,158,0.1)', border: '1px solid rgba(139,148,158,0.3)', borderRadius: 5, padding: '3px 8px', fontSize: 11, color: '#C9D1D9' }}>
                          {row.wyckoff_phase}{row.wyckoff_event ? ` - ${row.wyckoff_event}` : ''}
                        </span>
                      : <span style={{ color: '#484F58' }}>-</span>}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {row.liquidity_above && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00A3FF', display: 'inline-block' }} title="Liquidity Above" />}
                      {row.liquidity_below && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F85149', display: 'inline-block' }} title="Liquidity Below" />}
                      {row.liquidity_sweep && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E3B341', display: 'inline-block' }} title="Liquidity Sweep" />}
                      {!row.liquidity_above && !row.liquidity_below && !row.liquidity_sweep && <span style={{ color: '#484F58' }}>-</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ConfidenceGauge score={row.confidence_score} />
                      <div>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#6E7681', textTransform: 'uppercase' }}>Signal quality</p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 900, color: confidenceColor(confidencePct(row.confidence_score)) }}>
                          {typeof row.confidence_score === 'number'
                            ? confidencePct(row.confidence_score) >= 80 ? 'High conviction'
                            : confidencePct(row.confidence_score) >= 60 ? 'Constructive'
                            : 'Developing'
                            : 'No signal'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Asset Matrix */}
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 24, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1C2128', padding: '14px 24px', borderBottom: '1px solid #30363D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.22em' }}>Global Asset Matrix</h3>
            <span style={{ background: 'rgba(35,134,54,0.1)', border: '1px solid rgba(35,134,54,0.2)', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#3FB950' }}>LIVE</span>
            <span style={{ background: 'rgba(0,163,255,0.1)', border: '1px solid rgba(0,163,255,0.2)', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#7DCBFF' }}>AI GROUNDED</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#8B949E' }}><Search size={15} /></button>
            <button style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#8B949E' }}><Filter size={15} /></button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363D' }}>
                {['#', 'Symbol', 'Price', '24h Change', 'Sector', 'Action'].map((h, idx) => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 700, color: '#6E7681', textTransform: 'uppercase', letterSpacing: '0.18em', textAlign: idx === 5 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                const catAssets = assets.filter(a => a.category === cat);
                const isExpanded = expandedCats.includes(cat);
                return [
                  <tr
                    key={`cat-${cat}`}
                    onClick={() => toggleCat(cat)}
                    style={{ cursor: 'pointer', background: 'rgba(13,17,23,0.5)', borderBottom: '1px solid rgba(48,54,61,0.5)', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#161B22'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(13,17,23,0.5)'}
                  >
                    <td colSpan={6} style={{ padding: '10px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ChevronRight size={13} color="#8B949E" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#C9D1D9' }}>{cat}</span>
                        <span style={{ fontSize: 10, color: '#484F58' }}>({catAssets.length} assets)</span>
                      </div>
                    </td>
                  </tr>,
                  ...(isExpanded ? catAssets.map(asset => {
                    const isSelected = selectedAssets.includes(asset.id);
                    const livePrice = priceBySymbol.get(asset.symbol);
                    return (
                      <tr
                        key={asset.id}
                        style={{ borderBottom: '1px solid rgba(48,54,61,0.3)', background: isSelected ? 'rgba(0,163,255,0.05)' : 'transparent', transition: 'background 0.12s' }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#1C2128'; }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = isSelected ? 'rgba(0,163,255,0.05)' : 'transparent'; }}
                      >
                        <td style={{ padding: '10px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleAsset(asset.id)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: isSelected ? '#E36209' : '#484F58' }}
                          >
                            <Star size={13} fill={isSelected ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td style={{ padding: '10px 20px' }}>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', display: 'block' }}>{asset.symbol}</span>
                          <span style={{ fontSize: 10, color: '#8B949E' }}>{asset.name}</span>
                        </td>
                        <td style={{ padding: '10px 20px', fontFamily: 'monospace', fontSize: 13, color: livePrice ? '#E1E4E8' : '#484F58' }}>
                          {livePrice ?? (asset.price === '---' ? '—' : asset.price)}
                        </td>
                        <td style={{ padding: '10px 20px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: asset.trend === 'up' ? 'rgba(63,185,80,0.1)' : asset.trend === 'down' ? 'rgba(248,81,73,0.1)' : 'rgba(139,148,158,0.1)',
                            color: asset.trend === 'up' ? '#3FB950' : asset.trend === 'down' ? '#F85149' : '#8B949E',
                            borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700,
                          }}>
                            {asset.trend === 'up' ? <ArrowUpRight size={13} /> : asset.trend === 'down' ? <ArrowDownRight size={13} /> : <Minus size={13} />}
                            {asset.change ?? '—'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 20px' }}>
                          <span style={{ background: 'rgba(48,54,61,0.3)', border: '1px solid #30363D', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#8B949E' }}>
                            {asset.sector}
                          </span>
                        </td>
                        <td style={{ padding: '10px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => toggleAsset(asset.id)}
                            style={{
                              border: isSelected ? 'none' : '1px solid #30363D',
                              borderRadius: 8, padding: '5px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                              background: isSelected ? '#00A3FF' : 'transparent',
                              color: isSelected ? '#fff' : '#8B949E', transition: 'all 0.15s',
                            }}
                          >
                            {isSelected ? 'SELECTED' : 'SELECT'}
                          </button>
                        </td>
                      </tr>
                    );
                  }) : []),
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Analysis Tab ─────────────────────────────────────────────────────────────

function AnalysisTab({ marketRows, assets, selectedAssets, messages, input, setInput, onSend, isLoading, messagesEndRef, mt5Symbol, setMt5Symbol, mt5Analyzer, mt5Question, setMt5Question, mt5Answer, mt5Loading, onAsk }: {
  marketRows: MarketRow[];
  assets: Asset[];
  selectedAssets: string[];
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  mt5Symbol: string | null;
  setMt5Symbol: (s: string) => void;
  mt5Analyzer: Record<string, unknown> | null;
  mt5Question: string;
  setMt5Question: (v: string) => void;
  mt5Answer: string;
  mt5Loading: boolean;
  onAsk: () => void;
}) {
  const selectedAssetObjs = assets.filter(a => selectedAssets.includes(a.id));

  return (
    <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20, height: 'calc(100vh - 180px)', minHeight: 500 }}>
      {/* MT5 Symbol picker + JSON context */}
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 20, padding: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {marketRows.slice(0, 20).map(row => (
            <button
              key={row.symbol}
              onClick={() => setMt5Symbol(row.symbol)}
              style={{
                padding: '4px 10px', fontSize: 11, borderRadius: 6, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s',
                background: mt5Symbol === row.symbol ? 'rgba(0,163,255,0.2)' : 'transparent',
                border: `1px solid ${mt5Symbol === row.symbol ? 'rgba(0,163,255,0.4)' : '#30363D'}`,
                color: mt5Symbol === row.symbol ? '#00A3FF' : '#8B949E',
              }}
            >
              {row.symbol}
            </button>
          ))}
          {marketRows.length === 0 && (
            <p style={{ margin: 0, fontSize: 12, color: '#6E7681' }}>Nessun segnale MT5. Configura l&apos;EA per vedere i simboli.</p>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 12, padding: 14 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.2em' }}>JSON Context</h4>
            <pre style={{ margin: 0, fontSize: 11, color: '#C9D1D9', maxHeight: 220, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {mt5Analyzer ? JSON.stringify(mt5Analyzer, null, 2) : 'Seleziona un asset dalla Market Overview per caricare il payload analyzer.'}
            </pre>
          </div>
          <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Interactive Analysis (Gemini)</h4>
            <textarea
              value={mt5Question}
              onChange={e => setMt5Question(e.target.value)}
              placeholder="Perché l'oro ha confidenza 85%?"
              style={{ minHeight: 88, background: '#161B22', border: '1px solid #30363D', borderRadius: 10, padding: 10, fontSize: 13, color: '#E1E4E8', resize: 'none', outline: 'none' }}
              onFocus={e => (e.target.style.borderColor = '#00A3FF')}
              onBlur={e => (e.target.style.borderColor = '#30363D')}
            />
            <button
              onClick={onAsk}
              disabled={!mt5Symbol || !mt5Question.trim() || mt5Loading}
              style={{ alignSelf: 'flex-start', padding: '7px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 8, border: 'none', cursor: mt5Loading ? 'not-allowed' : 'pointer', background: '#00A3FF', color: '#fff', opacity: (!mt5Symbol || !mt5Question.trim() || mt5Loading) ? 0.5 : 1 }}
            >
              {mt5Loading ? 'Analisi...' : 'Chiedi a Gemini'}
            </button>
            <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 10, padding: 10, minHeight: 80, fontSize: 13, color: '#C9D1D9' }}>
              {mt5Answer || 'La risposta comparirà qui.'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Strategy chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D1117', border: '1px solid #30363D', borderRadius: 20, overflow: 'hidden', minHeight: 0 }}>
        <div style={{ padding: '14px 20px', background: '#161B22', borderBottom: '1px solid #30363D', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(0,163,255,0.1)', borderRadius: 8, padding: 7, display: 'flex' }}>
              <Sparkles size={15} color="#00A3FF" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>AI Strategy Engine</h3>
              <p style={{ margin: 0, fontSize: 10, color: '#8B949E' }}>Analyzing {selectedAssets.length} selected assets</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {selectedAssetObjs.slice(0, 5).map(a => (
              <span key={a.id} style={{ fontSize: 10, fontWeight: 700, background: '#30363D', color: '#C9D1D9', padding: '3px 7px', borderRadius: 5, border: '1px solid #484F58' }}>{a.symbol}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4, textAlign: 'center', gap: 12 }}>
              <Bot size={44} color="#8B949E" />
              <p style={{ margin: 0, fontSize: 13, maxWidth: 280, color: '#8B949E' }}>Chiedi un&apos;analisi approfondita sugli asset selezionati. L&apos;AI userà i dati in tempo reale.</p>
            </div>
          ) : messages.map(m => (
            <div key={m.id} style={{ display: 'flex', gap: 12, maxWidth: '90%', ...(m.role === 'user' ? { alignSelf: 'flex-end', flexDirection: 'row-reverse' } : {}) }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: m.role === 'user' ? '#00A3FF' : '#238636', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {m.role === 'user' ? <UserIcon size={15} color="#fff" /> : <Bot size={15} color="#fff" />}
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 16, border: `1px solid ${m.role === 'user' ? 'rgba(0,163,255,0.3)' : '#30363D'}`, background: m.role === 'user' ? '#1C2128' : '#161B22', fontSize: 13, color: '#C9D1D9', lineHeight: 1.6 }}>
                <MarkdownText content={m.content} />
                <span style={{ display: 'block', marginTop: 6, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', opacity: 0.4 }}>{m.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: 14, background: '#161B22', borderTop: '1px solid #30363D' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSend()}
              placeholder="Es: 'Analizza la correlazione tra XAUUSD e BTC'..."
              style={{ flex: 1, background: '#0D1117', border: '1px solid #30363D', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#E1E4E8', outline: 'none' }}
              onFocus={e => (e.target.style.borderColor = '#00A3FF')}
              onBlur={e => (e.target.style.borderColor = '#30363D')}
            />
            <button
              onClick={onSend}
              disabled={isLoading || !input.trim()}
              style={{ padding: '10px 20px', borderRadius: 12, border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', background: isLoading || !input.trim() ? '#30363D' : '#00A3FF', color: isLoading || !input.trim() ? '#8B949E' : '#fff', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.15s' }}
            >
              {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
              Analyze
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Automation Tab ───────────────────────────────────────────────────────────

function AutomationTab({ signals, isBridgeActive }: { signals: Mt5Signal[]; isBridgeActive: boolean }) {
  return (
    <motion.div key="automation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Zap size={18} color="#E3B341" />
          <p style={{ margin: 0, fontSize: 12, color: '#8B949E' }}>
            <strong style={{ color: '#E1E4E8' }}>EA Automation (MT5 Bridge)</strong> — riceve i pacchetti JSON dagli EA e li mostra in tempo reale.
            URL webhook: <code style={{ background: '#0D1117', padding: '1px 6px', borderRadius: 4, fontSize: 11, color: '#00A3FF' }}>/api/softi/mt5/webhook</code>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: isBridgeActive ? 'rgba(35,134,54,0.1)' : 'rgba(218,54,51,0.1)', border: `1px solid ${isBridgeActive ? 'rgba(35,134,54,0.3)' : 'rgba(218,54,51,0.3)'}`, borderRadius: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: isBridgeActive ? '#238636' : '#DA3633', display: 'inline-block', boxShadow: isBridgeActive ? '0 0 6px #238636' : 'none' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: isBridgeActive ? '#3FB950' : '#F85149', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isBridgeActive ? 'MT5 BRIDGE ACTIVE' : 'MT5 BRIDGE OFFLINE'}
          </span>
        </div>
      </div>

      <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', background: '#161B22', borderBottom: '1px solid #30363D', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={15} color="#E3B341" />
          <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Bidirectional Traffic Log</h3>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 500, overflowY: 'auto' }}>
          {signals.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#30363D', fontStyle: 'italic', fontSize: 13, padding: '40px 0', opacity: 0.5 }}>
              Waiting for incoming EA data packets...
            </div>
          ) : signals.slice(0, 50).map(s => (
            <div key={s.id} style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: '#8B949E' }}>
                  [{new Date(s.created_at).toLocaleTimeString()}]
                </span>
                <span style={{ background: 'rgba(0,163,255,0.05)', border: '1px solid rgba(0,163,255,0.2)', borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#00A3FF' }}>
                  {s.symbol} · EA_INPUT_STREAM
                </span>
              </div>
              <pre style={{ margin: 0, fontSize: 11, color: '#C9D1D9', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.5 }}>
                {JSON.stringify({ symbol: s.symbol, action: s.action, confidence_score: s.confidence_score, market_regime: s.market_regime, wyckoff_phase: s.wyckoff_phase, ...((s.raw_payload as object) ?? {}) }, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────

function ReportsTab({ reports, isGenerating, onGenerate, onDelete }: {
  reports: AiReport[];
  isGenerating: boolean;
  onGenerate: (type: 'daily' | 'weekly' | 'monthly') => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileBarChart size={18} color="#00A3FF" />
        <p style={{ margin: 0, fontSize: 12, color: '#8B949E' }}>
          <strong style={{ color: '#E1E4E8' }}>Market Reports</strong> — genera sintesi periodiche (Daily/Weekly/Monthly) dell&apos;intelligenza di mercato basate sui segnali MT5.
        </p>
      </div>

      {/* Generator */}
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 24, padding: '48px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, background: 'rgba(0,163,255,0.07)', filter: 'blur(40px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, right: -30, width: 140, height: 140, background: 'rgba(35,134,54,0.07)', filter: 'blur(40px)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 72, height: 72, background: 'rgba(0,163,255,0.1)', border: '1px solid rgba(0,163,255,0.2)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FileBarChart size={36} color="#00A3FF" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Market Intelligence Hub</h3>
          <p style={{ margin: '0 0 28px', fontSize: 13, color: '#8B949E', maxWidth: 380, marginInline: 'auto' }}>Genera report istituzionali basati sui dati globali e flussi MT5 sincronizzati.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            {([
              { type: 'daily' as const, color: '#00A3FF', hover: '#0081CC', label: 'Daily Report' },
              { type: 'weekly' as const, color: '#238636', hover: '#2EA043', label: 'Weekly Report' },
              { type: 'monthly' as const, color: '#E3B341', hover: '#D2A230', label: 'Monthly Report' },
            ]).map(btn => (
              <button
                key={btn.type}
                onClick={() => onGenerate(btn.type)}
                disabled={isGenerating}
                style={{ padding: '10px 24px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: isGenerating ? 'not-allowed' : 'pointer', background: btn.color, color: '#fff', opacity: isGenerating ? 0.5 : 1, transition: 'all 0.15s' }}
              >
                {btn.label}
              </button>
            ))}
          </div>
          {isGenerating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20, padding: 14, background: '#0D1117', border: '1px solid #30363D', borderRadius: 14, maxWidth: 200, marginInline: 'auto' }}>
              <Loader2 size={18} color="#00A3FF" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00A3FF', textTransform: 'uppercase' }}>Generazione...</span>
            </div>
          )}
        </div>
      </div>

      {/* Saved reports */}
      {reports.map(report => (
        <div key={report.id} style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 20, padding: 28, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #30363D' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={16} color="#E3B341" />
              <span style={{ fontSize: 11, fontWeight: 900, color: '#00A3FF', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Intelligence Report • {report.timeframe} • {new Date(report.created_at).toLocaleDateString('it-IT')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onDelete(report.id)}
                title="Elimina report"
                style={{ padding: '7px 10px', background: '#0D1117', border: '1px solid #30363D', borderRadius: 10, cursor: 'pointer', color: '#F85149', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#F85149'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#30363D'}
              >
                <Upload size={15} />
              </button>
            </div>
          </div>
          <MarkdownText content={report.markdown_content ?? ''} />
          {report.source_metadata && (
            <div style={{ marginTop: 14, padding: '8px 12px', background: '#0D1117', border: '1px solid #30363D', borderRadius: 8, display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 10, color: '#6E7681' }}>Segnali analizzati: <strong style={{ color: '#8B949E' }}>{report.source_metadata.signals_count}</strong></span>
              {report.source_metadata.symbols.length > 0 && (
                <span style={{ fontSize: 10, color: '#6E7681' }}>Simboli: <strong style={{ color: '#8B949E' }}>{report.source_metadata.symbols.join(', ')}</strong></span>
              )}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SoftiWorkspace() {
  const { getToken } = useAuth();

  // UI state
  const [activeTab, setActiveTab] = useState<SoftiView>('overview');

  // Data state
  const [signals, setSignals] = useState<Mt5Signal[]>([]);
  const [assets, setAssets] = useState<Asset[]>(ASSET_DATABASE);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['eurusd', 'xauusd', 'btc']);
  const [expandedCats, setExpandedCats] = useState<string[]>(['Forex']);
  const [reports, setReports] = useState<AiReport[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mt5Symbol, setMt5Symbol] = useState<string | null>(null);
  const [mt5Analyzer, setMt5Analyzer] = useState<Record<string, unknown> | null>(null);
  const [mt5Question, setMt5Question] = useState('');
  const [mt5Answer, setMt5Answer] = useState('');
  const [mt5Loading, setMt5Loading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date(0));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived
  const marketRows = useMemo(() => {
    const bySymbol = new Map<string, Mt5Signal>();
    for (const s of signals) {
      if (!bySymbol.has(s.symbol)) bySymbol.set(s.symbol, s);
    }
    return Array.from(bySymbol.values()).map(signalToRow);
  }, [signals]);

  const isBridgeActive = useMemo(() => {
    if (signals.length === 0) return false;
    return Date.now() - new Date(signals[0].created_at).getTime() < 5 * 60 * 1000;
  }, [signals]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [sigs, reps] = await Promise.all([
          fetchSignals({ limit: 100 }),
          fetchReports(),
        ]);
        setSignals(sigs);
        setReports(reps);
        if (sigs.length > 0) setLastUpdate(new Date(sigs[0].created_at));
      } catch (err) {
        console.error('[SoftiWorkspace] initial load error:', err);
      }
    };
    void loadAll();
  }, []);

  // Supabase Realtime subscription
  useEffect(() => {
    const client = createClerkSupabaseBrowserClient(getToken);
    if (!client) return;

    const channel = client
      .channel('softi_signals_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'softi_mt5_signals' }, payload => {
        const newSig = payload.new as Mt5Signal;
        setSignals(prev => [newSig, ...prev].slice(0, 200));
        setLastUpdate(new Date(newSig.created_at));
      })
      .subscribe();

    return () => { void client.removeChannel(channel); };
  }, [getToken]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load MT5 analyzer payload when symbol selected
  useEffect(() => {
    if (!mt5Symbol) { setMt5Analyzer(null); return; }
    const sig = signals.find(s => s.symbol === mt5Symbol);
    setMt5Analyzer(sig?.raw_payload ?? null);
  }, [mt5Symbol, signals]);

  const toggleAsset = useCallback((id: string) => {
    setSelectedAssets(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }, []);

  const toggleCat = useCallback((cat: string) => {
    setExpandedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }, []);

  const onRefresh = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const [sigs, reps] = await Promise.all([
        fetchSignals({ limit: 100 }),
        fetchReports(),
      ]);
      setSignals(sigs);
      setReports(reps);
      if (sigs.length > 0) setLastUpdate(new Date(sigs[0].created_at));
    } catch (err) {
      console.error('[SoftiWorkspace] refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const onOpenAnalysis = useCallback((symbol: string) => {
    setMt5Symbol(symbol.toUpperCase());
    setActiveTab('analysis');
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const selectedSymbols = assets.filter(a => selectedAssets.includes(a.id)).map(a => a.symbol);
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await analyzeSymbols({ symbols: selectedSymbols, prompt: input, mode: 'analysis' });
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: res.analysis, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('[SoftiWorkspace] analysis error:', err);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Errore durante l\'analisi AI.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, assets, selectedAssets]);

  const handleAsk = useCallback(async () => {
    if (!mt5Symbol || !mt5Question.trim() || mt5Loading) return;
    setMt5Loading(true);
    setMt5Answer('');
    try {
      const res = await analyzeSymbols({ symbols: [mt5Symbol], prompt: mt5Question, mode: 'analysis' });
      setMt5Answer(res.analysis);
    } catch {
      setMt5Answer('Errore durante l\'analisi interattiva.');
    } finally {
      setMt5Loading(false);
    }
  }, [mt5Symbol, mt5Question, mt5Loading]);

  const handleGenerateReport = useCallback(async (type: 'daily' | 'weekly' | 'monthly') => {
    setIsGenerating(true);
    try {
      const selectedSymbols = assets.filter(a => selectedAssets.includes(a.id)).map(a => a.symbol);
      const report = await apiGenerateReport({ timeframe: type, symbols: selectedSymbols });
      setReports(prev => [report, ...prev]);
    } catch (err) {
      console.error('[SoftiWorkspace] report generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [assets, selectedAssets]);

  const handleDeleteReport = useCallback(async (id: string) => {
    try {
      await apiDeleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('[SoftiWorkspace] delete report error:', err);
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div style={{
        margin: '-48px -24px -80px',
        display: 'flex',
        height: 'calc(100vh - 72px)',
        minHeight: 600,
        background: '#0A0E14',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#E1E4E8',
      }}>
        <Sidebar active={activeTab} setActive={setActiveTab} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D1117', minWidth: 0 }}>
          <TopBar isLoading={isLoading} isBridgeActive={isBridgeActive} lastUpdate={lastUpdate} onRefresh={onRefresh} />
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <OverviewTab
                  marketRows={marketRows}
                  assets={assets}
                  selectedAssets={selectedAssets}
                  toggleAsset={toggleAsset}
                  expandedCats={expandedCats}
                  toggleCat={toggleCat}
                  isLoading={isLoading}
                  lastUpdate={lastUpdate}
                  onOpenAnalysis={onOpenAnalysis}
                />
              )}
              {activeTab === 'analysis' && (
                <AnalysisTab
                  marketRows={marketRows}
                  assets={assets}
                  selectedAssets={selectedAssets}
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  onSend={handleSend}
                  isLoading={isLoading}
                  messagesEndRef={messagesEndRef}
                  mt5Symbol={mt5Symbol}
                  setMt5Symbol={setMt5Symbol}
                  mt5Analyzer={mt5Analyzer}
                  mt5Question={mt5Question}
                  setMt5Question={setMt5Question}
                  mt5Answer={mt5Answer}
                  mt5Loading={mt5Loading}
                  onAsk={handleAsk}
                />
              )}
              {activeTab === 'automation' && (
                <AutomationTab signals={signals} isBridgeActive={isBridgeActive} />
              )}
              {activeTab === 'reports' && (
                <ReportsTab
                  reports={reports}
                  isGenerating={isGenerating}
                  onGenerate={handleGenerateReport}
                  onDelete={handleDeleteReport}
                />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
