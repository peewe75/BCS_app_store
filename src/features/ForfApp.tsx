'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator } from '../apps/forfapp/components/Calculator';
import { ResultView } from '../apps/forfapp/components/ResultView';
import { CalculationResult } from '../apps/forfapp/utils/calculation';
import { CalculatorFormData } from '../apps/forfapp/types';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient } from '@/src/lib/supabase/public';
import { ArrowLeft } from 'lucide-react';

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

    // Save calculation to Supabase
    if (user) {
      setIsSaving(true);
      try {
        const supabase = createClerkSupabaseBrowserClient(getToken);
        if (!supabase) {
          console.error("Supabase client is null");
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
          console.error("Error saving calculation:", error);
        }
      } catch (err) {
        console.error("Exception saving calculation:", err);
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
            {/* --- Landing Page Section --- */}
            <section className="pt-32 pb-20 px-6 bg-slate-50 dark:bg-[#181A20] border-b border-slate-200 dark:border-white/5">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2 text-center md:text-left">
                  <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase inline-block mb-6">
                    Strumento Fiscale Gratuito
                  </span>
                  <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                    Calcolo Tasse <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Regime Forfettario</span>
                  </h1>
                  <p className="text-xl text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Dimentica i fogli Excel complicati. ForfApp è il simulatore definitivo per Partite IVA in Italia.
                    Calcola imposta sostitutiva, saldo INPS e netto in tempo reale.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => document.getElementById('app-dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all"
                      aria-label="Vai al calcolatore tasse"
                    >
                      Nuova Simulazione
                    </button>
                    <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                      <span className="material-icons text-emerald-500" aria-hidden="true">check_circle</span>
                      Aggiornato 2024/25
                    </button>
                  </div>
                </div>

                <div className="md:w-1/2 relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-emerald-500/30 blur-3xl rounded-full opacity-30"></div>
                  <img
                    src="https://picsum.photos/seed/finance/800/600"
                    alt="Anteprima Dashboard ForfApp per calcolo tasse partita IVA"
                    loading="lazy"
                    className="relative rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10"
                  />
                </div>
              </div>
            </section>

            {/* --- Features Grid --- */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: 'calculate', title: 'Calcolo Real-time', desc: 'Inserisci il fatturato annuo e vedi istantaneamente tasse e contributi INPS Gestione Separata o Casse Private.' },
                  { icon: 'receipt_long', title: 'Ricerca ATECO Intelligente', desc: 'Non sai il tuo ATECO? Usa la ricerca semantica basata su AI per trovare il codice esatto per la tua attività.' },
                  { icon: 'calendar_today', title: 'Dashboard Personale', desc: 'Tutte le tue simulazioni salvate in un unico posto per comparare diversi scenari di fatturato nel tempo.' }
                ].map((f, i) => (
                  <div key={i} className="p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-sm dark:shadow-none">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                      <span className="material-icons text-primary text-2xl" aria-hidden="true">{f.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* --- The Application (Dashboard) --- */}
            <section id="app-dashboard" className="py-20 px-6 bg-slate-100 dark:bg-[#15171C] border-t border-slate-200 dark:border-white/5">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
                    <span className="material-icons text-primary" aria-hidden="true">dashboard</span>
                    Simulatore Forfettario
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Inserisci i tuoi dati fiscali per una stima immediata e precisa.
                  </p>
                </div>

                <Calculator onCalculationComplete={handleCalculationComplete} />
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="py-12 px-6 min-h-[80vh] bg-slate-50 dark:bg-[#181A20]"
          >
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleRecalculate}
                className="flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors mr-3">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-semibold">Torna alla Dashboard</span>
              </button>
              
              {resultData && <ResultView data={resultData} onReset={handleRecalculate} />}
              {isSaving && (
                <div className="text-center mt-4 text-sm text-slate-500">
                  <p>Salvataggio della simulazione in corso...</p>
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
