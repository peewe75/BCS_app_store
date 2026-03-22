import Link from 'next/link';
import { getPublicApps } from '@/src/lib/catalog';

export default async function HomePage() {
  const apps = await getPublicApps();
  const activeApps = apps.filter((app) => !app.is_coming_soon);
  const comingSoonApps = apps.filter((app) => app.is_coming_soon);

  return (
    <main>
      <section
        style={{
          padding: '72px 24px 48px',
          background:
            'radial-gradient(circle at top, rgba(55,19,236,0.12), transparent 40%), linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div>
            <p style={{ margin: '0 0 14px', color: '#3713ec', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Ultrabot Space
            </p>
            <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(44px, 8vw, 78px)', lineHeight: 1 }}>
              Una sola piattaforma.
              <br />
              Un solo account.
            </h1>
            <p style={{ margin: '0 0 24px', color: '#6E6E73', fontSize: 18, lineHeight: 1.7, maxWidth: 620 }}>
              Vercel per hosting e dominio, Clerk per autenticazione unificata, Supabase per database e RLS, Stripe per acquisti e grant applicativi.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/sign-up" style={{ padding: '14px 22px', borderRadius: 999, background: '#3713ec', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
                Crea account
              </Link>
              <Link href="/dashboard" style={{ padding: '14px 22px', borderRadius: 999, background: '#fff', color: '#1D1D1F', textDecoration: 'none', fontWeight: 700, border: '1px solid rgba(0,0,0,0.08)' }}>
                Vai alla dashboard
              </Link>
            </div>
          </div>

          <div
            style={{
              padding: 28,
              borderRadius: 32,
              background: '#0F172A',
              color: '#fff',
              boxShadow: '0 30px 70px rgba(15,23,42,0.18)',
            }}
          >
            <div style={{ display: 'grid', gap: 14 }}>
              {[
                '1 progetto Vercel collegato al repo GitHub canonico',
                '1 progetto Clerk per sign-in, sign-up, dashboard e admin',
                '1 progetto Supabase per catalogo, profili e dati app',
                '1 integrazione Stripe come fonte acquisti e trigger grant',
              ].map((item) => (
                <div key={item} style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.06)' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 24px 60px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 8px', color: '#3713ec', fontWeight: 700 }}>Catalogo attivo</p>
          <h2 style={{ margin: 0, fontSize: 36 }}>App unificate</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {activeApps.map((app) => (
            <article
              key={app.id}
              style={{
                padding: 24,
                borderRadius: 24,
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <strong style={{ fontSize: 18 }}>{app.name}</strong>
                <span style={{ padding: '5px 10px', borderRadius: 999, background: `${app.accent_color ?? '#3713ec'}15`, color: app.accent_color ?? '#3713ec', fontSize: 12, fontWeight: 700 }}>
                  {app.badge ?? app.pricing_badge ?? 'AI'}
                </span>
              </div>
              <p style={{ margin: 0, color: '#6E6E73', lineHeight: 1.6 }}>{app.tagline ?? app.description}</p>
              <div style={{ marginTop: 'auto' }}>
                {app.is_internal ? (
                  <Link href={app.internal_route ?? `/apps/${app.id}`} style={{ color: app.accent_color ?? '#3713ec', textDecoration: 'none', fontWeight: 700 }}>
                    Apri in Ultrabot Space
                  </Link>
                ) : (
                  <a href={app.cta_href ?? '#'} target="_blank" rel="noreferrer" style={{ color: app.accent_color ?? '#3713ec', textDecoration: 'none', fontWeight: 700 }}>
                    Apri app esterna
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 8px', color: '#3713ec', fontWeight: 700 }}>Roadmap</p>
          <h2 style={{ margin: 0, fontSize: 32 }}>In arrivo</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {comingSoonApps.map((app) => (
            <article key={app.id} style={{ padding: 24, borderRadius: 24, background: '#fff', border: '1px dashed rgba(0,0,0,0.12)' }}>
              <strong>{app.name}</strong>
              <p style={{ margin: '8px 0 0', color: '#6E6E73' }}>{app.tagline}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
