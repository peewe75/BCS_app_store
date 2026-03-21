
import React from 'react';
import { AppView } from '../types';

interface BentoGridProps {
  onNavigate: (view: AppView) => void;
}

const BentoGrid: React.FC<BentoGridProps> = ({ onNavigate }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* ClipApp - Large Card (Top Left) */}
        <div 
          onClick={() => onNavigate(AppView.CLIP_APP)}
          className="md:col-span-8 md:row-span-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-3xl p-8 relative overflow-hidden group card-hover-effect cursor-pointer"
          style={{'--glow-color': 'rgba(236, 19, 144, 0.1)'} as React.CSSProperties}
        >
          <div className="bento-glow opacity-50 group-hover:opacity-100"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                   {/* Custom Logo Icon */}
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 10l5-4v12l-5-4v4H4V6h11v4z" />
                      </svg>
                   </div>
                   <span className="text-pink-500 font-bold text-xs uppercase tracking-widest">Video AI</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">ClipApp</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm text-sm">Trasforma foto statiche in Video UGC virali per TikTok in pochi secondi.</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-pink-500 group-hover:border-pink-500 transition-all">
                <span className="material-icons text-slate-400 group-hover:text-white text-lg">arrow_outward</span>
              </div>
            </div>

            {/* Simulated Video UI */}
            <div className="mt-auto relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 group-hover:translate-y-[-5px] transition-transform duration-500">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
               <img 
                alt="Video Preview" 
                className="w-full h-64 object-cover scale-100 group-hover:scale-105 transition-transform duration-700" 
                src="https://picsum.photos/seed/clipapp_visual/1200/800"
              />
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <span className="material-icons text-white">play_arrow</span>
                 </div>
                 <div className="h-1.5 w-32 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full w-2/3 bg-pink-500"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* ForfApp - Tall Card (Top Right) */}
        <div 
          onClick={() => onNavigate(AppView.FORF_APP)}
          className="md:col-span-4 md:row-span-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-3xl p-8 relative overflow-hidden group card-hover-effect cursor-pointer"
          style={{'--glow-color': 'rgba(16, 185, 129, 0.1)'} as React.CSSProperties}
        >
          <div className="bento-glow opacity-50 group-hover:opacity-100"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-6">
               <div className="flex items-center gap-3 mb-3">
                   {/* Custom Logo Icon */}
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                         <path d="M9 12l2 2 4-4" />
                      </svg>
                   </div>
                   <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Fisco Facile</span>
                </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">ForfApp</h3>
            </div>
            
            {/* Simulated Invoice/Calc UI */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex-grow flex flex-col justify-between group-hover:shadow-lg transition-shadow">
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-400">Netto Stimato</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">€ 28.500</span>
                  </div>
                  {/* Animated Bars */}
                  <div className="flex items-end gap-2 h-32 pb-2 border-b border-slate-200 dark:border-white/10">
                     <div className="w-1/3 bg-emerald-500/20 rounded-t-lg h-[40%] relative group-hover:h-[50%] transition-all duration-500">
                        <div className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg h-[60%]"></div>
                     </div>
                     <div className="w-1/3 bg-emerald-500/20 rounded-t-lg h-[70%] relative group-hover:h-[85%] transition-all duration-500 delay-75">
                        <div className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg h-[60%]"></div>
                     </div>
                     <div className="w-1/3 bg-emerald-500/20 rounded-t-lg h-[50%] relative group-hover:h-[65%] transition-all duration-500 delay-150">
                        <div className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg h-[60%]"></div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                     <span>Tasse: <span className="text-red-400">-5%</span></span>
                     <span>INPS: <span className="text-amber-400">-26%</span></span>
                  </div>
               </div>
               <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Calcolo 2024 Aggiornato
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* BotApp - EXTRA WIDE Card */}
        <div 
          onClick={() => onNavigate(AppView.BOT_APP)}
          className="md:col-span-12 min-h-[280px] bg-gradient-to-br from-white to-blue-50 dark:from-card-dark dark:to-blue-900/20 border border-slate-200 dark:border-border-dark rounded-3xl p-10 relative overflow-hidden group card-hover-effect cursor-pointer flex flex-col md:flex-row items-center justify-between gap-10"
        >
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors"></div>

            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 {/* Custom Logo Icon */}
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:animate-pulse transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <circle cx="12" cy="5" r="2" />
                      <path d="M12 7v4" />
                      <line x1="8" y1="16" x2="8" y2="16" />
                      <line x1="16" y1="16" x2="16" y2="16" />
                    </svg>
                 </div>
                 <span className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">AI Assistant</span>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">BotApp</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
                Non perdere mai più un cliente. Integra chatbot empatici che gestiscono il supporto, qualificano i lead e aumentano le vendite 24/7 sul tuo sito web.
              </p>
              <div className="mt-8 flex items-center gap-4 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform">
                <span>Configura il tuo Bot</span>
                <span className="material-icons text-sm">arrow_forward</span>
              </div>
            </div>
            
            {/* Custom 3D Logo Animation - Enlarged */}
            <div className="w-48 h-48 relative flex-shrink-0">
               {/* Main Bubble */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-600 rounded-3xl rounded-tr-none flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-float z-10">
                  <span className="material-icons text-white text-5xl">forum</span>
               </div>
               {/* Secondary Bubble */}
               <div className="absolute top-1/2 left-1/2 translate-x-8 -translate-y-12 w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl rounded-bl-none flex items-center justify-center shadow-xl animate-float-delayed">
                  <span className="material-icons text-blue-500 dark:text-blue-300 text-3xl">more_horiz</span>
               </div>
               {/* Circle Decoration */}
               <div className="absolute inset-0 border-2 border-dashed border-blue-300 dark:border-blue-700/50 rounded-full animate-spin-slow opacity-30"></div>
            </div>
        </div>

        {/* PromptApp - EXTRA WIDE Card */}
        <div 
          onClick={() => onNavigate(AppView.PROMPT_APP)}
          className="md:col-span-12 min-h-[280px] bg-gradient-to-br from-white to-amber-50 dark:from-card-dark dark:to-amber-900/20 border border-slate-200 dark:border-border-dark rounded-3xl p-10 relative overflow-hidden group card-hover-effect cursor-pointer flex flex-col md:flex-row items-center justify-between gap-10"
        >
          {/* Background Decoration */}
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-amber-500/20 transition-colors"></div>

            <div className="flex-1 order-2 md:order-1 relative z-10">
               <div className="flex items-center gap-3 mb-4">
                 {/* Custom Logo Icon */}
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      <path d="M15 12l-3 3" />
                      <path d="M12 15l-3-3" />
                    </svg>
                 </div>
                 <span className="text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">Prompt Engineering</span>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">PromptApp</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
                Smetti di ottenere risposte generiche. Trasforma istruzioni vaghe in prompt strutturati e perfetti per ottenere il massimo da GPT-4, Gemini e Claude.
              </p>
               <div className="mt-8 flex items-center gap-4 text-sm font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-2 transition-transform">
                <span>Ottimizza Prompt</span>
                <span className="material-icons text-sm">arrow_forward</span>
              </div>
            </div>

            {/* Custom 3D Logo Animation - Enlarged */}
            <div className="w-48 h-48 relative flex-shrink-0 order-1 md:order-2 flex items-center justify-center">
                <div className="relative w-40 h-32 bg-slate-900 dark:bg-black rounded-xl border border-slate-700 shadow-2xl transform rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500 flex flex-col overflow-hidden">
                   {/* Terminal Header */}
                   <div className="h-6 bg-slate-800 flex items-center px-3 gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                   </div>
                   {/* Terminal Body */}
                   <div className="p-4 font-mono text-[10px] text-emerald-400 leading-relaxed">
                      <span className="opacity-50">$ optimize --strict</span><br/>
                      <span className="text-white">Analyzing context...</span><br/>
                      <span className="text-amber-300">Refining logic...</span><br/>
                      <span className="text-white font-bold">Done! 100% ✨</span>
                   </div>
                   {/* Magic Wand Overlay */}
                   <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse-slow">
                      <span className="material-icons text-white text-2xl">auto_fix_normal</span>
                   </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
