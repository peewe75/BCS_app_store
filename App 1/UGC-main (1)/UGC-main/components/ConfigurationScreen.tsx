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
}

const STYLE_IMAGES: Record<string, string> = {
  "Realistic Lifestyle": "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=400",
  "Studio Minimalist": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400",
  "Cinematic 4K": "https://images.unsplash.com/photo-1550745679-33d016c8227e?auto=format&fit=crop&q=80&w=400",
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
      <header>
        <h1>UGC Ad Studio Configuration</h1>
        <p className="subtitle">Transform product photos into viral video ads with Gemini & Veo.</p>
      </header>

      <div className="hero-card">
        <div className="play-button">
          <i className="fas fa-play"></i>
        </div>
        <div className="hero-text">
          <h2>AI Video Engine Ready</h2>
          <p>Powered by Gemini & Veo</p>
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
                    <div className="image-preview-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee'}}>
                        <i className="fas fa-plus" style={{color: '#ccc'}}></i>
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
        style={{display: 'none'}} 
      />

      <button className="btn-primary" onClick={props.onAnalyze} disabled={props.isAnalyzing || props.productImages.length === 0}>
        <i className="fas fa-magic"></i> {props.isAnalyzing ? 'Analyzing...' : 'Analyze & Create Prompt'}
      </button>

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
            {props.allLanguages.slice(0, 4).map(lang => (
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
            {props.imageStyleOptions.slice(0, 4).map(style => (
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
    
      <nav className="bottom-nav">
        <a href="#" className="nav-item active">
            <i className="fas fa-clapperboard"></i>
            Studio
        </a>
        <a href="#" className="nav-item">
            <i className="fas fa-history"></i>
            History
        </a>
        <a href="#" className="nav-item">
            <i className="fas fa-cog"></i>
            Settings
        </a>
      </nav>

    </div>
  );
};
