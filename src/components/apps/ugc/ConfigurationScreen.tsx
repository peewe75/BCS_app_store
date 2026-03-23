'use client';

import { useRef } from 'react';
import { STYLE_IMAGES } from '@/src/apps/ugc/constants';

interface ConfigurationScreenProps {
  productImages: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  useProModel: boolean;
  setUseProModel: (val: boolean) => void;
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
  children?: React.ReactNode;
}

export function ConfigurationScreen(props: ConfigurationScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="ugc-workspace">
      <div className="container">
        <div className="hero-card">
          <div className="hero-text">
            <h2>UGC Ad Creator</h2>
            <p>Powered by BCS AI · Gemini + Veo</p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="section-header">
          <div className="section-number">1</div>
          <h3 className="section-title">Reference Product</h3>
        </div>

        <div className="upload-card" onClick={() => fileInputRef.current?.click()}>
          {props.productImages.length === 0 ? (
            <>
              <div className="upload-icon">📷</div>
              <div className="upload-text">Upload Product Photo</div>
              <div className="upload-subtext">PNG, JPG up to 10MB · Max 3 images</div>
            </>
          ) : (
            <div className="image-preview-grid">
              {props.productImages.map((img, idx) => (
                <div key={idx} className="image-preview-item">
                  <img src={img} alt={`Product ${idx}`} />
                  <div
                    className="remove-btn"
                    onClick={(e) => { e.stopPropagation(); props.onRemoveImage(idx); }}
                  >
                    ✕
                  </div>
                </div>
              ))}
              {props.productImages.length < 3 && (
                <div className="image-preview-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee' }}>
                  <span style={{ color: '#ccc', fontSize: 24 }}>+</span>
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

        {/* Section 2 */}
        <div className="section-header">
          <div className="section-number">2</div>
          <h3 className="section-title">Scene Settings</h3>
        </div>

        <div className="form-group">
          <label className="label">Model Performance</label>
          <div className="toggle-group">
            <div className={`toggle-item ${!props.useProModel ? 'active' : ''}`} onClick={() => props.setUseProModel(false)}>⚡ Speed</div>
            <div className={`toggle-item ${props.useProModel ? 'active' : ''}`} onClick={() => props.setUseProModel(true)}>✨ Quality</div>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Creativity Level (Chaos) — {props.chaosLevel}/100</label>
          <input
            type="range"
            min="0"
            max="100"
            value={props.chaosLevel}
            onChange={(e) => props.setChaosLevel(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#8A2BE2' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 5 }}>
            <span>Strict</span>
            <span>Balanced</span>
            <span>Wild</span>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Product Dimensions</label>
          <div className="dimension-grid">
            <input type="text" className="input-box" value={props.width} onChange={(e) => props.setWidth(e.target.value)} placeholder="W" />
            <input type="text" className="input-box" value={props.height} onChange={(e) => props.setHeight(e.target.value)} placeholder="H" />
            <select className="select-box" value={props.unit} onChange={(e) => props.setUnit(e.target.value)}>
              <option value="cm">CM</option>
              <option value="in">IN</option>
              <option value="px">PX</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Target Language</label>
          <div className="pills-group">
            {props.allLanguages.map(lang => (
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
          <select className="select-full" value={props.targetAudience} onChange={(e) => props.setTargetAudience(e.target.value)}>
            {props.audienceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Destination Platform</label>
          <select className="select-full" value={props.platform} onChange={(e) => props.setPlatform(e.target.value)}>
            {props.platformOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="label">UGC Video Style</label>
          <select className="select-full" value={props.ugcStyle} onChange={(e) => props.setUgcStyle(e.target.value)}>
            {props.ugcStyleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Visual Art Style</label>
          <div className="style-grid">
            {props.imageStyleOptions.map(style => (
              <div
                key={style}
                className={`style-card ${props.imageStyle === style ? 'active' : ''}`}
                onClick={() => props.setImageStyle(style)}
              >
                <img
                  src={STYLE_IMAGES[style] ?? 'https://placehold.co/400x300/e2e8f0/8A2BE2?text=Style'}
                  alt={style}
                />
                <div className="check-badge">✓</div>
                <div className="style-overlay">{style}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={props.onAnalyze}
          disabled={props.isAnalyzing || props.productImages.length === 0}
          style={{ marginTop: 20, marginBottom: 40 }}
        >
          {props.isAnalyzing ? '⏳ Analyzing...' : '🪄 Analyze & Create Prompt'}
        </button>

        {props.children}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
