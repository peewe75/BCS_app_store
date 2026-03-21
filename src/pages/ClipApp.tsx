
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ClipApp: React.FC = () => {
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-24 pb-20 px-6">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-primary/10 text-primary rounded-full border border-primary/20">
            ClipApp AI Video Generator
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Video UGC <span className="text-primary italic">Professionali</span> <br />
            in Pochi Secondi
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Trasforma le tue idee in video virali per TikTok, Reels e Shorts.
            Guarda la nostra demo video per scoprire la potenza dell'AI nella creazione di contenuti.
          </p>
        </motion.div>

        {/* Premium Video Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Decorative Frame Elements */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-indigo-500 to-primary rounded-[2.5rem] blur-xl opacity-20 dark:opacity-40 animate-pulse-slow"></div>

          <div className="relative bg-white dark:bg-[#1C1F26] rounded-[2rem] p-3 md:p-4 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden group">
            <div className="relative aspect-video bg-black rounded-[1.5rem] overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="https://picsum.photos/seed/clipapp_demo/1920/1080"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
                preload="none"
              >
                <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Overlay Controls */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group-hover:bg-black/30 transition-all"
                    onClick={togglePlay}
                  >
                    <div className="relative group/play">
                      <div className="absolute -inset-4 bg-primary rounded-full blur-2xl opacity-50 group-hover/play:opacity-70 transition-opacity"></div>
                      <div className="relative w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl transform transition-transform group-hover/play:scale-110">
                        <span className="material-icons text-5xl ml-1">play_arrow</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Bar (Simulated or real) */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                <motion.div
                  className="h-full bg-primary"
                  style={{ width: '0%' }} // You could hook this up to video time
                />
              </div>
            </div>
          </div>

          {/* Video Caption/Highlight */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Video Demo Recente</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
              <span className="material-icons text-primary text-sm">schedule</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Durata: 1:30 min</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid - Explaining the Video */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: 'auto_fix_high',
              title: 'Scripting Magico',
              desc: 'Come mostrato nel video, l\'AI analizza il prodotto e scrive script persuasivi in 3 versioni: Hook, Body e CTA.',
              delay: 0.4
            },
            {
              icon: 'movie_edit',
              title: 'Editing Dinamico',
              desc: 'Montaggio automatico con sottotitoli animati, zoom e tagli a tempo di musica royalty-free incorporata.',
              delay: 0.5
            },
            {
              icon: 'trending_up',
              title: 'Ottimizzato TikTok',
              desc: 'Formato verticale 9:16 nativo con algoritmi di ritenzione dell\'attenzione testati per la viralità.',
              delay: 0.6
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              className="relative p-8 rounded-3xl bg-white dark:bg-[#1C1F26] border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-icons text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Large CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-primary to-indigo-800 text-white text-center shadow-2xl shadow-primary/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto a trasformare il tuo business?</h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Unisciti a centinaia di brand che utilizzano ClipApp per abbattere i costi di produzione video dell'80%.
            </p>
            <button className="px-10 py-5 bg-white text-primary rounded-full font-extrabold text-xl hover:scale-105 transition-all shadow-xl">
              Crea il tuo primo Video Gratis
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClipApp;
