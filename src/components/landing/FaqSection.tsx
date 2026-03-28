'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'Cosa include la registrazione gratuita?',
    answer: 'La registrazione gratuita ti dà accesso alla piattaforma unificata e, a seconda dello strumento, un periodo di prova o un set di calcoli base gratuiti (ad esempio Forfettari AI è sempre al 100% gratuito).',
  },
  {
    question: 'I miei dati fiscali e legali sono al sicuro?',
    answer: 'Assolutamente sì. Tutti i dati sono elaborati esclusivamente in Unione Europea nel pieno rispetto della normativa GDPR. Non condividiamo né vendiamo i tuoi dati a terzi.',
  },
  {
    question: 'Posso cancellare in qualsiasi momento?',
    answer: 'Sì, non ci sono vincoli contrattuali a lungo termine. Se decidi di attivare un abbonamento premium, puoi disdirlo con un solo click dalla tua dashboard e manterrai l\'accesso fino alla fine del periodo già pagato.',
  },
  {
    question: 'Devo inserire la carta di credito per iniziare?',
    answer: 'No. L\'iscrizione iniziale è completamente gratuita e senza impegno limitandosi a richiedere una email valida per procedere. Richiediamo e gestiamo un pagamento crittografato (tramite Stripe) solo quando acquisti esplicitamente un upgrade.',
  },
  {
    question: 'I calcoli sono aggiornati alla normativa vigente?',
    answer: 'Siamo professionisti che costruiscono software per i professionisti italiani. Applichiamo tempestivamente le ultime normative pubblicate in G.U., come i tassi legali di interesse e i nuovi scaglioni fiscali operativi per il 2025.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      style={{
        background: '#ffffff',
        padding: '80px 24px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#1a1a1a',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
            }}
          >
            Domande Frequenti
          </h2>
          <p
            style={{
              fontSize: 16,
              color: '#6E6E73',
              maxWidth: 520,
              margin: '0 auto',
            }}
          >
            Tutto ciò che devi sapere prima di iniziare a snellire la tua operatività aziendale e fiscale.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                style={{
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                }}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1a1a1a',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {faq.question}
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isOpen ? '#3713ec' : '#94a3b8',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0 24px 24px',
                          color: '#6E6E73',
                          lineHeight: 1.6,
                          fontSize: 15,
                        }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
