'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalculatorStore, TRIBUTI } from '../apps/ravvedimento/store';
import { calcolaRavvedimento } from '../apps/ravvedimento/calcolo';
import type { CategoriaTributo, Tributo } from '../apps/ravvedimento/types';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DocumentoPDF from '../apps/ravvedimento/DocumentoPDF';
import { format } from 'date-fns';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public';

/* Styles */
const accent = '#3713ec';

const card: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '24px',
  border: '1px solid rgba(0,0,0,0.06)',
  overflow: 'hidden',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid rgba(0,0,0,0.1)',
  fontSize: '15px',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  color: '#1D1D1F',
  background: '#FAFAFA',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#6E6E73',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontFamily: 'var(--font-body)',
  marginBottom: '8px',
  display: 'block',
};

const btnPrimary: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  borderRadius: '14px',
  border: 'none',
  background: accent,
  color: '#fff',
  fontSize: '16px',
  fontWeight: 700,
  fontFamily: 'var(--font-display)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  boxShadow: `0 4px 20px ${accent}30`,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
};

const btnOutline: React.CSSProperties = {
  padding: '14px 24px',
  borderRadius: '14px',
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#fff',
  color: '#6E6E73',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'var(--font-display)',
  cursor: 'pointer',
};

const CATEGORIE_LABELS: Record<CategoriaTributo, string> = {
  IRPEF: 'IRPEF',
  IRES: 'IRES',
  IVA: 'IVA',
  IRAP: 'IRAP',
  IMU: 'IMU',
  CEDOLARE_SECCA: 'Cedolare Secca',
  ADD_REGIONALE: 'Add. Regionale IRPEF',
  ADD_COMUNALE: 'Add. Comunale IRPEF',
  SOSTITUTIVA: 'Imposta Sostitutiva / Forfettario',
  RITENUTE: "Ritenute d'Acconto",
  BOLLO: 'Imposta di Bollo',
  REGISTRO: 'Imposta di Registro',
  CAMERALE: 'Diritto Camerale',
  TOBIN: 'Tobin Tax',
  IVAFE_IVIE: 'IVAFE / IVIE (Quadro RW)',
  PLUSVALENZE: 'Plusvalenze Finanziarie (Quadro RT)',
  INPS: 'INPS',
  ALTRO: 'Altro',
};

const CATEGORIE_ORDINE: CategoriaTributo[] = [
  'IRPEF',
  'IRES',
  'IVA',
  'IRAP',
  'SOSTITUTIVA',
  'CEDOLARE_SECCA',
  'ADD_REGIONALE',
  'ADD_COMUNALE',
  'RITENUTE',
  'IMU',
  'BOLLO',
  'REGISTRO',
  'IVAFE_IVIE',
  'PLUSVALENZE',
  'TOBIN',
  'CAMERALE',
  'INPS',
  'ALTRO',
];

const getTributoKey = (tributo: Pick<Tributo, 'codiceTributo' | 'sezioneF24'>) =>
  `${tributo.codiceTributo}::${tributo.sezioneF24}`;

const findTributoByKey = (key: string) => TRIBUTI.find((tributo) => getTributoKey(tributo) === key);

/* Step Indicator */
const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
    {[1, 2, 3].map((s) => (
      <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <div style={{
          height: '4px', width: '100%', borderRadius: '2px',
          background: s <= current ? accent : 'rgba(0,0,0,0.08)',
          transition: 'background 0.3s ease',
        }} />
        <span style={{
          fontSize: '10px', fontWeight: 700, color: s <= current ? accent : '#999',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {s === 1 ? 'Tributo' : s === 2 ? 'Date' : 'Risultato'}
        </span>
      </div>
    ))}
  </div>
);

/* Stat Card */
const StatCard: React.FC<{ label: string; value: string; dark?: boolean }> = ({ label, value, dark }) => (
  <div style={{
    padding: '20px', borderRadius: '20px',
    background: dark ? '#1D1D1F' : '#F5F5F7',
    border: dark ? 'none' : '1px solid rgba(0,0,0,0.06)',
  }}>
    <p style={{
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase', margin: '0 0 6px',
      color: dark ? accent : '#6E6E73',
    }}>
      {label}
    </p>
    <p style={{
      fontSize: dark ? '24px' : '18px', fontWeight: 800,
      color: dark ? '#fff' : '#1D1D1F', margin: 0,
      fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
    }}>
      {value}
    </p>
  </div>
);

const RavvedimentoApp: React.FC = () => {
  const { step, input, risultato, error, setStep, setInput, calculate, reset } = useCalculatorStore();
  const { userId, getToken } = useAuth();
  const [formData, setFormData] = useState({
    codiceTributo: '',
    importo: '',
    dataScadenza: '',
    dataVersamento: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const tributoSelezionato = findTributoByKey(formData.codiceTributo);
  const tributiFiltrati = TRIBUTI.filter((tributo) => {
    if (!tributo.attivo) {
      return false;
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      tributo.codiceTributo.toLowerCase().includes(query)
      || tributo.nome.toLowerCase().includes(query)
    );
  });

  const tributiRaggruppati = CATEGORIE_ORDINE.reduce<Record<CategoriaTributo, Tributo[]>>((acc, categoria) => {
    acc[categoria] = tributiFiltrati.filter((tributo) => tributo.categoria === categoria);
    return acc;
  }, {} as Record<CategoriaTributo, Tributo[]>);

  const handleStep1 = () => {
    const importo = parseFloat(formData.importo.replace(',', '.'));

    if (!tributoSelezionato) {
      setFormError('Seleziona un tributo');
      return;
    }

    if (isNaN(importo) || importo <= 0) {
      setFormError('Inserisci un importo valido');
      return;
    }

    setFormError(null);
    setInput({
      codiceTributo: tributoSelezionato.codiceTributo,
      nomeTributo: tributoSelezionato.nome,
      sezioneF24: tributoSelezionato.sezioneF24,
      importoOriginale: importo,
    });
    setStep(2);
  };

  const handleStep2 = async () => {
    if (!formData.dataScadenza || !formData.dataVersamento) {
      setFormError('Compila entrambe le date');
      return;
    }

    if (!tributoSelezionato) {
      setFormError('Seleziona un tributo valido');
      return;
    }

    const scadenza = new Date(formData.dataScadenza);
    const versamento = new Date(formData.dataVersamento);

    if (versamento <= scadenza) {
      setFormError('La data di versamento deve essere successiva alla scadenza');
      return;
    }

    setFormError(null);
    setInput({
      dataScadenza: scadenza,
      dataVersamento: versamento,
      codiceTributo: tributoSelezionato.codiceTributo,
      nomeTributo: tributoSelezionato.nome,
      sezioneF24: tributoSelezionato.sezioneF24,
    });
    calculate();

    if (userId) {
      try {
        const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase;
        const importo = parseFloat(formData.importo.replace(',', '.'));
        const ris = calcolaRavvedimento({
          importoOriginale: importo,
          dataScadenza: scadenza,
          dataVersamento: versamento,
          codiceTributo: tributoSelezionato.codiceTributo,
          nomeTributo: tributoSelezionato.nome,
          sezioneF24: tributoSelezionato.sezioneF24,
        });

        if (client) {
          await client.from('ravvedimento_calc').insert({
            user_id: userId,
            tributo: tributoSelezionato.codiceTributo,
            importo,
            data_scadenza: formData.dataScadenza,
            data_pagamento: formData.dataVersamento,
            sanzione: ris.sanzioneRidotta,
            interessi: ris.totaleInteressi,
            totale: ris.totaleDaVersare,
          });
        }
      } catch (e) {
        console.error('Errore salvataggio calcolo:', e);
      }
    }
  };

  const handleReset = () => {
    reset();
    setFormData({ codiceTributo: '', importo: '', dataScadenza: '', dataVersamento: '' });
    setSearchQuery('');
    setFormError(null);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '40px 24px 80px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '100px',
          background: `${accent}12`, color: accent,
          fontSize: '12px', fontWeight: 700, marginBottom: '12px',
          fontFamily: 'var(--font-body)',
        }}>
          <span>Fiscale</span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 800, color: '#1D1D1F',
          margin: '0 0 8px', fontFamily: 'var(--font-display)',
          letterSpacing: '-0.03em',
        }}>
          RavvedimentoFacile
        </h1>
        <p style={{
          fontSize: '15px', color: '#6E6E73', margin: 0,
          fontFamily: 'var(--font-body)',
        }}>
          Calcola sanzioni e interessi del ravvedimento operoso in pochi secondi.
          Aggiornato al D.Lgs. 87/2024.
        </p>
      </div>

      {/* Calculator Card */}
      <div style={card}>
        {/* Card Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: '#FAFAFA',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: accent, display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: `0 4px 12px ${accent}30`,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="2" width="16" height="20" rx="2" stroke="white" strokeWidth="1.8" />
                  <path d="M8 6h8M8 10h8M8 14h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 style={{
                  fontSize: '17px', fontWeight: 800, color: '#1D1D1F',
                  margin: 0, fontFamily: 'var(--font-display)',
                }}>
                  Calcolo Ravvedimento
                </h2>
                <p style={{ fontSize: '12px', color: '#6E6E73', margin: '2px 0 0' }}>
                  Passaggio {step} di 3
                </p>
              </div>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: '100px',
              background: `${accent}10`, color: accent,
              fontSize: '11px', fontWeight: 700,
            }}>
              2026
            </span>
          </div>
          <StepIndicator current={step} />
        </div>

        {/* Card Body */}
        <div style={{ padding: '28px' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" {...fadeIn}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Tipo di Tributo</label>
                    <input
                      type="text"
                      placeholder="Cerca per codice o nome tributo..."
                      style={{ ...inputStyle, marginBottom: '12px' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                      style={inputStyle}
                      value={formData.codiceTributo}
                      onChange={(e) => setFormData((current) => ({ ...current, codiceTributo: e.target.value }))}
                    >
                      <option value="">Seleziona un tributo...</option>
                      {CATEGORIE_ORDINE.map((categoria) => {
                        const tributiCategoria = tributiRaggruppati[categoria];

                        if (tributiCategoria.length === 0) {
                          return null;
                        }

                        return (
                          <optgroup key={categoria} label={CATEGORIE_LABELS[categoria]}>
                            {tributiCategoria.map((tributo) => (
                              <option key={getTributoKey(tributo)} value={getTributoKey(tributo)}>
                                {tributo.codiceTributo} - {tributo.nome}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                      {tributiFiltrati.length === 0 && (
                        <option value="" disabled>
                          Nessun tributo trovato
                        </option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Importo Tributo Dovuto</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '15px', fontWeight: 700, color: '#999',
                      }}>
                        &euro;
                      </span>
                      <input
                        type="text"
                        placeholder="0,00"
                        style={{ ...inputStyle, paddingLeft: '36px' }}
                        value={formData.importo}
                        onChange={(e) => setFormData((current) => ({ ...current, importo: e.target.value }))}
                      />
                    </div>
                  </div>

                  {formError && (
                    <div style={{
                      padding: '12px 16px', borderRadius: '12px',
                      background: '#FEF2F2', color: '#DC2626',
                      fontSize: '13px', fontWeight: 600, border: '1px solid #FECACA',
                    }}>
                      {formError}
                    </div>
                  )}

                  <button style={btnPrimary} onClick={handleStep1}>
                    Continua
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M10 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" {...fadeIn}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    padding: '16px 20px', borderRadius: '16px',
                    background: `${accent}08`, border: `1px solid ${accent}15`,
                  }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                      Tributo selezionato
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1D1D1F', margin: '0 0 2px' }}>
                      {input.codiceTributo} - {input.nomeTributo}
                    </p>
                    {input.sezioneF24 && (
                      <p style={{ fontSize: '12px', color: '#6E6E73', margin: '0 0 6px' }}>
                        Sezione F24: {input.sezioneF24}
                      </p>
                    )}
                    <p style={{ fontSize: '16px', fontWeight: 800, color: accent, margin: 0 }}>
                      &euro; {input.importoOriginale?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Data Scadenza</label>
                      <input
                        type="date"
                        style={inputStyle}
                        value={formData.dataScadenza}
                        onChange={(e) => setFormData((current) => ({ ...current, dataScadenza: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Data Versamento</label>
                      <input
                        type="date"
                        style={inputStyle}
                        value={formData.dataVersamento}
                        onChange={(e) => setFormData((current) => ({ ...current, dataVersamento: e.target.value }))}
                      />
                    </div>
                  </div>

                  {formError && (
                    <div style={{
                      padding: '12px 16px', borderRadius: '12px',
                      background: '#FEF2F2', color: '#DC2626',
                      fontSize: '13px', fontWeight: 600, border: '1px solid #FECACA',
                    }}>
                      {formError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={btnOutline} onClick={() => setStep(1)}>Indietro</button>
                    <button style={{ ...btnPrimary, flex: 1 }} onClick={handleStep2}>
                      Calcola Risultato
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 12l-4-4v3H2v2h16v3l4-4z" fill="white" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && risultato && (
              <motion.div key="step3" {...fadeIn}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <StatCard label="Totale da versare" value={`\u20AC ${risultato.totaleDaVersare.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`} dark />
                    </div>
                    <StatCard label="Sanzione ridotta" value={`\u20AC ${risultato.sanzioneRidotta.toFixed(2)}`} />
                    <StatCard label="Interessi legali" value={`\u20AC ${risultato.totaleInteressi.toFixed(2)}`} />
                  </div>

                  <div style={{
                    padding: '14px 20px', borderRadius: '14px',
                    background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6E6E73' }}>Tipo</span>
                    <span style={{
                      padding: '4px 14px', borderRadius: '100px',
                      background: `${accent}12`, color: accent,
                      fontSize: '12px', fontWeight: 700,
                    }}>
                      {risultato.nomeTipoRavvedimento} ({risultato.giorniRitardo} gg)
                    </span>
                  </div>

                  <div style={{
                    padding: '14px 20px', borderRadius: '14px',
                    background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6E6E73' }}>Regime</span>
                    <span style={{
                      padding: '4px 14px',
                      borderRadius: '100px',
                      background: risultato.regime === 'POST_2024' ? '#D1FAE5' : '#E5E7EB',
                      color: risultato.regime === 'POST_2024' ? '#065F46' : '#4B5563',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}>
                      {risultato.regime === 'POST_2024' ? 'Regime post D.Lgs. 87/2024' : 'Regime ante riforma'}
                    </span>
                  </div>

                  {risultato.dettaglioInteressi.length > 0 && (
                    <div style={{
                      borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        padding: '14px 20px', background: '#FAFAFA',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                      }}>
                        <p style={{
                          fontSize: '13px', fontWeight: 700, color: '#1D1D1F',
                          margin: 0, fontFamily: 'var(--font-display)',
                        }}>
                          Dettaglio Interessi Legali
                        </p>
                      </div>
                      <div style={{ padding: '4px 0' }}>
                        {risultato.dettaglioInteressi.map((dettaglio) => (
                          <div key={dettaglio.anno} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '10px 20px', fontSize: '13px',
                          }}>
                            <span style={{ color: '#6E6E73' }}>
                              Anno {dettaglio.anno} ({dettaglio.giorniInAnno} gg, {dettaglio.tassoPercentuale}%)
                            </span>
                            <span style={{ fontWeight: 700, color: '#1D1D1F' }}>
                              &euro; {dettaglio.interessiAnno.toFixed(4)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                    <button style={btnOutline} onClick={handleReset}>
                      Nuovo calcolo
                    </button>
                    <PDFDownloadLink
                      document={<DocumentoPDF risultato={risultato} />}
                      fileName={`ravvedimento_${risultato.input.codiceTributo}_${format(new Date(), 'dd-MM-yyyy')}.pdf`}
                      style={{ flex: 1, textDecoration: 'none' }}
                    >
                      {({ loading }) => (
                        <button
                          style={{
                            ...btnPrimary,
                            background: '#10b981',
                            boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                          }}
                          disabled={loading}
                        >
                          {loading ? 'Generazione...' : 'Scarica PDF'}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && step !== 3 && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: '#FEF2F2', color: '#DC2626',
              fontSize: '13px', fontWeight: 600, border: '1px solid #FECACA',
              marginTop: '16px',
            }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div style={{
        marginTop: '24px', padding: '20px',
        borderRadius: '16px', background: '#F5F5F7',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <p style={{
          fontSize: '12px', color: '#6E6E73', margin: 0,
          lineHeight: 1.6, fontFamily: 'var(--font-body)',
        }}>
          <strong>Riferimento normativo:</strong> Art. 13 D.Lgs. 472/1997 come modificato dal D.Lgs. 87/2024.
          Regime sanzionatorio determinato automaticamente dalla data di scadenza:
          dal 01/09/2024 sanzione base 25%, prima del 01/09/2024 sanzione base 30%.
          Tassi di interesse legali aggiornati al 2026 (D.M. MEF 10 dicembre 2025, 1,60%).
          Questo strumento ha finalita informativa: verificare sempre con il proprio consulente fiscale.
        </p>
      </div>
    </div>
  );
};

export default RavvedimentoApp;
