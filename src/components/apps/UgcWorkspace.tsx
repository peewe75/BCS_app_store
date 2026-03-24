'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WorkflowStage, GenerationResult, LogEntry } from '@/src/apps/ugc/types';
import * as apiClient from '@/src/apps/ugc/api-client';
import { ConfigurationScreen } from './ugc/ConfigurationScreen';
import {
  IMAGE_STYLES,
  UGC_STYLES,
  TARGET_AUDIENCES,
  PLATFORMS,
  LANGUAGES,
} from '@/src/apps/ugc/constants';

export default function UgcWorkspace() {
  const [lightbox, setLightbox] = useState<{ src: string; type: 'image' | 'video' } | null>(null);
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(WorkflowStage.IDLE);
  const [data, setData] = useState<GenerationResult>({
    productImages: [],
    imagePrompt: null,
    generatedImage: null,
    videoPrompt: null,
    videoUrl: null,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Generation options
  const [imageStyle, setImageStyle] = useState<string>(IMAGE_STYLES[0]);
  const [chaosLevel, setChaosLevel] = useState<number>(30);
  const [useProModel, setUseProModel] = useState<boolean>(false);

  // Marketing options
  const [targetAudience, setTargetAudience] = useState(TARGET_AUDIENCES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [ugcStyle, setUgcStyle] = useState<string>(UGC_STYLES[0]);
  const [language, setLanguage] = useState<string>('Italian');

  // Dimensions
  const [prodWidth, setProdWidth] = useState('');
  const [prodHeight, setProdHeight] = useState('');
  const [prodUnit, setProdUnit] = useState('cm');

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [logs]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date(), message, type }]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - data.productImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    if (filesToProcess.length === 0) {
      addLog('Max 3 images limit reached.', 'error');
      return;
    }

    let processedCount = 0;
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({
          ...prev,
          productImages: [...prev.productImages, reader.result as string],
        }));
        processedCount++;
        if (processedCount === filesToProcess.length) {
          addLog(`${processedCount} image(s) uploaded successfully.`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });

    if (event.target) event.target.value = '';
  };

  const removeImage = (index: number) => {
    setData(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  // Step 1: Analyze product → image prompt
  const runAnalysis = async () => {
    if (data.productImages.length === 0) return;
    try {
      setCurrentStage(WorkflowStage.ANALYZING_PRODUCT);
      addLog(`Analisi immagini prodotto (${ugcStyle}, ${language})...`, 'info');

      const imgPrompt = await apiClient.generateLifestylePrompt({
        imagesBase64: data.productImages,
        style: imageStyle,
        chaos: chaosLevel,
        targetAudience,
        platform,
        ugcStyle,
        language,
        dimensions: { width: prodWidth, height: prodHeight, unit: prodUnit },
        promptLanguage: 'Italian',
      });
      setData(prev => ({ ...prev, imagePrompt: imgPrompt }));
      setCurrentStage(WorkflowStage.REVIEWING_IMAGE_PROMPT);
      addLog('Prompt creato. In attesa di revisione.', 'info');
    } catch (error: unknown) {
      setCurrentStage(WorkflowStage.ERROR);
      addLog((error instanceof Error ? error.message : 'Errore analisi prodotto'), 'error');
    }
  };

  // Step 2a: Generate lifestyle image
  const runImageGeneration = async () => {
    if (!data.imagePrompt) return;
    try {
      setCurrentStage(WorkflowStage.GENERATING_IMAGE);
      addLog(`Generazione immagine lifestyle...`, 'info');

      const referenceImage = data.productImages.length > 0 ? data.productImages[0] : null;
      const lifestyleImg = await apiClient.generateLifestyleImage({
        prompt: data.imagePrompt,
        referenceImageBase64: referenceImage,
        mode: useProModel ? 'quality' : 'speed',
        aspectRatio: '16:9',
      });

      setData(prev => ({ ...prev, generatedImage: lifestyleImg }));
      setCurrentStage(WorkflowStage.REVIEWING_GENERATED_IMAGE);
      addLog('Immagine generata. Revisiona e continua.', 'success');
    } catch (error: unknown) {
      setCurrentStage(WorkflowStage.ERROR);
      addLog((error instanceof Error ? error.message : 'Errore generazione immagine'), 'error');
    }
  };

  // Step 2b: Generate video prompt
  const runVideoPromptGeneration = async () => {
    if (!data.generatedImage) return;
    try {
      setCurrentStage(WorkflowStage.ANALYZING_SCENE);
      addLog('Analisi della scena...', 'info');

      const vidPrompt = await apiClient.generateVideoPrompt({
        generatedImageBase64: data.generatedImage,
        ugcStyle,
        platform,
        language,
        promptLanguage: 'Italian',
      });

      setData(prev => ({ ...prev, videoPrompt: vidPrompt }));
      setCurrentStage(WorkflowStage.REVIEWING_VIDEO_PROMPT);
      addLog('Prompt video pronto. In attesa di revisione.', 'info');
    } catch (error: unknown) {
      setCurrentStage(WorkflowStage.ERROR);
      addLog((error instanceof Error ? error.message : 'Errore creazione prompt video'), 'error');
    }
  };

  // Step 3: Generate video with Veo
  const runVideoGeneration = async () => {
    if (!data.generatedImage || !data.videoPrompt) return;
    try {
      setCurrentStage(WorkflowStage.GENERATING_VIDEO);
      addLog('Generazione video con Veo...', 'info');

      const videoUrl = await apiClient.generateVeoVideo({ imageBase64: data.generatedImage, prompt: data.videoPrompt });

      setData(prev => ({ ...prev, videoUrl }));
      addLog('Video generato con successo!', 'success');
      setCurrentStage(WorkflowStage.COMPLETED);
    } catch (error: unknown) {
      setCurrentStage(WorkflowStage.ERROR);
      addLog((error instanceof Error ? error.message : 'Errore generazione video'), 'error');
    }
  };

  const handleRetryVideo = () => {
    setCurrentStage(WorkflowStage.REVIEWING_VIDEO_PROMPT);
    addLog('Riprovando la generazione video...', 'info');
  };

  const handleDownloadVideo = async () => {
    if (!data.videoUrl) return;
    try {
      const response = await fetch(data.videoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ugc-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addLog('Download video avviato.', 'success');
    } catch {
      // Fallback: apri in nuova scheda
      window.open(data.videoUrl, '_blank');
      addLog('Video aperto in nuova scheda.', 'info');
    }
  };

  const handleDownloadImage = () => {
    if (!data.generatedImage) return;
    const link = document.createElement('a');
    link.href = data.generatedImage;
    link.download = 'lifestyle-generato.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('Immagine scaricata.', 'success');
  };

  const handleRegenerateImage = () => {
    setData(prev => ({ ...prev, generatedImage: null, videoPrompt: null, videoUrl: null }));
    setCurrentStage(WorkflowStage.REVIEWING_IMAGE_PROMPT);
    addLog('Rigenerazione immagine...', 'info');
  };

  const handleShare = async () => {
    if (!data.videoUrl) return;
    try {
      const response = await fetch(data.videoUrl);
      const blob = await response.blob();
      const file = new File([blob], 'ugc-ad.mp4', { type: 'video/mp4' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'UGC Ad', text: 'Video generato con BCS AI!' });
        addLog('Video condiviso!', 'success');
      } else {
        addLog('Condivisione Web non supportata su questo dispositivo.', 'error');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        addLog(`Condivisione fallita: ${error.message}`, 'error');
      }
    }
  };

  const reset = () => {
    setCurrentStage(WorkflowStage.IDLE);
    setData({ productImages: [], imagePrompt: null, generatedImage: null, videoPrompt: null, videoUrl: null });
    setLogs([]);
  };

  return (
    <>
    <ConfigurationScreen
      productImages={data.productImages}
      onUpload={handleFileUpload}
      onRemoveImage={removeImage}
      onAnalyze={runAnalysis}
      isAnalyzing={currentStage === WorkflowStage.ANALYZING_PRODUCT}
      useProModel={useProModel}
      setUseProModel={setUseProModel}
      chaosLevel={chaosLevel}
      setChaosLevel={setChaosLevel}
      width={prodWidth}
      setWidth={setProdWidth}
      height={prodHeight}
      setHeight={setProdHeight}
      unit={prodUnit}
      setUnit={setProdUnit}
      language={language}
      setLanguage={setLanguage}
      allLanguages={LANGUAGES}
      targetAudience={targetAudience}
      setTargetAudience={setTargetAudience}
      audienceOptions={TARGET_AUDIENCES}
      platform={platform}
      setPlatform={setPlatform}
      platformOptions={PLATFORMS}
      ugcStyle={ugcStyle}
      setUgcStyle={setUgcStyle}
      ugcStyleOptions={UGC_STYLES}
      imageStyle={imageStyle}
      setImageStyle={setImageStyle}
      imageStyleOptions={IMAGE_STYLES}
    >
      {currentStage !== WorkflowStage.IDLE && (
        <div className="results-section">

          {/* Status & Logs */}
          <div className="result-card">
            <div className="result-header">
              <span className="result-title">System Status</span>
              <span className="pill active" style={{ fontSize: 10, padding: '4px 12px' }}>
                {currentStage.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="terminal-box">
              {logs.map((log, i) => (
                <div key={i} style={{ color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#4ade80' : '#cbd5e1' }}>
                  <span style={{ opacity: 0.5 }}>[{log.timestamp.toLocaleTimeString()}]</span> {log.message}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Image Generation */}
          {(currentStage === WorkflowStage.GENERATING_IMAGE ||
            currentStage === WorkflowStage.REVIEWING_IMAGE_PROMPT ||
            data.generatedImage) && (
            <div className="result-card">
              <div className="result-header">
                <span className="result-title">Visual Base</span>
              </div>

              {currentStage === WorkflowStage.REVIEWING_IMAGE_PROMPT && !data.generatedImage && (
                <>
                  <label className="label">Step 1: Perfeziona il Prompt Immagine</label>
                  <textarea
                    value={data.imagePrompt || ''}
                    onChange={(e) => setData(prev => ({ ...prev, imagePrompt: e.target.value }))}
                    className="prompt-box"
                    style={{ marginBottom: 16 }}
                    placeholder="Prompt immagine..."
                  />
                  <button className="btn-primary" onClick={runImageGeneration}>
                    Genera Immagine 🎨
                  </button>
                </>
              )}

              {currentStage === WorkflowStage.GENERATING_IMAGE && (
                <div className="loading-skeleton">
                  <div className="skeleton-shimmer" />
                  <div className="loading-text">
                    <div className="loading-spinner" />
                    Generazione Immagine...
                  </div>
                </div>
              )}

              {data.generatedImage && (
                <>
                  <div className="media-container">
                    <img
                      src={data.generatedImage}
                      alt="Generated Asset"
                      onClick={() => setLightbox({ src: data.generatedImage!, type: 'image' })}
                      style={{ cursor: 'zoom-in' }}
                      title="Clicca per ingrandire"
                    />
                    <button className="download-btn" onClick={handleDownloadImage} title="Download">
                      ↓
                    </button>
                  </div>
                  <div className="action-row">
                    <button className="btn-secondary" onClick={handleRegenerateImage} style={{ flex: 1 }}>
                      Rigenera Immagine 🔄
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Video Generation */}
          {data.generatedImage && (
            <div className="result-card" style={{ border: currentStage === WorkflowStage.REVIEWING_GENERATED_IMAGE ? '2px solid #8A2BE2' : '' }}>
              <div className="result-header">
                <span className="result-title">Motion Layer</span>
              </div>

              {currentStage === WorkflowStage.REVIEWING_GENERATED_IMAGE && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ color: '#64748b', marginBottom: 20 }}>Immagine pronta. Configura il movimento video.</p>
                  <button className="btn-primary" onClick={runVideoPromptGeneration}>
                    Inizializza Video Engine ➡️
                  </button>
                </div>
              )}

              {currentStage === WorkflowStage.REVIEWING_VIDEO_PROMPT && (
                <>
                  <label className="label">Step 2: Director's Prompt</label>
                  <textarea
                    value={data.videoPrompt || ''}
                    onChange={(e) => setData(prev => ({ ...prev, videoPrompt: e.target.value }))}
                    className="prompt-box"
                    style={{ marginBottom: 16 }}
                    placeholder="Descrivi movimento camera, audio, azione..."
                  />
                  <button
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #8A2BE2, #ec4899)' }}
                    onClick={runVideoGeneration}
                  >
                    Genera Video 🎬
                  </button>
                </>
              )}

              {currentStage === WorkflowStage.GENERATING_VIDEO && (
                <div className="result-card" style={{ border: '2px solid #8A2BE2' }}>
                  <div className="result-header">
                    <span className="result-title">Rendering Video</span>
                  </div>
                  <div className="loading-skeleton" style={{ aspectRatio: '16/9' }}>
                    <div className="skeleton-shimmer" />
                    <div className="loading-text" style={{ bottom: 'auto', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <div className="loading-spinner" />
                      Elaborazione con Veo...
                    </div>
                  </div>
                  <div style={{ padding: '0 20px 20px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 5 }}>
                      <span>AI Processing</span>
                      <span>~60s</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar" />
                    </div>
                  </div>
                </div>
              )}

              {data.videoUrl && (
                <>
                  <div className="media-container" style={{ position: 'relative' }}>
                    <video
                      src={data.videoUrl}
                      controls
                      autoPlay
                      loop
                      onClick={() => setLightbox({ src: data.videoUrl!, type: 'video' })}
                      style={{ cursor: 'zoom-in' }}
                      title="Clicca per ingrandire"
                    />
                    <button className="download-btn" onClick={handleDownloadVideo} title="Download Video">
                      ↓
                    </button>
                  </div>

                  {/* Download button visibile */}
                  <button
                    onClick={handleDownloadVideo}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '14px 20px',
                      marginTop: 12,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #8A2BE2, #6d22b3)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 15,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(138,43,226,0.35)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                      <path d="M9 2v9M9 11l-3-3M9 11l3-3M3 14h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Scarica Video UGC
                  </button>

                  <div className="action-row" style={{ marginTop: 10 }}>
                    <button className="btn-secondary" onClick={handleRetryVideo} style={{ flex: 1, borderColor: '#8A2BE2', color: '#8A2BE2' }}>
                      Rigenera
                    </button>
                    <button className="btn-secondary" onClick={handleShare} style={{ flex: 1 }}>
                      Condividi
                    </button>
                    <button className="btn-secondary" onClick={reset} style={{ flex: 1, borderColor: '#cbd5e1', color: '#64748b' }}>
                      Nuovo Progetto
                    </button>
                  </div>
                </>
              )}

              {currentStage === WorkflowStage.ERROR && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ color: '#ef4444', marginBottom: 16 }}>Si è verificato un errore. Controlla i log sopra.</p>
                  <button className="btn-secondary" onClick={reset}>
                    Ricomincia
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </ConfigurationScreen>

    {/* Lightbox overlay */}
    {lightbox && (
      <div
        onClick={() => setLightbox(null)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'zoom-out',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '80vw',
            maxWidth: 860,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
          {lightbox.type === 'image' ? (
            <img src={lightbox.src} alt="Anteprima ingrandita" style={{ width: '100%', display: 'block' }} />
          ) : (
            <video src={lightbox.src} controls autoPlay style={{ width: '100%', display: 'block' }} />
          )}
        </div>
        <button
          onClick={() => setLightbox(null)}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            borderRadius: '50%',
            width: 40,
            height: 40,
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>
    )}
    </>
  );
}
