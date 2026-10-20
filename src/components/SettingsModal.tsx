import React, { useState } from 'react';
import {
  Settings,
  Key,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
} from '../services/aiService';
import { useEventContext } from '../context/EventContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { exportActiveEventJson, importEventJson, resetToDefaults, activeEvent } =
    useEventContext();

  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [model, setModel] = useState<string>(getStoredModel());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAIConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKey);
    setStoredModel(model);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJson = () => {
    const jsonStr = exportActiveEventJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeEvent.details.title.replace(/\s+/g, '_')}_Backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importEventJson(content);
      if (success) {
        setImportStatus('Event successfully imported!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Error: Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-content" style={{ maxWidth: 580 }}>
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={20} className="text-muted" />
            <h3 id="settings-title" style={{ fontSize: '1.2rem' }}>
              Planner Settings & AI Configuration
            </h3>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* AI Settings Form */}
          <form onSubmit={handleSaveAIConfig}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Sparkles size={16} className="gradient-text" />
              <h4 style={{ fontSize: '1rem' }}>Google Gemini AI Provider</h4>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gemini-key">
                Gemini API Key (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="gemini-key"
                  type="password"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: 34 }}
                  placeholder="AIzaSy... (Leave empty to use intelligent built-in generator)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Key
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gemini-model">
                Gemini Model
              </label>
              <select
                id="gemini-model"
                className="form-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Recommended)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (Latest Model)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: 14,
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '8px 10px',
                borderRadius: 6,
              }}
            >
              <ShieldCheck size={16} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
              <span>
                Your key is stored strictly in your local browser storage and communicated directly to Google's API. When no key is entered, CelebrateAI automatically operates using the local intelligent fallback engine with zero downtime.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                {savedSuccess ? <Check size={15} /> : null}
                <span>{savedSuccess ? 'Saved!' : 'Save AI Settings'}</span>
              </button>
            </div>
          </form>

          {/* Backup & Data Management */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 18 }}>
            <h4 style={{ fontSize: '1rem', marginBottom: 12 }}>Data Management & Portability</h4>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={handleExportJson}>
                <Download size={15} />
                <span>Export Active Event JSON</span>
              </button>

              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={15} />
                <span>Import Event JSON</span>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImportFile}
                />
              </label>

              <button
                className="btn btn-danger"
                style={{ marginLeft: 'auto' }}
                onClick={() => {
                  if (window.confirm('Restore default starter events? All custom plans will be reset.')) {
                    resetToDefaults();
                    onClose();
                  }
                }}
              >
                <RotateCcw size={15} />
                <span>Reset to Defaults</span>
              </button>
            </div>

            {importStatus && (
              <p
                style={{
                  marginTop: 10,
                  fontSize: '0.85rem',
                  color: importStatus.includes('Error') ? 'var(--status-danger)' : 'var(--status-success)',
                }}
              >
                {importStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
