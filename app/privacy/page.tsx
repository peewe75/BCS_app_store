import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Informativa sul trattamento dei dati personali di BCS AI Suite.',
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px 96px' }}>
      <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#6b7280', marginBottom: 40 }}>Ultimo aggiornamento: marzo 2026</p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>1. Titolare del trattamento</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          BCS Advisory S.r.l. – Via esempio 1, 00100 Roma (RM) – P.IVA 00000000000<br />
          Email: privacy@bcs-ai.com
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>2. Dati raccolti</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          Raccogliamo i seguenti dati personali: indirizzo email, nome utente, e dati di utilizzo
          degli strumenti AI. I dati di trading e fiscali caricati vengono elaborati e conservati
          in modo sicuro su infrastruttura europea (Supabase – EU Central).
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>3. Finalità del trattamento</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          I dati sono trattati per: erogazione dei servizi, autenticazione, elaborazione dei
          report fiscali, supporto tecnico e miglioramento del servizio.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>4. Conservazione e sicurezza</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          I dati sono elaborati e conservati in Europa (GDPR conforme). Utilizziamo crittografia
          in transito e a riposo. I dati vengono conservati per la durata del contratto e per il
          periodo previsto dagli obblighi di legge.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>5. Diritti dell&apos;utente</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          Hai diritto di accesso, rettifica, cancellazione, portabilità e opposizione al
          trattamento. Per esercitare i tuoi diritti: privacy@bcs-ai.com
        </p>
      </section>
    </main>
  );
}
