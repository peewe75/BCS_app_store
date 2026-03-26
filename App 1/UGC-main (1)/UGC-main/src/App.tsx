import React, { useState, useEffect, useRef } from 'react';
import { WorkflowStage, GenerationResult, LogEntry } from './types';
import * as GeminiService from './services/geminiService';
import { Button } from './components/Button';
import { StageCard } from './components/StageCard';
import { ConfigurationScreen } from './components/ConfigurationScreen';
import { SettingsModal } from './components/SettingsModal';

const IMAGE_STYLES = [
  "Realistic Lifestyle",
  "Cinematic 4K",
  "Studio Minimalist",
  "Vintage Film",
  "Cyberpunk Neon",
  "Luxury Editorial",
  "Warm & Cozy",
  "Vibrant Pop Art"
];

const UGC_STYLES = [
  "Spontaneous Testimonial",
  "Unboxing / Hands-on",
  "How-to / Tutorial",
  "Aesthetic Showcase",
  "POV Experience",
  "Problem & Solution",
  "Behind the Scenes",
  "ASMR"
];

const TARGET_AUDIENCES = [
  "Gen Z, tech enthusiasts",
  "Millennials, home owners",
  "Parents of young children",
  "Fitness enthusiasts",
  "Beauty & Fashion lovers",
  "Gamers & Streamers",
  "Corporate Professionals",
  "Students & Academics"
];

const PLATFORMS = [
  "TikTok, Instagram Reels",
  "YouTube Shorts",
  "Facebook Video",
  "LinkedIn",
  "Twitter / X",
  "Pinterest Idea Pins",
  "Amazon Video Ads"
];

const LANGUAGES = [
  "English",
  "Italian",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Portuguese",
  "Chinese"
];

const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4"];

const TRANSLATIONS = {
  en: {
    title: "UGC Ad Creator",
    subtitle: "Transform product photos into viral video ads with BCS AI.",
    selectKey: "Select API Key",
    apiKeyActive: "API Key Active (Change)",
    step1Title: "1. Reference Product & Configuration",
    uploadClick: "Upload Product Images (Max 3)",
    uploadSupport: "Add perspectives or details. Max 3 images.",
    uploadLimit: "Max 3 images reached",
    targetLang: "Target Language",
    targetAudience: "Target Audience",
    platform: "Destination Platform",
    ugcStyle: "UGC Video Style",
    artStyle: "Visual Art Style",
    aspectRatio: "Aspect Ratio",
    chaosLevel: "Creativity Level",
    chaosLow: "Strict",
    chaosMid: "Balanced",
    chaosHigh: "Wild",
    modelMode: "Model Performance",
    modeSpeed: "⚡ Speed (Flash Image)",
    modeQuality: "✨ Quality (Pro Image)",
    startBtn: "Analyze & Create Prompt 🪄",
    step2Title: "2. Scene Generation",
    waitingGen: "Waiting for generation...",
    generatedPrompt: "Generated Prompt",
    editPromptHint: "Edit the prompt below to refine the image:",
    generateImageBtn: "Generate Image 🎨",
    step3Title: "3. UGC Video Creation (Veo 3.1)",
    veoPrompt: "Veo Prompt",
    editVideoPromptHint: "Edit the prompt below to refine the video movement and audio:",
    generateVideoBtn: "Generate Video 🎬",
    rendering: "Rendering video frame by frame...",
    finalOutput: "Final Output",
    loadingVideo: "Loading Video...",
    generatingVideo: "Generating Video...",
    videoWait: "Video will appear here",
    download: "Download MP4",
    downloadImage: "Download Image",
    share: "Share Video",
    shareError: "Sharing failed",
    shareNotSupported: "Web Share not supported on this device.",
    createNew: "Create New Project",
    logs: "Process Logs",
    ready: "Ready to start...",
    analyzing: "Analyzing product images...",
    genImage: "Generating lifestyle image...",
    analyzingScene: "Analyzing scene...",
    genVideo: "Generating video with Veo 3.1...",
    reviewImagePrompt: "Review Image Prompt",
    reviewVideoPrompt: "Review Video Prompt",
    retryVideo: "Retry Video Generation",
    dimensionsTitle: "Product Dimensions (For Accurate Scale)",
    width: "Width",
    height: "Height",
    unit: "Unit",
    otherOption: "Other (Custom)",
    typeCustom: "Type custom value...",
    regenerateImage: "Regenerate Image 🔄",
    continueToVideo: "Continue to Video ➡️"
  },
  it: {
    title: "UGC Ad Creator",
    subtitle: "Trasforma foto prodotti in video pubblicitari virali con BCS AI.",
    selectKey: "Seleziona API Key",
    apiKeyActive: "API Key Attiva (Cambia)",
    step1Title: "1. Prodotto & Configurazione",
    uploadClick: "Carica Foto Prodotto (Max 3)",
    uploadSupport: "Aggiungi prospettive o dettagli. Max 3 foto.",
    uploadLimit: "Max 3 foto raggiunte",
    targetLang: "Lingua del Video",
    targetAudience: "Target Pubblico",
    platform: "Piattaforma Destinazione",
    ugcStyle: "Stile Video UGC",
    artStyle: "Stile Artistico Visivo",
    aspectRatio: "Formato Immagine",
    chaosLevel: "Livello Creatività",
    chaosLow: "Rigoroso",
    chaosMid: "Bilanciato",
    chaosHigh: "Selvaggio",
    modelMode: "Performance Modello",
    modeSpeed: "⚡ Veloce (Flash Image)",
    modeQuality: "✨ Qualità (Pro Image)",
    startBtn: "Analizza & Crea Prompt 🪄",
    step2Title: "2. Generazione Scena",
    waitingGen: "In attesa della generazione...",
    generatedPrompt: "Prompt Generato",
    editPromptHint: "Modifica il prompt qui sotto per perfezionare l'immagine:",
    generateImageBtn: "Genera Immagine 🎨",
    step3Title: "3. Creazione Video UGC (Veo 3.1)",
    veoPrompt: "Prompt Veo",
    editVideoPromptHint: "Modifica il prompt qui sotto per perfezionare il movimento e l'audio:",
    generateVideoBtn: "Genera Video 🎬",
    rendering: "Rendering del video fotogramma per fotogramma...",
    finalOutput: "Output Finale",
    loadingVideo: "Caricamento Video...",
    generatingVideo: "Generazione Video in corso...",
    videoWait: "Il video apparirà qui",
    download: "Scarica MP4",
    downloadImage: "Scarica Immagine",
    share: "Condividi Video",
    shareError: "Condivisione fallita",
    shareNotSupported: "Condivisione Web non supportata su questo dispositivo.",
    createNew: "Crea Nuovo Progetto",
    logs: "Log di Processo",
    ready: "Pronto per iniziare...",
    analyzing: "Analisi delle immagini prodotto...",
    genImage: "Generazione immagine lifestyle...",
    analyzingScene: "Analisi della scena...",
    genVideo: "Generazione video con Veo 3.1...",
    reviewImagePrompt: "Revisione Prompt Immagine",
    reviewVideoPrompt: "Revisione Prompt Video",
    retryVideo: "Riprova Generazione Video",
    dimensionsTitle: "Dimensioni Prodotto (Per Scala Accurata)",
    width: "Larghezza",
    height: "Altezza",
    unit: "Unità",
    otherOption: "Altro (Personalizzato)",
    typeCustom: "Inserisci valore personalizzato...",
    regenerateImage: "Rigenera Immagine 🔄",
    continueToVideo: "Prosegui col Video ➡️"
  }
};

const App: React.FC = () => {
  const [apiKeySet, setApiKeySet] = useState(false);
  const [manualApiKey, setManualApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(WorkflowStage.IDLE);
  const [data, setData] = useState<GenerationResult>({
    productImages: [],
    imagePrompt: null,
    generatedImage: null,
    videoPrompt: null,
    videoUrl: null
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // UI Language
  const [interfaceLanguage, setInterfaceLanguage] = useState<'en' | 'it'>('it');

  // Generation Options
  const [imageStyle, setImageStyle] = useState<string>(IMAGE_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [chaosLevel, setChaosLevel] = useState<number>(30); // Default low-medium for stability
  const [useProModel, setUseProModel] = useState<boolean>(false); // Default to FALSE (Speed) for better stability

  // Marketing Options
  const [targetAudience, setTargetAudience] = useState(TARGET_AUDIENCES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [ugcStyle, setUgcStyle] = useState<string>(UGC_STYLES[0]);
  const [language, setLanguage] = useState<string>("English");

  // Dimensions
  const [prodWidth, setProdWidth] = useState("");
  const [prodHeight, setProdHeight] = useState("");
  const [prodUnit, setProdUnit] = useState("cm");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper for translations
  const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[interfaceLanguage][key];

  useEffect(() => {
    checkApiKey();
  }, []);

  // Scroll to bottom of logs when logs update
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [logs]);

  const checkApiKey = async () => {
    try {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySet(hasKey);
      }
    } catch (e) {
      console.error("Error checking API key status", e);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      await checkApiKey();
    } else {
      addLog('AI Studio environment not detected.', 'error');
    }
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date(), message, type }]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Convert FileList to Array and limit to remaining slots
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
            productImages: [...prev.productImages, reader.result as string]
          }));
          processedCount++;
          if (processedCount === filesToProcess.length) {
            addLog(`${processedCount} image(s) uploaded successfully.`, 'success');
          }
        };
        reader.readAsDataURL(file);
      });

      // Reset input so same file can be selected again if needed (after removal)
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setData(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };

  // Step 1: Analyze product and create Image Prompt
  const runAnalysis = async () => {
    if (data.productImages.length === 0) return;

    try {
      setCurrentStage(WorkflowStage.ANALYZING_PRODUCT);
      addLog(`${t('analyzing')} (${ugcStyle}, ${language})...`, 'info');

      const promptLang = interfaceLanguage === 'it' ? 'Italian' : 'English';

      const imgPrompt = await GeminiService.generateLifestylePrompt(
        data.productImages,
        imageStyle,
        chaosLevel,
        targetAudience,
        platform,
        ugcStyle,
        language,
        { width: prodWidth, height: prodHeight, unit: prodUnit },
        promptLang,
        manualApiKey
      );
      setData(prev => ({ ...prev, imagePrompt: imgPrompt }));
      setCurrentStage(WorkflowStage.REVIEWING_IMAGE_PROMPT);
      addLog('Prompt created based on all images. Waiting for review.', 'info');
    } catch (error: any) {
      console.error(error);
      setCurrentStage(WorkflowStage.ERROR);
      addLog(error.message || "Error analyzing product", 'error');
    }
  };

  // Step 2a: Generate Image ONLY
  const runImageGeneration = async () => {
    if (!data.imagePrompt) return;

    try {
      setCurrentStage(WorkflowStage.GENERATING_IMAGE);
      const modeName = useProModel ? 'Gemini 3 Pro' : 'Gemini 2.5 Flash';
      addLog(`${t('genImage')} (${modeName}, ${aspectRatio})...`, 'info');

      // Use the first image as the primary reference for composition
      const referenceImage = data.productImages.length > 0 ? data.productImages[0] : null;

      const lifestyleImg = await GeminiService.generateLifestyleImage(
        data.imagePrompt,
        referenceImage, // Pass primary image for "identical product" enforcement
        useProModel ? 'quality' : 'speed',
        aspectRatio,
        manualApiKey
      );

      setData(prev => ({ ...prev, generatedImage: lifestyleImg }));
      // STOP HERE - Let user review
      setCurrentStage(WorkflowStage.REVIEWING_GENERATED_IMAGE);
      addLog('Image generated. Please review and continue.', 'success');
    } catch (error: any) {
      console.error(error);
      setCurrentStage(WorkflowStage.ERROR);
      addLog(error.message || "Error generating image", 'error');
    }
  };

  // Step 2b: Generate Video Prompt (triggered by "Continue")
  const runVideoPromptGeneration = async () => {
    if (!data.generatedImage) return;

    try {
      setCurrentStage(WorkflowStage.ANALYZING_SCENE);
      addLog(t('analyzingScene'), 'info');

      const promptLang = interfaceLanguage === 'it' ? 'Italian' : 'English';

      // Pass the 'language' state to ensure the video prompt requests speech in that language
      const vidPrompt = await GeminiService.generateVideoPrompt(
        data.generatedImage,
        ugcStyle,
        platform,
        language,
        promptLang, // Pass the UI language as preference for prompt text
        manualApiKey
      );

      setData(prev => ({ ...prev, videoPrompt: vidPrompt }));
      setCurrentStage(WorkflowStage.REVIEWING_VIDEO_PROMPT);
      addLog('Video prompt ready. Waiting for review.', 'info');
    } catch (error: any) {
      console.error(error);
      setCurrentStage(WorkflowStage.ERROR);
      addLog(error.message || "Error creating video prompt", 'error');
    }
  }

  // Step 3: Generate Video
  const runVideoGeneration = async () => {
    if (!data.generatedImage || !data.videoPrompt) return;

    try {
      setCurrentStage(WorkflowStage.GENERATING_VIDEO);
      addLog(t('genVideo'), 'info');
      const videoUri = await GeminiService.generateVeoVideo(data.generatedImage, data.videoPrompt, manualApiKey);

      setIsVideoBuffering(true);
      setData(prev => ({ ...prev, videoUrl: videoUri }));
      addLog('Video generated successfully!', 'success');
      setCurrentStage(WorkflowStage.COMPLETED);

    } catch (error: any) {
      console.error(error);
      setCurrentStage(WorkflowStage.ERROR);
      addLog(error.message || "Error generating video", 'error');
    }
  };

  const handleRetryVideo = () => {
    // Allows user to go back to reviewing video prompt and try again
    setCurrentStage(WorkflowStage.REVIEWING_VIDEO_PROMPT);
    addLog('Retrying video generation step...', 'info');
  };

  const handleDownloadVideo = () => {
    if (!data.videoUrl) return;
    const a = document.createElement('a');
    a.href = data.videoUrl;
    a.download = `ugc-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog('Video download started.', 'success');
  };

  const handleRegenerateImage = () => {
    setData(prev => ({ ...prev, generatedImage: null, videoPrompt: null, videoUrl: null }));
    setCurrentStage(WorkflowStage.REVIEWING_IMAGE_PROMPT);
    addLog('Regenerating image...', 'info');
  };

  const handleShare = async () => {
    if (!data.videoUrl) return;

    try {
      const response = await fetch(data.videoUrl);
      const blob = await response.blob();
      const file = new File([blob as Blob], "ugc-ad.mp4", { type: "video/mp4" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'UGC Ad',
          text: 'Check out this video generated with Gemini & Veo!',
        });
        addLog('Video shared successfully!', 'success');
      } else {
        alert(t('shareNotSupported'));
      }
    } catch (error: any) {
      // Ignore AbortError (user cancelled share)
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        addLog(`${t('shareError')}: ${error.message}`, 'error');
      }
    }
  };

  const handleDownloadImage = () => {
    if (!data.generatedImage) return;
    const link = document.createElement('a');
    link.href = data.generatedImage;
    link.download = 'generated-lifestyle.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('Image downloaded', 'success');
  };

  const reset = () => {
    setCurrentStage(WorkflowStage.IDLE);
    setData({
      productImages: [],
      imagePrompt: null,
      generatedImage: null,
      videoPrompt: null,
      videoUrl: null
    });
    setLogs([]);
    setIsVideoBuffering(false);
  };

  // Render the new Configuration Screen for the initial stage
  // Main render - unified
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
        onSettingsClick={() => setShowSettings(true)}
      >
        {/* Results / Status Section rendered as children */}
        {currentStage !== WorkflowStage.IDLE && (
          <div className="results-section">

            {/* Status & Logs */}
            <div className={`result-card ${currentStage === WorkflowStage.COMPLETED ? 'bg-green-50' : ''}`}>
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

            {/* STEP 1: Image Generation View */}
            {(currentStage === WorkflowStage.GENERATING_IMAGE ||
              currentStage === WorkflowStage.REVIEWING_IMAGE_PROMPT ||
              data.generatedImage) && (
                <div className="result-card">
                  <div className="result-header">
                    <span className="result-title">
                      <i className="fas fa-image" style={{ marginRight: 8, color: '#8A2BE2' }}></i>
                      Visual Base
                    </span>
                  </div>

                  {currentStage === WorkflowStage.REVIEWING_IMAGE_PROMPT && !data.generatedImage && (
                    <>
                      <label className="label">Step 1: Refine Image Prompt</label>
                      <textarea
                        value={data.imagePrompt || ''}
                        onChange={(e) => setData(prev => ({ ...prev, imagePrompt: e.target.value }))}
                        className="prompt-box mb-4"
                        placeholder="Enter your image prompt here..."
                      />
                      <button className="btn-primary" onClick={runImageGeneration}>
                        Generate Cinematic Image <i className="fas fa-magic"></i>
                      </button>
                    </>
                  )}

                  {currentStage === WorkflowStage.GENERATING_IMAGE && (
                    <div className="loading-skeleton">
                      <div className="skeleton-shimmer"></div>
                      <div className="loading-text">
                        <div className="loading-spinner"></div>
                        Generating High-Fidelity Image...
                      </div>
                    </div>
                  )}

                  {data.generatedImage && (
                    <>
                      <div className="media-container">
                        <img src={data.generatedImage} alt="Generated Asset" />
                        <button className="download-btn" onClick={handleDownloadImage} title="Download High-Res">
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                      <div className="action-row">
                        <button className="btn-secondary" onClick={handleRegenerateImage} style={{ flex: 1, borderColor: '#cbd5e1', color: '#64748b' }}>
                          Regenerate Image <i className="fas fa-sync-alt"></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

            {/* STEP 2: Video Generation View */}
            {(data.generatedImage) && (
              <div className="result-card" style={{ border: currentStage === WorkflowStage.REVIEWING_GENERATED_IMAGE ? '2px solid #8A2BE2' : '' }}>
                <div className="result-header">
                  <span className="result-title">
                    <i className="fas fa-video" style={{ marginRight: 8, color: '#ec4899' }}></i>
                    Motion Layer
                  </span>
                </div>

                {currentStage === WorkflowStage.REVIEWING_GENERATED_IMAGE && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ color: '#64748b', marginBottom: 20 }}>Image is ready. Configure motion dynamics below.</p>
                    <button className="btn-primary" onClick={runVideoPromptGeneration}>
                      Initialize Video Engine <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                )}

                {currentStage === WorkflowStage.REVIEWING_VIDEO_PROMPT && (
                  <>
                    <label className="label">Step 2: Director's Prompt</label>
                    <textarea
                      value={data.videoPrompt || ''}
                      onChange={(e) => setData(prev => ({ ...prev, videoPrompt: e.target.value }))}
                      className="prompt-box mb-4"
                      placeholder="Describe camera movement, lighting changes, and subject action..."
                    />
                    <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #8A2BE2, #ec4899)' }} onClick={runVideoGeneration}>
                      Render 4K Video <i className="fas fa-film"></i>
                    </button>
                  </>
                )}

                {currentStage === WorkflowStage.GENERATING_VIDEO && (
                  <div className="result-card" style={{ border: '2px solid #8A2BE2' }}>
                    <div className="result-header">
                      <span className="result-title">
                        <i className="fas fa-video" style={{ marginRight: 8, color: '#ec4899' }}></i>
                        Rendering Video
                      </span>
                    </div>
                    <div className="loading-skeleton" style={{ aspectRatio: '16/9' }}>
                      <div className="skeleton-shimmer"></div>
                      <div className="loading-text" style={{ bottom: 'auto', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <div className="loading-spinner"></div>
                        Processing Frames with Veo 3.1...
                      </div>
                    </div>
                    <div style={{ padding: '0 20px 20px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 5 }}>
                        <span>AI Processing</span>
                        <span>~60s</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Video Output */}
                {data.videoUrl && (
                  <div className="media-container">
                    <video src={data.videoUrl} controls autoPlay loop />
                    <button className="download-btn" onClick={handleDownloadVideo} title="Download Video">
                      <i className="fas fa-file-download"></i>
                    </button>
                  </div>
                )}

                {data.videoUrl && (
                  <div className="action-row">
                    <button className="btn-secondary" onClick={handleRetryVideo} style={{ flex: 1, borderColor: '#8A2BE2', color: '#8A2BE2', marginRight: 10 }}>
                      Regenerate <i className="fas fa-sync-alt"></i>
                    </button>
                    <button className="btn-secondary" onClick={handleShare} style={{ flex: 1 }}>
                      Share <i className="fas fa-share-alt"></i>
                    </button>
                    <button className="btn-secondary" onClick={reset} style={{ flex: 1, borderColor: '#cbd5e1', color: '#64748b' }}>
                      New Project <i className="fas fa-plus"></i>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </ConfigurationScreen>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={manualApiKey}
        onApiKeyChange={setManualApiKey}
      />
    </>
  );
};

export default App;