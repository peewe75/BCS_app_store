
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PromptApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-24 pb-20 px-6 font-sans">
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[15%] right-[10%] w-[30%] h-[30%] bg-teal-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
            PromptApp Engineering Lab
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Padroneggia l'<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Intelligenza Artificiale</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Smetti di scrivere prompt che non funzionano. Trasforma istruzioni vaghe in comandi precisi
            che sbloccano il vero potenziale di GPT-4 e Gemini.
          </p>
        </motion.div>

        {/* Video Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] blur-xl opacity-20 dark:opacity-30"></div>

          <div className="relative bg-white dark:bg-[#1C1F26] rounded-[2rem] p-3 md:p-4 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden group">
            <div className="relative aspect-video bg-slate-950 rounded-[1.5rem] overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="https://picsum.photos/seed/promptapp_demo/1920/1080"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
                preload="none"
              >
                <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
                Browser non supportato.
              </video>

              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] cursor-pointer"
                    onClick={togglePlay}
                  >
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <span className="material-icons text-5xl ml-1">play_arrow</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: 'terminal',
              title: 'Auto-Optimization',
              desc: 'Inserisci un\'idea grezza e guarda l\'AI espanderla con ruoli, contesti e vincoli per risultati perfetti al primo colpo.'
            },
            {
              icon: 'library_books',
              title: 'Vast Library',
              desc: 'Accesso a centinaia di prompt pre-ingegnerizzati per marketing, coding, scrittura creativa e analisi dati commerciale.'
            },
            {
              icon: 'history_edu',
              title: 'Iterative Learning',
              desc: 'Impara le tecniche di prompting guardando i suggerimenti dell\'AI. Migliora la tua abilità di comunicazione con le macchine.'
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-white dark:bg-[#1C1F26] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                <span className="material-icons text-2xl">{item.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Action Card */}
        <motion.div
          className="mt-32 p-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[3rem] shadow-2xl shadow-emerald-500/20"
        >
          <div className="bg-white dark:bg-[#13151A] rounded-[2.9rem] p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Diventa un esperto di AI oggi</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
              Sblocca l'accesso completo alla libreria e agli strumenti di ottimizzazione automatica.
            </p>
            <button className="px-10 py-5 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/40 transition-all">
              Prova PromptApp Gratis
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PromptApp;
