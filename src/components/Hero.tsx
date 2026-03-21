
import React from 'react';
import { AppView } from '../types';

interface HeroProps {
  onStart: (view: AppView) => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <section className="pt-40 pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50 dark:opacity-100"></div>
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent">
          La Prima Suite AI Italiana per <br /><span className="text-primary">Business & Creator</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12">
          Un ecosistema completo potenziato da Google Gemini.
          Genera <strong>Video UGC</strong> per TikTok, calcola le <strong>Tasse Forfettarie</strong> e automatizza il supporto clienti.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onStart(AppView.SIGN_UP)}
            className="bg-primary text-white px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/30"
          >
            Inizia Gratuitamente
          </button>
          <button className="border border-slate-300 dark:border-white/20 px-10 py-4 rounded-full text-lg font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            Guarda la Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
