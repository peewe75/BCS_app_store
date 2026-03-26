import React, { useRef } from 'react';

interface ConfigurationScreenProps {
  productImages: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;

  // Settings
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

  // Navigation
  onSettingsClick: () => void;

  children?: React.ReactNode;
}

const STYLE_IMAGES: Record<string, string> = {
  "Realistic Lifestyle": "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=400",
  "Studio Minimalist": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400",
  "Cinematic 4K": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400",
  "Luxury Editorial": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400",
  "Vintage Film": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=400",
  "Cyberpunk Neon": "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&q=80&w=400",
  "Warm & Cozy": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=400",
  "Vibrant Pop Art": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400"
};

export const ConfigurationScreen: React.FC<ConfigurationScreenProps> = (props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container">
      <div className="hero-card">
        <video src="/testata.mp4" autoPlay loop muted playsInline className="hero-video" />

        <div className="hero-text">
          <h2>AI Ready</h2>
          <p>Powered by BCS AI</p>
        </div>
      </div>

      {/* Section 1 */}
      <div className="section-header">
        <div className="section-number">1</div>
        <h3 className="section-title">Reference Product</h3>
      </div>

      <div className="upload-card" onClick={handleUploadClick}>
        {props.productImages.length === 0 ? (
          <>
            <div className="upload-icon"><i className="fas fa-camera"></i></div>
            <div className="upload-text">Upload Product Photo</div>
            <div className="upload-subtext">PNG, JPG up to 10MB</div>
          </>
        ) : (
          <div className="image-preview-grid">
            {props.productImages.map((img, idx) => (
              <div key={idx} className="image-preview-item">
                <img src={img} alt={`Product ${idx}`} />
                <div className="remove-btn" onClick={(e) => { e.stopPropagation(); props.onRemoveImage(idx); }}>
                  <i className="fas fa-times"></i>
                </div>
              </div>
            ))}
            {props.productImages.length < 3 && (
              <div className="image-preview-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee' }}>
                <i className="fas fa-plus" style={{ color: '#ccc' }}></i>
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
          <div className={`toggle-item ${!props.useProModel ? 'active' : ''}`} onClick={() => props.setUseProModel(false)}>Speed</div>
          <div className={`toggle-item ${props.useProModel ? 'active' : ''}`} onClick={() => props.setUseProModel(true)}>Quality</div>
        </div>
      </div>

      <div className="form-group">
        <label className="label">Creativity Level (Chaos)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="range"
            min="0"
            max="100"
            value={props.chaosLevel}
            onChange={(e) => props.setChaosLevel(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#8A2BE2' }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', minWidth: 24, textAlign: 'right' }}>{props.chaosLevel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 5 }}>
          <span>Strict</span>
          <span>Balanced</span>
          <span>Wild</span>
        </div>
      </div>

      <div className="form-group">
        <label className="label">Product Dimensions</label>
        <div className="dimension-grid">
          <input type="text" className="input-box" value={props.width} onChange={(e) => props.setWidth(e.target.value)} placeholder="W"
            autoComplete="off"
            name="width_dimension"
          />
          <input
            type="text"
            className="input-box"
            value={props.height}
            onChange={(e) => props.setHeight(e.target.value)}
            placeholder="H"
            autoComplete="off"
            name="height_dimension"
          /><select className="select-box" value={props.unit} onChange={(e) => props.setUnit(e.target.value)}>
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
              <img src={STYLE_IMAGES[style] || "https://placehold.co/400x300/e2e8f0/8A2BE2?text=Style"} alt={style} />
              <div className="check-badge"><i className="fas fa-check"></i></div>
              <div className="style-overlay">{style}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={props.onAnalyze} disabled={props.isAnalyzing || props.productImages.length === 0} style={{ marginTop: 20, marginBottom: 40 }}>
        <i className="fas fa-magic"></i> {props.isAnalyzing ? 'Analyzing...' : 'Analyze & Create Prompt'}
      </button>

      {/* Results Section */}
      {props.children}

      <div style={{ height: 80 }} /> {/* Spacer for bottom nav */}

      <nav className="bottom-nav">
        <a href="#" className="nav-item active" onClick={(e) => { e.preventDefault(); props.onSettingsClick(); }}>
          <i className="fas fa-network-wired"></i>
          API
        </a>
        <a href="#" className="nav-item" onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
          <i className="fas fa-arrow-up"></i>
          Top
        </a>
      </nav>

    </div>
  );
};
