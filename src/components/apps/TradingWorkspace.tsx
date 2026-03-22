'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public';

type TradingReport = {
  id: string;
  broker_name: string | null;
  tax_year: number | null;
  pnl_total: number | null;
  tax_due: number | null;
  report_pdf_url: string | null;
  created_at: string;
};

export default function TradingWorkspace() {
  const { getToken, userId } = useAuth();
  const [reports, setReports] = useState<TradingReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase;
      if (!client) {
        setLoading(false);
        return;
      }

      const { data } = await client
        .from('trading_reports')
        .select('id, broker_name, tax_year, pnl_total, tax_due, report_pdf_url, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!cancelled) {
        setReports((data as TradingReport[] | null) ?? []);
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [getToken, userId]);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={{ padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ margin: '0 0 8px', color: '#10b981', fontWeight: 700 }}>Trading Fiscale</p>
        <h1 style={{ margin: '0 0 10px', fontSize: 34 }}>Workspace unificato</h1>
        <p style={{ margin: 0, color: '#6E6E73', lineHeight: 1.6 }}>
          La parte operativa ora vive dentro Ultrabot Space. Lo storage dati e gli accessi restano su Supabase e Clerk.
        </p>
      </section>

      <section style={{ padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 22 }}>Storico report</h2>
            <p style={{ margin: 0, color: '#6E6E73' }}>Dati letti da `trading_reports` via RLS.</p>
          </div>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 16,
              background: '#F0FDF4',
              color: '#166534',
              fontWeight: 700,
              height: 'fit-content',
            }}
          >
            {loading ? 'Sincronizzo...' : `${reports.length} report`}
          </div>
        </div>

        {reports.length === 0 ? (
          <div style={{ padding: 20, borderRadius: 18, background: '#F8FAFC', color: '#475569' }}>
            Nessun report ancora salvato. Il modulo di importazione broker verra integrato in questo repository nel prossimo step.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {reports.map((report) => (
              <article
                key={report.id}
                style={{
                  padding: 18,
                  borderRadius: 18,
                  background: '#F8FAFC',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Broker</div>
                  <div style={{ fontWeight: 700 }}>{report.broker_name ?? 'N/D'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Anno</div>
                  <div style={{ fontWeight: 700 }}>{report.tax_year ?? 'N/D'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>P&L</div>
                  <div style={{ fontWeight: 700 }}>{report.pnl_total ?? 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Imposte</div>
                  <div style={{ fontWeight: 700 }}>{report.tax_due ?? 0}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
