import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termini di Servizio',
  description: 'Termini e condizioni di utilizzo di BCS AI Suite.',
};

export default function TerminiPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px 96px' }}>
      <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', marginBottom: 8 }}>Termini di Servizio</h1>
      <p style={{ color: '#6b7280', marginBottom: 40 }}>Ultimo aggiornamento: marzo 2026</p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>1. Accettazione dei termini</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          Utilizzando BCS AI Suite accetti i presenti Termini di Servizio. Se non accetti,
          ti preghiamo di non utilizzare il servizio.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>2. Descrizione del servizio</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          BCS AI Suite offre strumenti AI verticali per professionisti italiani: elaborazione
          report fiscali di trading, calcolo ravvedimento operoso, gestione crisi d&apos;impresa (CCII),
          calcolo regime forfettario e generazione video UGC pubblicitari.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>3. Limitazione di responsabilità</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          I risultati forniti dagli strumenti AI hanno scopo informativo e non sostituiscono
          la consulenza professionale di un commercialista, avvocato o consulente fiscale
          abilitato. BCS Advisory non è responsabile per decisioni prese sulla base dei
          risultati elaborati.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>4. Piani e pagamenti</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          Alcuni strumenti sono disponibili in versione gratuita o freemium. I piani a pagamento
          sono gestiti tramite Stripe. I prezzi sono indicati nelle rispettive pagine dei prodotti.
          Non sono previsti rimborsi salvo diversa disposizione di legge.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>5. Contatti</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>
          Per qualsiasi domanda: supporto@bcs-ai.com
        </p>
      </section>
    </main>
  );
}
