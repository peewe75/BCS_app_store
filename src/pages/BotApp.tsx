
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BotApp: React.FC = () => {
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
        <div className="absolute top-[10%] right-[5%] w-[35%] h-[35%] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[5%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-indigo-500/10 text-indigo-500 rounded-full border border-indigo-500/20">
            BotApp AI Agent Builder
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Crea il tuo <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-400">Collaboratore Digitale</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Non un semplice chatbot, ma un agente intelligente istruito sui tuoi documenti.
            Guarda come configurare il tuo primo assistente in meno di 2 minuti.
          </p>
        </motion.div>

        {/* Video Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2.5rem] blur-xl opacity-20 dark:opacity-30"></div>

          <div className="relative bg-white dark:bg-[#1C1F26] rounded-[2rem] p-3 md:p-4 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden group">
            <div className="relative aspect-video bg-slate-950 rounded-[1.5rem] overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="https://picsum.photos/seed/botapp_demo/1920/1080"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
                preload="none"
              >
                <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
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
                    <div className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
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
              icon: 'psychology',
              title: 'Knowledge Injection',
              desc: 'Carica PDF, Word o URL. L\'agente impara istantaneamente tutto quello che serve per rispondere ai tuoi clienti.'
            },
            {
              icon: 'settings_suggest',
              title: 'Custom Identity',
              desc: 'Definisci il tono di voce, il linguaggio e gli obiettivi specifici. Dal supporto tecnico alla chiusura vendite.'
            },
            {
              icon: 'smart_toy',
              title: 'Integrazione Omnichannel',
              desc: 'Installa il bot sul tuo sito con una riga di codice o collegalo a WhatsApp e Telegram tramite le nostre API.'
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-white dark:bg-[#1C1F26] border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all shadow-sm"
            >
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-500">
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
          className="mt-32 p-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[3rem] shadow-2xl shadow-indigo-500/20"
        >
          <div className="bg-white dark:bg-[#13151A] rounded-[2.9rem] p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Pronto ad automatizzare la tua azienda?</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
              Inizia oggi con il piano gratuito e crea il tuo primo assistente virtuale istruito su misura.
            </p>
            <button className="px-10 py-5 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 transition-all">
              Configura il tuo Bot Ora
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BotApp;
