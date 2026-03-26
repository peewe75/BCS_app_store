import React, { useState } from 'react';
import { CONFIG, SOCIAL_LINKS } from './constants';
import { Calculator } from './components/Calculator';
import { ResultView } from './components/ResultView';
import { FAQ } from './components/FAQ';
import { CalculationResult } from './utils/calculation';

// Simple Icons as components
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

function App() {
  const [view, setView] = useState<'landing' | 'result'>('landing');
  const [resultData, setResultData] = useState<CalculationResult | null>(null);

  const handleCalculationComplete = (result: CalculationResult) => {
    setResultData(result);
    setView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setView('landing');
    setResultData(null);
    setTimeout(() => {
      const el = document.getElementById('calcolatore');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-bold text-2xl text-primary-700 tracking-tight">{CONFIG.STUDIO_NAME}</span>
            </div>
            <div>
              <a
                href={CONFIG.BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Prenota ora
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {view === 'landing' ? (
          <>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-slate-50 to-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                  Quanto guadagni <span className="text-primary-600">davvero</span><br /> col Forfettario?
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Calcola tasse e contributi in 30 secondi. Scopri il netto reale senza sorprese e prenota una verifica gratuita con i nostri esperti.
                </p>
                <div className="flex justify-center items-center gap-2 mb-12 text-sm text-slate-500 font-medium">
                  <span className="flex items-center"><CheckIcon /> Stima Gratuita</span>
                  <span className="flex items-center"><CheckIcon /> Aggiornato 2025</span>
                  <span className="flex items-center"><CheckIcon /> No Spam</span>
                </div>

                {/* Calculator Component */}
                <Calculator onCalculationComplete={handleCalculationComplete} />
              </div>
            </section>

            {/* How it Works */}
            <section className="py-16 bg-slate-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900">Come funziona</h2>
                  <p className="mt-4 text-lg text-slate-600">Tre semplici passi per chiarezza fiscale.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { title: "1. Inserisci i dati", desc: "Compila il form con il tuo fatturato e codice ATECO. Il sistema trova il coefficiente giusto per te." },
                    { title: "2. Ottieni il calcolo", desc: "I nostri esperti elaborano i dati e ti inviano una analisi dettagliata via email." },
                    { title: "3. Parla con un esperto", desc: "I numeri ti convincono? Prenota una verifica gratuita per confermare la tua posizione." }
                  ].map((step, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                        {i + 1}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                      <p className="text-slate-600">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Target Audience */}
            <section className="py-16 bg-white">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Per chi è questo strumento?</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {["Freelance Digitali", "Consulenti", "Artigiani", "Commercianti", "Professionisti Albo", "Start-upper"].map(tag => (
                    <span key={tag} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full font-medium border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <FAQ />
          </>
        ) : view === 'result' ? (
          <section className="py-20 bg-slate-50 min-h-[80vh] flex flex-col items-center justify-center">
            <div className="container px-4 mx-auto">
              <ResultView data={resultData!} onReset={handleReset} />
            </div>
          </section>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">{CONFIG.STUDIO_NAME}</h3>
              <p className="text-sm">Consulenza fiscale moderna per partite IVA forfettarie. Semplifichiamo il fisco italiano.</p>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Link Utili</h3>
              <ul className="space-y-2 text-sm">
                <li><a href={CONFIG.BOOKING_URL} className="hover:text-white transition-colors">Prenota Appuntamento</a></li>
                <li><a href={CONFIG.PRIVACY_URL} className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Disclaimer</h3>
              <p className="text-xs leading-relaxed">
                Le informazioni fornite da questo calcolatore sono a scopo puramente illustrativo e non costituiscono consulenza fiscale professionale. Si invita a verificare la propria posizione con un dottore commercialista.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs">
            &copy; {new Date().getFullYear()} {CONFIG.STUDIO_NAME}. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;