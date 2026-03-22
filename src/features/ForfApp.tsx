'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ForfApp: React.FC = () => {
  // Simple state for the demo calculation
  const [revenue, setRevenue] = useState<number>(30000);
  const coefficiente = 0.78; // Example coefficient for professionals

  const taxableIncome = revenue * coefficiente;
  const inps = taxableIncome * 0.26; // Example INPS rate
  const tax = taxableIncome * 0.05; // 5% flat tax example
  const net = revenue - inps - tax;

  return (
    <div className="w-full">
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
                Calcola Ora
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

      {/* --- Premium Video Showcase --- */}
      <section className="py-20 px-6 bg-white dark:bg-[#13151A] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Guarda come funziona</h2>
            <p className="text-slate-500 dark:text-slate-400">Una rapida panoramica di come ForfApp semplifica la tua gestione fiscale.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-primary rounded-[2.5rem] blur-xl opacity-20"></div>
            <div className="relative bg-white dark:bg-card-dark rounded-[2rem] p-3 md:p-4 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden aspect-video">
              <video
                className="w-full h-full object-cover rounded-[1.5rem]"
                controls
                poster="https://picsum.photos/seed/forfapp_demo/1920/1080"
                preload="none"
              >
                <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" type="video/mp4" />
                Browser non supportato.
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'calculate', title: 'Calcolo Real-time', desc: 'Inserisci il fatturato annuo e vedi istantaneamente tasse e contributi INPS Gestione Separata.' },
            { icon: 'receipt_long', title: 'Fatturazione Elettronica', desc: 'Genera pro-forma conformi alla normativa italiana vigente per forfettari.' },
            { icon: 'calendar_today', title: 'Scadenzario Fiscale', desc: 'Alert intelligenti per Saldo e Acconto F24 giugno e novembre.' }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-colors shadow-sm dark:shadow-none">
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span className="material-icons text-primary" aria-hidden="true">dashboard</span>
              Simulatore Tasse
            </h2>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">LIVE DEMO</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Input Section */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-lg dark:shadow-none">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6">Dati Fiscali</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="revenue-range" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Fatturato Annuo (€)</label>
                    <input
                      id="revenue-range"
                      type="range"
                      min="0"
                      max="85000"
                      step="500"
                      value={revenue}
                      onChange={(e) => setRevenue(Number(e.target.value))}
                      className="w-full accent-primary mb-2"
                      aria-label="Seleziona fatturato annuo tramite slider"
                    />
                    <div className="flex items-center bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3">
                      <span className="text-slate-500 mr-2">€</span>
                      <input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(Number(e.target.value))}
                        className="bg-transparent text-slate-900 dark:text-white font-bold text-lg w-full outline-none"
                        aria-label="Inserisci fatturato annuo numerico"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Codice ATECO / Redditività</label>
                    <select className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-primary">
                      <option value="0.78">Libero Professionista (Coeff. 78%)</option>
                      <option value="0.67">Artigiano/Commerciante (Coeff. 67%)</option>
                      <option value="0.40">E-commerce / Dropshipping (Coeff. 40%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Aliquota Imposta Sostitutiva</label>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-lg bg-primary text-white font-bold text-sm" aria-pressed="true">Start-up (5%)</button>
                      <button className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium text-sm border border-slate-200 dark:border-transparent" aria-pressed="false">Standard (15%)</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-indigo-700 p-6 rounded-2xl text-white shadow-xl">
                <h4 className="font-bold text-lg mb-2">Dubbi fiscali?</h4>
                <p className="text-white/80 text-sm mb-4">Chiedi a BotApp una consulenza fiscale basata sulla normativa italiana.</p>
                <button className="w-full bg-white text-primary py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-colors">
                  Chatta con Commercialista AI
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Totale */}
              <div className="md:col-span-2 bg-white dark:bg-card-dark p-8 rounded-2xl border border-slate-200 dark:border-border-dark relative overflow-hidden shadow-lg dark:shadow-none">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[80px] rounded-full"></div>
                <div className="relative z-10">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Netto Stimato in Tasca</span>
                  <div className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4 tracking-tight">
                    € {net.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(net / revenue) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                    <span>0%</span>
                    <span>Margine reale: {((net / revenue) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Tasse */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="material-icons text-red-500" aria-hidden="true">account_balance</span>
                  </div>
                  <span className="text-red-500 font-bold text-sm">- € {tax.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</span>
                </div>
                <h4 className="text-slate-900 dark:text-white font-bold text-lg">Imposta Sostitutiva</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Calcolata sul {coefficiente * 100}% del fatturato (base imponibile).</p>
              </div>

              {/* INPS */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <span className="material-icons text-amber-500" aria-hidden="true">savings</span>
                  </div>
                  <span className="text-amber-500 font-bold text-sm">- € {inps.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</span>
                </div>
                <h4 className="text-slate-900 dark:text-white font-bold text-lg">Contributi INPS</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestione Separata (aliquota 26,07% ca.)</p>
              </div>

              {/* Chart Placeholder */}
              <div className="md:col-span-2 bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark flex items-center justify-center h-48 border-dashed shadow-sm dark:shadow-none">
                <div className="text-center text-slate-400">
                  <span className="material-icons text-4xl mb-2" aria-hidden="true">pie_chart</span>
                  <p className="text-sm">Grafico distribuzione spese</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForfApp;
