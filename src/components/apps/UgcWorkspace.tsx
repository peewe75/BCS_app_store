'use client';

import React, { useEffect, useRef, useState } from 'react';
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

const IMAGE_COST = 25;
const VIDEO_COST = 75;
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

type CreditsModalState = {
  required: number;
  available: number;
  resumeStage: WorkflowStage;
};

type TooltipButtonProps = {
  buttonClassName: string;
  disabledReason: string | null;
  isDisabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

function TooltipButton(props: TooltipButtonProps) {
  return (
    <div className={`ugc-tooltip-wrap ${props.disabledReason ? 'has-tooltip' : ''}`}>
      <button
        className={props.buttonClassName}
        onClick={props.onClick}
        disabled={props.isDisabled}
        style={props.style}
      >
        {props.children}
      </button>
      {props.disabledReason ? <div className="ugc-inline-tooltip">{props.disabledReason}</div> : null}
    </div>
  );
}

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
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [creditsModal, setCreditsModal] = useState<CreditsModalState | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Generation options
  const [imageStyle, setImageStyle] = useState<string>(IMAGE_STYLES[0]);
  const [chaosLevel, setChaosLevel] = useState<number>(30);

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

  useEffect(() => {
    void refreshCredits(true);
  }, []);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs((prev) => [...prev, { timestamp: new Date(), message, type }]);
  };

  const refreshCredits = async (showSkeleton = false) => {
    if (showSkeleton) {
      setCreditsLoading(true);
    }

    try {
      const res = await fetch('/api/user/credits?app_id=ugc');
      const json = (await res.json().catch(() => ({}))) as { credits?: number; error?: string };

      if (!res.ok) {
        throw new Error(json.error ?? 'Impossibile recuperare i crediti.');
      }

      setCredits(json.credits ?? 0);
      setCreditsError(null);
    } catch {
      setCreditsError('Saldo non disponibile al momento.');
    } finally {
      setCreditsLoading(false);
    }
  };

  const openInsufficientCreditsModal = (
    error: apiClient.InsufficientCreditsError,
    resumeStage: WorkflowStage,
  ) => {
    setCredits(error.available);
    setCheckoutError(null);
    setCurrentStage(resumeStage);
    setCreditsModal({
      required: error.required,
      available: error.available,
      resumeStage,
    });
    addLog('Operazione bloccata: crediti insufficienti.', 'error');
  };

  const handleCloseCreditsModal = () => {
    if (creditsModal) {
      setCurrentStage(creditsModal.resumeStage);
    }

    setCheckoutError(null);
    setCheckoutLoading(false);
    setCreditsModal(null);
  };

  const handleCreditsCheckout = async () => {
    if (checkoutLoading) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ appId: 'ugc', planCode: 'credits' }),
      });
      const rawText = await response.text();

      let payload: { url?: string; error?: string } | null = null;
      try {
        payload = rawText ? (JSON.parse(rawText) as { url?: string; error?: string }) : null;
      } catch {
        payload = null;
      }

      if (response.ok && payload?.url) {
        window.location.href = payload.url;
        return;
      }

      setCheckoutError(payload?.error ?? 'Checkout Stripe non disponibile in questo momento.');
    } catch {
      setCheckoutError('Checkout Stripe non disponibile in questo momento.');
    } finally {
      setCheckoutLoading(false);
    }
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

    const validFiles = filesToProcess.filter((file) => {
      if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.type)) {
        addLog(`Formato non supportato per "${file.name}". Carica PNG, JPG o WEBP.`, 'error');
        return false;
      }

      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        addLog(`"${file.name}" supera il limite di 10MB.`, 'error');
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      if (event.target) event.target.value = '';
      return;
    }

    let processedCount = 0;
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev) => ({
          ...prev,
          productImages: [...prev.productImages, reader.result as string],
        }));
        processedCount += 1;
        if (processedCount === validFiles.length) {
          addLog(`${processedCount} image(s) uploaded successfully.`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });

    if (event.target) event.target.value = '';
  };

  const removeImage = (index: number) => {
    setData((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

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

      setData((prev) => ({ ...prev, imagePrompt: imgPrompt }));
      setCurrentStage(WorkflowStage.REVIEWING_IMAGE_PROMPT);
      addLog('Prompt creato. In attesa di revisione.', 'info');
    } catch (error: unknown) {
      setCurrentStage(WorkflowStage.ERROR);
      addLog(error instanceof Error ? error.message : 'Errore analisi prodotto', 'error');
    }
  };

  const runImageGeneration = async () => {
    if (!data.imagePrompt) return;

    try {
      setCurrentStage(WorkflowStage.GENERATING_IMAGE);
      addLog('Generazione immagine lifestyle...', 'info');

      const referenceImage = data.productImages.length > 0 ? data.productImages[0] : null;
      const lifestyleImg = await apiClient.generateLifestyleImage({
        prompt: data.imagePrompt,
        referenceImageBase64: referenceImage,
        aspectRatio: '16:9',
      });

      setData((prev) => ({ ...prev, generatedImage: lifestyleImg }));
      setCurrentStage(WorkflowStage.REVIEWING_GENERATED_IMAGE);
      addLog('Immagine generata. Revisiona e continua.', 'success');
      void refreshCredits();
    } catch (error: unknown) {
      if (error instanceof apiClient.InsufficientCreditsError) {
        openInsufficientCreditsModal(error, WorkflowStage.REVIEWING_IMAGE_PROMPT);
        return;
      }

      setCurrentStage(WorkflowStage.ERROR);
      addLog(error instanceof Error ? error.message : 'Errore generazione immagine', 'error');
    }
  };

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
        promptLanguage: 'English',
      });

      setData((prev) => ({ ...prev, videoPrompt: vidPrompt }));
      setCurrentStage(WorkflowStage.REVIEWING_VIDEO_PROMPT);
      addLog('Prompt video pronto. In attesa di revisione.', 'info');
    } catch (error: unknown) {
      setCurrentStage(WorkflowStage.ERROR);
      addLog(error instanceof Error ? error.message : 'Errore creazione prompt video', 'error');
    }
  };

  const runVideoGeneration = async () => {
    if (!data.generatedImage || !data.videoPrompt) return;

    try {
      setCurrentStage(WorkflowStage.GENERATING_VIDEO);
      addLog('Generazione video con Veo...', 'info');

      const videoUrl = await apiClient.generateVeoVideo({
        imageBase64: data.generatedImage,
        prompt: data.videoPrompt,
      });

      setData((prev) => ({ ...prev, videoUrl }));
      addLog('Video generato con successo!', 'success');
      setCurrentStage(WorkflowStage.COMPLETED);
      void refreshCredits();
    } catch (error: unknown) {
      if (error instanceof apiClient.InsufficientCreditsError) {
        openInsufficientCreditsModal(error, WorkflowStage.REVIEWING_VIDEO_PROMPT);
        return;
      }

      setCurrentStage(WorkflowStage.ERROR);
      addLog(error instanceof Error ? error.message : 'Errore generazione video', 'error');
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
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `ugc-video-${Date.now()}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      addLog('Download video avviato.', 'success');
    } catch {
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
    setData((prev) => ({ ...prev, generatedImage: null, videoPrompt: null, videoUrl: null }));
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
    setCreditsModal(null);
    setCheckoutError(null);
    setCheckoutLoading(false);
  };

  const imageDisabledReason =
    credits !== null && credits < IMAGE_COST ? `Crediti insufficienti (servono ${IMAGE_COST})` : null;
  const videoDisabledReason =
    credits !== null && credits < VIDEO_COST ? `Crediti insufficienti (servono ${VIDEO_COST})` : null;
  const isImageGenerationBlocked = currentStage === WorkflowStage.GENERATING_IMAGE || Boolean(imageDisabledReason);
  const isVideoGenerationBlocked = currentStage === WorkflowStage.GENERATING_VIDEO || Boolean(videoDisabledReason);

  return (
    <>
      <ConfigurationScreen
        productImages={data.productImages}
        onUpload={handleFileUpload}
        onRemoveImage={removeImage}
        onAnalyze={runAnalysis}
        isAnalyzing={currentStage === WorkflowStage.ANALYZING_PRODUCT}
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
        credits={credits}
        creditsLoading={creditsLoading}
        creditsError={creditsError}
      >
        {currentStage !== WorkflowStage.IDLE && (
          <div className="results-section">
            <div className="result-card">
              <div className="result-header">
                <span className="result-title">System Status</span>
                <span className="pill active" style={{ fontSize: 10, padding: '4px 12px' }}>
                  {currentStage.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="terminal-box">
                {logs.map((log, index) => (
                  <div key={index} style={{ color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#4ade80' : '#cbd5e1' }}>
                    <span style={{ opacity: 0.5 }}>[{log.timestamp.toLocaleTimeString()}]</span> {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

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
                      onChange={(event) => setData((prev) => ({ ...prev, imagePrompt: event.target.value }))}
                      className="prompt-box"
                      style={{ marginBottom: 16 }}
                      placeholder="Prompt immagine..."
                    />
                    <TooltipButton
                      buttonClassName="btn-primary"
                      isDisabled={isImageGenerationBlocked}
                      disabledReason={imageDisabledReason}
                      onClick={runImageGeneration}
                    >
                      Genera Immagine
                    </TooltipButton>
                    <p className="ugc-cost-note">Costo: questa operazione costa {IMAGE_COST} crediti.</p>
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
                        DL
                      </button>
                    </div>
                    <div className="action-row">
                      <button className="btn-secondary" onClick={handleRegenerateImage} style={{ flex: 1 }}>
                        Rigenera Immagine
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {data.generatedImage && (
              <div className="result-card" style={{ border: currentStage === WorkflowStage.REVIEWING_GENERATED_IMAGE ? '2px solid #8A2BE2' : '' }}>
                <div className="result-header">
                  <span className="result-title">Motion Layer</span>
                </div>

                {currentStage === WorkflowStage.REVIEWING_GENERATED_IMAGE && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ color: '#64748b', marginBottom: 20 }}>Immagine pronta. Configura il movimento video.</p>
                    <button className="btn-primary" onClick={runVideoPromptGeneration}>
                      Inizializza Video Engine
                    </button>
                  </div>
                )}

                {currentStage === WorkflowStage.REVIEWING_VIDEO_PROMPT && (
                  <>
                    <label className="label">Step 2: Director Prompt</label>
                    <textarea
                      value={data.videoPrompt || ''}
                      onChange={(event) => setData((prev) => ({ ...prev, videoPrompt: event.target.value }))}
                      className="prompt-box"
                      style={{ marginBottom: 16 }}
                      placeholder="Descrivi movimento camera, audio, azione..."
                    />
                    <TooltipButton
                      buttonClassName="btn-primary"
                      isDisabled={isVideoGenerationBlocked}
                      disabledReason={videoDisabledReason}
                      onClick={runVideoGeneration}
                      style={{ background: 'linear-gradient(135deg, #8A2BE2, #ec4899)' }}
                    >
                      Genera Video
                    </TooltipButton>
                    <p className="ugc-cost-note">Costo: questa operazione costa {VIDEO_COST} crediti.</p>
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
                        DL
                      </button>
                    </div>

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
                        <path d="M9 2v9M9 11l-3-3M9 11l3-3M3 14h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
                    <p style={{ color: '#ef4444', marginBottom: 16 }}>Si e verificato un errore. Controlla i log sopra.</p>
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

      {creditsModal && (
        <div className="ugc-modal-backdrop" role="presentation" onClick={handleCloseCreditsModal}>
          <div className="ugc-modal-card" role="dialog" aria-modal="true" aria-labelledby="ugc-credits-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="ugc-modal-icon">!</div>
            <h2 id="ugc-credits-modal-title">Crediti insufficienti</h2>
            <p className="ugc-modal-copy">
              Servono {creditsModal.required} crediti. Ne hai {creditsModal.available} disponibili.
            </p>
            <div className="ugc-modal-actions">
              <button className="ugc-modal-primary" onClick={handleCreditsCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? 'Apro Stripe...' : 'Acquista 1000 crediti - €9,60'}
              </button>
              <button className="ugc-modal-secondary" onClick={handleCloseCreditsModal} disabled={checkoutLoading}>
                Annulla
              </button>
            </div>
            {checkoutError ? <p className="ugc-modal-error">{checkoutError}</p> : null}
          </div>
        </div>
      )}

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
            onClick={(event) => event.stopPropagation()}
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
            X
          </button>
        </div>
      )}
    </>
  );
}
