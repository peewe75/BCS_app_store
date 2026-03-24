'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator } from '../apps/forfapp/components/Calculator';
import { ResultView } from '../apps/forfapp/components/ResultView';
import { CalculationResult } from '../apps/forfapp/utils/calculation';
import { CalculatorFormData } from '../apps/forfapp/types';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient } from '@/src/lib/supabase/public';
import { ArrowLeft, CheckCircle2, Zap, Receipt, BarChart3 } from 'lucide-react';

const ForfApp: React.FC = () => {
  const [view, setView] = useState<'landing' | 'result'>('landing');
  const [resultData, setResultData] = useState<CalculationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { getToken } = useAuth();
  const { user } = useUser();

  const handleCalculationComplete = async (result: CalculationResult, formData: CalculatorFormData) => {
    setResultData(result);
    setView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (user) {
      setIsSaving(true);
      try {
        const supabase = createClerkSupabaseBrowserClient(getToken);
        if (!supabase) {
          console.error('Supabase client is null');
          return;
        }
        const { error } = await supabase.from('forfapp_calculations').insert({
          user_id: user.id,
          incasso_dichiarato: result.incasso,
          codice_ateco: formData.ateco?.code || null,
          gestione_previdenziale: result.nomeCassa,
          risultato_netto: result.netto,
          risultato_imposte: result.imposta,
          risultato_inps: result.contributi,
        });

        if (error) {
          console.error('Error saving calculation:', error);
        }
      } catch (err) {
        console.error('Exception saving calculation:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRecalculate = () => {
    setView('landing');
    setResultData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'Calcolo Real-time',
      desc: 'Incasso, imposta sostitutiva, contributi INPS (Gestione Separata, Artigiani o Cassa Professionale) e netto calcolati istantaneamente.',
    },
    {
      icon: <Receipt className="w-6 h-6 text-blue-500" />,
      title: 'Ricerca ATECO con AI',
      desc: "Non sai quale codice ATECO usare? Descrivi la tua attivita e l'AI ti aiuta a individuare il codice e il coefficiente di redditivita piu probabili.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
      title: 'Storico Simulazioni',
      desc: 'Tutte le tue simulazioni vengono salvate in automatico nel tuo profilo per confrontare diversi scenari di fatturato.',
    },
  ];

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="pt-20 pb-16 px-6 bg-gradient-to-br from-amber-50 via-white to-slate-50 dark:from-[#1a1800] dark:via-[#181A20] dark:to-[#181A20] border-b border-slate-200 dark:border-white/5">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2 text-center md:text-left">
                  <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase inline-block mb-5">
                    Strumento Fiscale Gratuito
                  </span>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
                    Calcolo Tasse <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">
                      Forfettario
                    </span>
                  </h1>
                  <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Dimentica i fogli Excel complicati. Calcola imposta sostitutiva, contributi INPS
                    e netto annuo in pochi secondi. L&apos;AI ti aiuta solo nella ricerca del codice
                    ATECO e del coefficiente di redditivita piu adatti.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-6">
                    <button
                      onClick={() => document.getElementById('app-calculator')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all"
                    >
                      Nuova Simulazione
                    </button>
                    <div className="flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-slate-600 dark:text-white border border-slate-300 dark:border-white/20">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Aggiornato 2026
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 justify-center md:justify-start">
                    {[
                      'Stima gratuita',
                      'Tutte le Casse Professionali',
                      'AI solo per il codice ATECO',
                      'Esporta PDF',
                    ].map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>

                <div className="md:w-1/2 relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-orange-400/20 blur-3xl rounded-full opacity-60" />
                  <div className="relative bg-white dark:bg-[#1E2026] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Anteprima Risultato</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Es. EUR 45.000</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Incasso Annuo', value: 'EUR 45.000', color: 'text-slate-700 dark:text-slate-200' },
                        { label: 'Imposta Sostitutiva (15%)', value: '- EUR 5.265', color: 'text-red-500' },
                        { label: 'Contributi INPS', value: '- EUR 9.157', color: 'text-red-500' },
                        { label: 'Netto Annuo Stimato', value: 'EUR 30.578', color: 'text-emerald-600 font-extrabold text-lg' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5 last:border-none">
                          <span className="text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
                          <span className={`text-sm ${row.color}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-center text-slate-400">
                      * Stima indicativa 2026 basata su coefficiente ATECO al 78% e Gestione Separata INPS
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-16 px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Tutto quello che ti serve per capire le tue tasse
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Un solo strumento, tutte le risposte fiscali che ti servono.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="p-7 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center mb-5">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="app-calculator" className="py-16 px-6 bg-slate-100 dark:bg-[#15171C] border-t border-slate-200 dark:border-white/5">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Simulatore Forfettario
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Inserisci i tuoi dati fiscali e ottieni la stima in tempo reale.
                  </p>
                </div>
                <Calculator onCalculationComplete={handleCalculationComplete} />
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="py-12 px-6 min-h-[80vh] bg-slate-50 dark:bg-[#181A20]"
          >
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleRecalculate}
                className="flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors mr-3">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-semibold">Nuova Simulazione</span>
              </button>

              {resultData && <ResultView data={resultData} onReset={handleRecalculate} />}

              {isSaving && (
                <div className="text-center mt-4 text-sm text-slate-400 animate-pulse">
                  Salvataggio simulazione in corso...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForfApp;
