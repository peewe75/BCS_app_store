import Link from 'next/link';
import { getPublicApps } from '@/src/lib/catalog';
import LandingHero from '@/src/components/landing/LandingHero';
import LandingAppGrid from '@/src/components/landing/LandingAppGrid';

export default async function HomePage() {
  const apps = await getPublicApps();

  return (
    <main>
      {/* 1. Hero split */}
      <LandingHero />

      {/* 2. Social proof strip */}
      <div
        style={{
          background: '#ffffff',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '20px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { value: 'AI', label: 'strumenti specializzati' },
            { value: 'GDPR', label: 'dati in Europa' },
            { value: 'Google', label: 'Gemini powered' },
            { value: 'BCS', label: 'Advisory group' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                color: '#6E6E73',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 15,
                  color: '#1a1a1a',
                  letterSpacing: '-0.02em',
                }}
              >
                {item.value}
              </span>
              <span style={{ fontWeight: 400 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bento grid app (sostituisce lo scroll infinito) */}
      <LandingAppGrid apps={apps} />

      {/* 4. Sezione "Per chi è BCS AI" */}
      <section
        style={{
          background: '#ffffff',
          padding: '72px 24px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 800,
                color: '#1a1a1a',
                margin: '0 0 12px',
                letterSpacing: '-0.03em',
              }}
            >
              Per chi è BCS AI?
            </h2>
            <p style={{ fontSize: 16, color: '#6E6E73', margin: 0 }}>
              Ogni professione ha il suo strumento.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}
            className="bcs-audience-grid"
          >
            {[
              {
                icon: '🎬',
                title: 'Creator & Marketing',
                desc: 'Genera video pubblicitari UGC in 60 secondi con Google Gemini. Perfetto per TikTok, Instagram e campagne social.',
                tool: 'UGC Ad Creator',
                href: '/apps/ugc',
                color: '#ec4899',
              },
              {
                icon: '📊',
                title: 'Professionisti Fiscali',
                desc: "Calcola tasse regime forfettario, genera report P&L per trader e gestisci il ravvedimento operoso con normativa 2025 aggiornata.",
                tool: '3 tool fiscali',
                href: '#prodotti',
                color: '#10b981',
              },
              {
                icon: '⚖️',
                title: 'Avvocati e Studi Legali',
                desc: "Gestisci le procedure di crisi d'impresa CCII con AI: fascicolo digitale, knowledge base giuridica e generazione atti.",
                tool: 'AI Crisi',
                href: '/apps/ai-crisi',
                color: '#3b82f6',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: '#fafafa',
                  borderRadius: 20,
                  padding: '28px 24px',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#1a1a1a',
                    margin: '0 0 10px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: '#6E6E73',
                    lineHeight: 1.6,
                    margin: '0 0 18px',
                  }}
                >
                  {item.desc}
                </p>
                <Link
                  href={item.href}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: item.color,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {item.tool}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2.5 6H9.5M9.5 6L7 3.5M9.5 6L7 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 760px) {
            .bcs-audience-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* 5. Dark CTA strip finale */}
      <section
        style={{
          background: '#0f172a',
          padding: '72px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#f8fafc',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
            }}
          >
            Pronto a risparmiare tempo?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: '#94a3b8',
              margin: '0 0 32px',
              lineHeight: 1.6,
            }}
          >
            Inizia oggi — accesso gratuito ai tool base, upgrade in qualsiasi momento.
          </p>
          <Link
            href="/sign-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 32px',
              borderRadius: 100,
              background: '#3713ec',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 4px 24px rgba(55,19,236,0.4)',
            }}
          >
            Inizia il mio piano gratuito
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p
            style={{
              fontSize: 12,
              color: '#64748b',
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <span>Nessuna carta di credito</span>
            <span>·</span>
            <span>Disdici quando vuoi</span>
            <span>·</span>
            <span>Dati protetti GDPR</span>
          </p>
        </div>
      </section>
    </main>
  );
}
