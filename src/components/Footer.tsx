
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-card-dark py-20 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">BCS Suite</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6">
              La suite definitiva di strumenti AI progettati per massimizzare la produttività digitale delle Partite IVA in Italia.
            </p>
            {/* Local SEO Trust Signals */}
            <div className="text-xs text-slate-400 dark:text-slate-500">
              <p>BCS Digital Solutions S.r.l.</p>
              <p>P.IVA IT00000000000</p>
              <p>Milano, Italia 🇮🇹</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Prodotti</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400">
              <li><a className="hover:text-primary transition-colors text-sm" href="#" title="Crea Video UGC">ClipApp UGC</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#" title="Calcolo Tasse Forfettario">ForfApp Fisco</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#" title="Chatbot AI">BotApp</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#" title="Prompt Engineering">PromptApp</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Azienda</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400">
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Chi Siamo</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Lavora con noi</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Blog AI Italia</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Press Kit</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Supporto</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400">
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Centro Assistenza</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Contatti</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Stato Servizi</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Legale</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400">
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Termini di Servizio</a></li>
              <li><a className="hover:text-primary transition-colors text-sm" href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-slate-200 dark:border-white/5">
          <p className="text-slate-400 dark:text-slate-500 text-sm">© 2024 BCS AI Suite. Tutti i diritti riservati.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-400">Sistemi Operativi</span>
            <span className="ml-2 text-xs border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded text-slate-500">Made in Italy 🇮🇹</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
