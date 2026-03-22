'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { RequireAuth } from '@/src/components/auth/RequireAuth';

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

function AdminConsoleContent() {
  const { user } = useUser();
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const response = await fetch('/api/admin/overview', { cache: 'no-store' });
      const payload = (await response.json()) as OverviewPayload;

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        setStatus('error');
        setMessage(payload.error ?? 'Admin overview non disponibile.');
        return;
      }

      setData(payload);
      setStatus('ready');
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

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
            Per attivarla servono almeno `CLERK_SECRET_KEY` e `SUPABASE_SERVICE_ROLE_KEY` nel progetto Vercel.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gap: 24 }}>
      <section style={{ padding: 28, borderRadius: 28, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ margin: '0 0 8px', color: '#3713ec', fontWeight: 700 }}>Console Admin</p>
        <h1 style={{ margin: '0 0 10px', fontSize: 34 }}>Pannello unificato</h1>
        <p style={{ margin: 0, color: '#6E6E73' }}>
          {user?.primaryEmailAddress?.emailAddress} sta leggendo utenti, grant e catalogo dallo stack unico.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          ['Utenti', data.stats.users],
          ['App', data.stats.apps],
          ['Grant', data.stats.grants],
          ['Trading report', data.stats.tradingReports],
          ['Calcoli ravvedimento', data.stats.ravvedimentoCalcs],
          ['UGC job', data.stats.ugcVideos],
        ].map(([label, value]) => (
          <article key={label} style={{ padding: 22, borderRadius: 22, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: '#6E6E73', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>{value}</div>
          </article>
        ))}
      </section>

      <section style={{ padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <h2 style={{ marginTop: 0 }}>Utenti recenti</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {data.users.map((entry) => (
            <article key={entry.id} style={{ padding: 16, borderRadius: 18, background: '#F8FAFC', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
              <div>
                <strong>{entry.email ?? entry.id}</strong>
                <div style={{ color: '#6E6E73', fontSize: 13 }}>{entry.id}</div>
              </div>
              <div>{entry.role ?? 'user'}</div>
              <div>{entry.created_at ? new Date(entry.created_at).toLocaleDateString('it-IT') : '-'}</div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <h2 style={{ marginTop: 0 }}>Catalogo app</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {data.apps.map((entry) => (
            <article key={entry.id} style={{ padding: 16, borderRadius: 18, background: '#F8FAFC', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
              <strong>{entry.name}</strong>
              <span>{entry.pricing_model ?? 'free'}</span>
              <span>{entry.is_active ? 'attiva' : 'disattivata'}</span>
            </article>
          ))}
        </div>
      </section>
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
