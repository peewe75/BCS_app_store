import React from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onApiKeyChange: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, onApiKeyChange }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">
                        <i className="fas fa-cog" style={{ color: '#94a3b8' }}></i>
                        Settings
                    </h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div style={{ marginBottom: 20 }}>
                        <label className="label" style={{ color: '#334155', fontSize: 13, display: 'block', marginBottom: 8 }}>
                            Gemini API Key
                        </label>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>
                            Enter your Google AI Studio API key to enable generation features.
                            The key is stored locally in your browser session.
                        </p>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => onApiKeyChange(e.target.value)}
                                placeholder="Paste your API key here..."
                                className="modal-input"
                                style={{ paddingRight: 40 }}
                            />
                            <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}>
                                <i className="fas fa-key"></i>
                            </div>
                        </div>
                        {apiKey && (
                            <p style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                                <i className="fas fa-check-circle"></i>
                                Key provided
                            </p>
                        )}
                    </div>

                    <div className="modal-info-box">
                        <h4 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>About App</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                            <span style={{ color: '#64748b' }}>Version</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>1.0.0 (Beta)</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="save-btn">
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
};
