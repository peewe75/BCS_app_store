'use client';

import { useRef } from 'react';
import { STYLE_IMAGES } from '@/src/apps/ugc/constants';

interface ConfigurationScreenProps {
  productImages: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  chaosLevel: number;
  setChaosLevel: (val: number) => void;
  width: string;
  setWidth: (val: string) => void;
  height: string;
  setHeight: (val: string) => void;
  unit: string;
  setUnit: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  allLanguages: string[];
  targetAudience: string;
  setTargetAudience: (val: string) => void;
  audienceOptions: string[];
  platform: string;
  setPlatform: (val: string) => void;
  platformOptions: string[];
  ugcStyle: string;
  setUgcStyle: (val: string) => void;
  ugcStyleOptions: string[];
  imageStyle: string;
  setImageStyle: (val: string) => void;
  imageStyleOptions: string[];
  credits: number | null;
  creditsLoading: boolean;
  creditsError: string | null;
  children?: React.ReactNode;
}

function getCreditsTone(credits: number | null) {
  if (credits === null) return 'neutral';
  if (credits > 100) return 'positive';
  if (credits >= 25) return 'warning';
  return 'danger';
}

function formatCreditsLabel(credits: number | null) {
  if (credits === null) return 'Saldo non disponibile';
  return `${credits} ${credits === 1 ? 'credito' : 'crediti'}`;
}

export function ConfigurationScreen(props: ConfigurationScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSecondaryContent = Boolean(props.children);
  const creditsTone = getCreditsTone(props.credits);

  return (
    <div className="ugc-workspace">
      <div className={`container ${hasSecondaryContent ? 'has-secondary' : 'is-solo'}`}>
        <div className="workspace-topbar">
          <div className="workspace-heading">
            <span className="workspace-eyebrow">BCS AI Workspace</span>
            <h1>UGC Ad Creator</h1>
            <p>Carica il prodotto, prepara la scena e genera asset UGC con crediti sempre visibili.</p>
          </div>

          <div className="workspace-credits-panel">
            <span className="workspace-credits-label">UGC Credits</span>
            {props.creditsLoading ? (
              <div className="credits-skeleton" aria-hidden="true">
                <div className="credits-skeleton-shimmer" />
              </div>
            ) : (
              <div className={`credits-badge credits-${creditsTone}`}>
                <span className="credits-badge-icon">UGC</span>
                <span className="credits-badge-value">{formatCreditsLabel(props.credits)}</span>
              </div>
            )}
            {props.creditsError ? <p className="credits-help">{props.creditsError}</p> : <p className="credits-help">Il saldo si aggiorna dopo ogni generazione riuscita.</p>}
          </div>
        </div>

        <div className="workspace-grid">
          <div className="workspace-main">
            <div className="hero-card">
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.55,
                }}
                src="/video/testata_UGC.mp4"
              />
              <div className="hero-text">
                <span className="hero-kicker">From product photo to ad-ready output</span>
                <h2>Reference, style and prompt control in one flow.</h2>
                <p>Powered by BCS AI, Gemini and Veo with direct credit tracking.</p>
              </div>
            </div>

            <div className="workspace-form-stack">
              <section className="workspace-section">
                <div className="section-header">
                  <div className="section-number">1</div>
                  <h3 className="section-title">Reference Product</h3>
                </div>

                <div className="upload-card" onClick={() => fileInputRef.current?.click()}>
                  {props.productImages.length === 0 ? (
                    <>
                      <div className="upload-icon">Upload</div>
                      <div className="upload-text">Upload Product Photo</div>
                      <div className="upload-subtext">PNG, JPG up to 10MB. Max 3 images.</div>
                    </>
                  ) : (
                    <div className="image-preview-grid">
                      {props.productImages.map((img, idx) => (
                        <div key={idx} className="image-preview-item">
                          <img src={img} alt={`Product ${idx + 1}`} />
                          <div
                            className="remove-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.onRemoveImage(idx);
                            }}
                          >
                            X
                          </div>
                        </div>
                      ))}
                      {props.productImages.length < 3 && (
                        <div className="image-preview-item image-preview-placeholder">
                          <span>+</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={props.onUpload}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
              </section>

              <section className="workspace-section">
                <div className="section-header">
                  <div className="section-number">2</div>
                  <h3 className="section-title">Scene Settings</h3>
                </div>

                <div className="form-group">
                  <label className="label">Creativity Level (Chaos) - {props.chaosLevel}/100</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={props.chaosLevel}
                    onChange={(event) => props.setChaosLevel(Number.parseInt(event.target.value, 10))}
                    style={{ width: '100%', accentColor: '#8A2BE2' }}
                  />
                  <div className="range-help-row">
                    <span>Strict</span>
                    <span>Balanced</span>
                    <span>Wild</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Product Dimensions</label>
                  <div className="dimension-grid">
                    <input type="text" className="input-box" value={props.width} onChange={(event) => props.setWidth(event.target.value)} placeholder="W" />
                    <input type="text" className="input-box" value={props.height} onChange={(event) => props.setHeight(event.target.value)} placeholder="H" />
                    <select className="select-box" value={props.unit} onChange={(event) => props.setUnit(event.target.value)}>
                      <option value="cm">CM</option>
                      <option value="in">IN</option>
                      <option value="px">PX</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Target Language</label>
                  <div className="pills-group">
                    {props.allLanguages.map((lang) => (
                      <div
                        key={lang}
                        className={`pill ${props.language === lang ? 'active' : ''}`}
                        onClick={() => props.setLanguage(lang)}
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Target Audience</label>
                  <select className="select-full" value={props.targetAudience} onChange={(event) => props.setTargetAudience(event.target.value)}>
                    {props.audienceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Destination Platform</label>
                  <select className="select-full" value={props.platform} onChange={(event) => props.setPlatform(event.target.value)}>
                    {props.platformOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">UGC Video Style</label>
                  <select className="select-full" value={props.ugcStyle} onChange={(event) => props.setUgcStyle(event.target.value)}>
                    {props.ugcStyleOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Visual Art Style</label>
                  <div className="style-grid">
                    {props.imageStyleOptions.map((style) => (
                      <div
                        key={style}
                        className={`style-card ${props.imageStyle === style ? 'active' : ''}`}
                        onClick={() => props.setImageStyle(style)}
                      >
                        <img
                          src={STYLE_IMAGES[style] ?? 'https://placehold.co/400x300/e2e8f0/8A2BE2?text=Style'}
                          alt={style}
                        />
                        <div className="check-badge">OK</div>
                        <div className="style-overlay">{style}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={props.onAnalyze}
                  disabled={props.isAnalyzing || props.productImages.length === 0}
                >
                  {props.isAnalyzing ? 'Analyzing...' : 'Analyze and Create Prompt'}
                </button>
              </section>
            </div>
          </div>

          <aside className="workspace-secondary">
            {hasSecondaryContent ? (
              props.children
            ) : (
              <div className="workspace-intro-card">
                <div className="result-header">
                  <span className="result-title">Workflow Preview</span>
                </div>
                <p className="workspace-intro-copy">
                  The right column will host prompt review, generated visuals, video rendering and the credit-aware call to action flow.
                </p>
                <div className="workspace-summary-list">
                  <div className="workspace-summary-item">
                    <span className="workspace-summary-value">25</span>
                    <span className="workspace-summary-label">credits for each image</span>
                  </div>
                  <div className="workspace-summary-item">
                    <span className="workspace-summary-value">75</span>
                    <span className="workspace-summary-label">credits for each video</span>
                  </div>
                  <div className="workspace-summary-item">
                    <span className="workspace-summary-value">2 cols</span>
                    <span className="workspace-summary-label">desktop layout with denser spacing</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
