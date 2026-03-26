import type { Mt5Signal, AiReport } from './types';

export async function fetchSignals(params?: { symbol?: string; limit?: number }): Promise<Mt5Signal[]> {
  const qs = new URLSearchParams();
  if (params?.symbol) qs.set('symbol', params.symbol);
  if (params?.limit) qs.set('limit', String(params.limit));
  const res = await fetch(`/api/softi/signals?${qs}`);
  if (!res.ok) throw new Error('Errore fetch segnali');
  const data = await res.json();
  return data.signals as Mt5Signal[];
}

export async function fetchReports(timeframe?: string): Promise<AiReport[]> {
  const qs = new URLSearchParams();
  if (timeframe) qs.set('timeframe', timeframe);
  const res = await fetch(`/api/softi/reports?${qs}`);
  if (!res.ok) throw new Error('Errore fetch report');
  const data = await res.json();
  return data.reports as AiReport[];
}

export async function generateReport(params: {
  timeframe: 'daily' | 'weekly' | 'monthly';
  symbols?: string[];
}): Promise<AiReport> {
  const res = await fetch('/api/softi/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Errore generazione report');
  const data = await res.json();
  return data.report as AiReport;
}

export async function deleteReport(id: string): Promise<void> {
  const res = await fetch(`/api/softi/reports?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Errore eliminazione report');
}

export async function analyzeSymbols(params: {
  symbols?: string[];
  prompt?: string;
  mode?: 'analysis' | 'chat';
}): Promise<{ analysis: string; symbols: string[] }> {
  const res = await fetch('/api/softi/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Errore analisi AI');
  return res.json();
}
