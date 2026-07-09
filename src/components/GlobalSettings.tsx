import React from 'react';
import { Sliders, Sparkles, Check, Zap, Flame, Shield, HelpCircle } from 'lucide-react';
import { CompressionSettings } from '../types';

interface GlobalSettingsProps {
  settings: CompressionSettings;
  onSettingsChange: (settings: CompressionSettings) => void;
  onApplyToAll: () => void;
  hasImages: boolean;
}

export type PresetKey = 'super' | 'balanced' | 'fidelity' | 'png-optimize';

export default function GlobalSettings({
  settings,
  onSettingsChange,
  onApplyToAll,
  hasImages,
}: GlobalSettingsProps) {
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quality = parseFloat(e.target.value);
    onSettingsChange({ ...settings, quality });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value as CompressionSettings['format'];
    onSettingsChange({ ...settings, format });
  };

  const handleResizeModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resizeMode = e.target.value as CompressionSettings['resizeMode'];
    onSettingsChange({ ...settings, resizeMode });
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resizePercentage = parseInt(e.target.value, 10);
    onSettingsChange({ ...settings, resizePercentage });
  };

  const selectPreset = (presetKey: PresetKey) => {
    switch (presetKey) {
      case 'super':
        onSettingsChange({
          quality: 0.6,
          format: 'image/webp',
          resizeMode: 'percentage',
          resizePercentage: 60,
          resizeWidth: 1200,
          resizeHeight: 0,
          maintainAspectRatio: true,
        });
        break;
      case 'balanced':
        onSettingsChange({
          quality: 0.8,
          format: 'image/jpeg',
          resizeMode: 'none',
          resizePercentage: 80,
          resizeWidth: 1920,
          resizeHeight: 0,
          maintainAspectRatio: true,
        });
        break;
      case 'fidelity':
        onSettingsChange({
          quality: 0.92,
          format: 'original',
          resizeMode: 'none',
          resizePercentage: 100,
          resizeWidth: 0,
          resizeHeight: 0,
          maintainAspectRatio: true,
        });
        break;
      case 'png-optimize':
        onSettingsChange({
          quality: 0.8,
          format: 'image/png',
          resizeMode: 'percentage',
          resizePercentage: 85,
          resizeWidth: 0,
          resizeHeight: 0,
          maintainAspectRatio: true,
        });
        break;
    }
  };

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-5 md:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base md:text-lg tracking-tight">Global Optimizations</h3>
        </div>
        <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
          Default Options
        </span>
      </div>

      {/* Preset Buttons */}
      <div>
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Select Compression Style Presets
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => selectPreset('balanced')}
            className={`px-3 py-2 text-left rounded-xl transition-all cursor-pointer flex flex-col justify-between h-14 ${
              settings.format === 'image/jpeg' && settings.quality === 0.8 && settings.resizeMode === 'none'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            id="preset-balanced-btn"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">Standard Balanced</span>
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] opacity-80">JPEG • 80% • Normal Size</span>
          </button>

          <button
            onClick={() => selectPreset('super')}
            className={`px-3 py-2 text-left rounded-xl transition-all cursor-pointer flex flex-col justify-between h-14 ${
              settings.format === 'image/webp' && settings.quality === 0.6 && settings.resizeMode === 'percentage'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/25'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            id="preset-super-btn"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold font-sans">Super Compressed</span>
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] opacity-80">WebP • 60% • 60% Scale</span>
          </button>

          <button
            onClick={() => selectPreset('fidelity')}
            className={`px-3 py-2 text-left rounded-xl transition-all cursor-pointer flex flex-col justify-between h-14 ${
              settings.format === 'original' && settings.quality === 0.92
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            id="preset-fidelity-btn"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">High Fidelity</span>
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] opacity-80">Original • 92% • No Scaling</span>
          </button>

          <button
            onClick={() => selectPreset('png-optimize')}
            className={`px-3 py-2 text-left rounded-xl transition-all cursor-pointer flex flex-col justify-between h-14 ${
              settings.format === 'image/png' && settings.resizeMode === 'percentage'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            id="preset-png-btn"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold">Lossless Optimize</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] opacity-80">PNG • Lossless • 85% Scale</span>
          </button>
        </div>
      </div>

      {/* Manual Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {/* Output format */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Output Format
          </label>
          <select
            value={settings.format}
            onChange={handleFormatChange}
            className="w-full text-xs font-bold bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            id="global-format-select"
          >
            <option value="original">Preserve Original File Type</option>
            <option value="image/jpeg">Convert to JPEG (Universal)</option>
            <option value="image/png">Convert to PNG (Lossless)</option>
            <option value="image/webp">Convert to WebP (Modern high-comp)</option>
          </select>
        </div>

        {/* Quality level */}
        <div className="flex flex-col gap-1">
          {settings.format !== 'image/png' ? (
            <>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quality Value
                </label>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {Math.round(settings.quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.quality}
                onChange={handleQualityChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                id="global-quality-slider"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-medium mt-1">
                <span>Small size</span>
                <span>Best clarity</span>
              </div>
            </>
          ) : (
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-800 text-center h-[65px] flex items-center justify-center">
              <span className="text-[10px] text-slate-400 font-medium leading-normal italic">
                No quality range slider needed for lossless PNG outputs
              </span>
            </div>
          )}
        </div>

        {/* Rescale */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Sizing Factor
          </label>
          <select
            value={settings.resizeMode}
            onChange={handleResizeModeChange}
            className="w-full text-xs font-bold bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer mb-2"
            id="global-resize-mode-select"
          >
            <option value="none">Preserve Original Dimensions</option>
            <option value="percentage">Scale by Percentage</option>
          </select>

          {settings.resizeMode === 'percentage' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Scale:</span>
                <span className="font-mono text-xs font-bold text-emerald-400">{settings.resizePercentage}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.resizePercentage}
                onChange={handlePercentageChange}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                id="global-resize-slider"
              />
            </div>
          )}
        </div>
      </div>

      {/* Synchronize across all items action */}
      {hasImages && (
        <div className="flex items-center justify-end border-t border-slate-800 pt-3 mt-1.5 gap-3">
          <p className="text-[11px] text-slate-400 font-medium italic hidden sm:block">
            You can synchronize these current rules across all uploaded images with a click:
          </p>
          <button
            onClick={onApplyToAll}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/10 transition-all cursor-pointer font-sans"
            id="global-apply-all-btn"
          >
            Force Settings to All Uploads
          </button>
        </div>
      )}
    </div>
  );
}
