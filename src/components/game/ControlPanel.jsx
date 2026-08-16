import { useState, useEffect } from 'react';
import { X, RefreshCw, Shuffle, Layers } from 'lucide-react';

const STORAGE_KEY = 'rfth_control_settings';

// Defaults: both ON — matches the game's behavior since launch
const DEFAULT_SETTINGS = {
  suitVariation: true,
  positionRotation: true,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      suitVariation: typeof parsed.suitVariation === 'boolean' ? parsed.suitVariation : true,
      positionRotation: typeof parsed.positionRotation === 'boolean' ? parsed.positionRotation : true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable — settings apply for this session only
  }
}

// Exported so RapidFireGame can read the current toggles without re-reading localStorage each round
export function getControlSettings() {
  return loadSettings();
}

export function setControlSettings(settings) {
  saveSettings(settings);
}

export default function ControlPanel({ isOpen, onClose }) {
  const [settings, setSettings] = useState(loadSettings);

  // Sync from localStorage when panel opens (in case it changed elsewhere)
  useEffect(() => {
    if (isOpen) setSettings(loadSettings());
  }, [isOpen]);

  if (!isOpen) return null;

  function toggle(key) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveSettings(next);
  }

  function resetDefaults() {
    const defaults = { ...DEFAULT_SETTINGS };
    setSettings(defaults);
    saveSettings(defaults);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-[420px] max-w-[90vw] rounded-2xl border-2 border-[#e8b84b] bg-slate-900 shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8b84b]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8b84b]/15 border border-[#e8b84b]/40 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-[#e8b84b]" />
            </div>
            <h2 className="text-lg font-bold text-[#e8b84b] tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
              Control
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-600 hover:border-[#e8b84b]/60 hover:bg-slate-700 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4 text-slate-400 hover:text-[#e8b84b]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Suit Variation Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#e8b84b]/10 border border-[#e8b84b]/30 flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-[#e8b84b]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Suit Variation</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Alternates between Original deck (Black Kings) and Deck 2 (Red Kings) each hand
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Off = locked to Original deck
                </p>
              </div>
            </div>
            <ToggleSwitch
              isOn={settings.suitVariation}
              onToggle={() => toggle('suitVariation')}
              label="Suit Variation"
            />
          </div>

          {/* Position Rotation Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#e8b84b]/10 border border-[#e8b84b]/30 flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#e8b84b]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Position Rotation</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Randomly shuffles hand positions on the board each hand (RNG)
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Off = hands return to original positions
                </p>
              </div>
            </div>
            <ToggleSwitch
              isOn={settings.positionRotation}
              onToggle={() => toggle('positionRotation')}
              label="Position Rotation"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#e8b84b]/30">
          <button
            onClick={resetDefaults}
            className="text-xs text-slate-400 hover:text-[#e8b84b] transition-colors font-medium"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#e8b84b] text-black text-sm font-bold hover:bg-[#d4a73e] transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ isOn, onToggle, label }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
        isOn ? 'bg-[#e8b84b]' : 'bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
