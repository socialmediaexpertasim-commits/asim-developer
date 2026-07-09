import React, { useState } from 'react';
import { Sliders, Download, Trash2, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { UploadedImage, CompressionSettings } from '../types';
import { formatBytes } from '../utils/compressor';

interface ImageItemRowProps {
  key?: string | number;
  image: UploadedImage;
  onUpdateSettings: (id: string, settings: CompressionSettings) => void;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
  onRecompress: (id: string) => any;
}

export default function ImageItemRow({
  image,
  onUpdateSettings,
  onRemove,
  onDownload,
  onRecompress,
}: ImageItemRowProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { id, name, originalSize, compressedSize, originalWidth, originalHeight, compressedWidth, compressedHeight, savingPercentage, status, error, settings, originalUrl, compressedUrl } = image;

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quality = parseFloat(e.target.value);
    onUpdateSettings(id, { ...settings, quality });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value as CompressionSettings['format'];
    onUpdateSettings(id, { ...settings, format });
  };

  const handleResizeModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resizeMode = e.target.value as CompressionSettings['resizeMode'];
    onUpdateSettings(id, { ...settings, resizeMode });
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resizePercentage = parseInt(e.target.value, 10);
    onUpdateSettings(id, { ...settings, resizePercentage });
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resizeWidth = parseInt(e.target.value, 10) || 0;
    onUpdateSettings(id, { ...settings, resizeWidth });
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resizeHeight = parseInt(e.target.value, 10) || 0;
    onUpdateSettings(id, { ...settings, resizeHeight });
  };

  const handleAspectRatioToggle = () => {
    onUpdateSettings(id, { ...settings, maintainAspectRatio: !settings.maintainAspectRatio });
  };

  return (
    <div
      className={`w-full bg-white rounded-2xl border transition-all overflow-hidden ${
        isExpanded ? 'border-emerald-300 ring-1 ring-emerald-50 shadow-md' : 'border-slate-100 shadow-sm hover:border-slate-200'
      }`}
      id={`uploaded-image-row-${id}`}
    >
      {/* Primary Row Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-3.5 gap-4">
        {/* Core Info & Thumbnail */}
        <div className="flex-1 flex items-center gap-3.5 min-w-0">
          <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
            {status === 'completed' && compressedUrl ? (
              <img
                src={compressedUrl}
                alt="Compressed thumbnail"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <img
                src={originalUrl}
                alt="Original thumbnail"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            {status === 'compressing' && (
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-800 text-sm truncate leading-snug" title={name}>
              {name}
            </h4>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-slate-500 font-mono text-[11px]">
              <span>{formatBytes(originalSize)}</span>
              {originalWidth > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{originalWidth}×{originalHeight}</span>
                </>
              )}
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-sans font-medium uppercase px-1.5 py-0.2 bg-slate-100 rounded">
                {settings.format === 'original' ? 'Original' : settings.format.split('/')[1]}
              </span>
            </div>
          </div>
        </div>

        {/* Compression State Output */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="text-right sm:block">
            {status === 'completed' && compressedSize !== null && (
              <div className="flex flex-col items-end">
                <span className="font-extrabold text-emerald-600 text-sm">
                  {formatBytes(compressedSize)}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md mt-0.5 border border-emerald-100 animate-pulse">
                  -{savingPercentage}%
                </span>
              </div>
            )}

            {status === 'compressing' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-500" />
                Optimizing...
              </span>
            )}

            {status === 'idle' && (
              <span className="text-xs text-slate-400 font-medium">Ready to compress</span>
            )}

            {status === 'failed' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                <AlertCircle className="w-3.5 h-3.5" />
                Error
              </span>
            )}
          </div>

          {/* Individual actions bar */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-xl transition-all border shrink-0 cursor-pointer ${
                isExpanded
                  ? 'bg-slate-50 border-slate-200 text-emerald-600'
                  : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-800'
              }`}
              title="Tune Image Options"
              id={`tune-options-btn-${id}`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            {status === 'completed' && compressedUrl && (
              <button
                onClick={() => onDownload(id)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl transition-all shrink-0 cursor-pointer"
                title="Download Compressed Image"
                id={`download-image-btn-${id}`}
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onRemove(id)}
              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-100 hover:border-rose-100 rounded-xl transition-all shrink-0 cursor-pointer"
              title="Remove Image"
              id={`remove-image-btn-${id}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Tuning Settings Area */}
      {isExpanded && (
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 shrink-0 transition-opacity duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Format & Aspect Controls */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Convert Output Format
                </label>
                <select
                  value={settings.format}
                  onChange={handleFormatChange}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  id={`select-format-${id}`}
                >
                  <option value="original">Original Format</option>
                  <option value="image/jpeg">JPEG (Universal)</option>
                  <option value="image/png">PNG (Lossless / High Size)</option>
                  <option value="image/webp">WebP (Modern / High Compression)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Resize Action
                </label>
                <select
                  value={settings.resizeMode}
                  onChange={handleResizeModeChange}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  id={`select-resize-${id}`}
                >
                  <option value="none">No Resizing</option>
                  <option value="percentage">Scale by Percentage</option>
                  <option value="dimensions">Custom Resolution</option>
                </select>
              </div>
            </div>

            {/* Quality Slider - Only applicable to jpeg/webp/original */}
            <div className="flex flex-col justify-center">
              {settings.format !== 'image/png' ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Compression Quality
                    </label>
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
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
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    id={`slider-quality-${id}`}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                    <span>Higher Compression</span>
                    <span>Best Quality</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-100 rounded-xl text-center">
                  <p className="text-xs text-slate-500 leading-normal">
                    <strong className="text-slate-600 font-bold block mb-0.5">Lossless PNG Selected</strong>
                    PNG uses lossless compression. Adjust quality via Resizing instead, or convert to WebP/JPEG for size reduction sliders.
                  </p>
                </div>
              )}
            </div>

            {/* Dimensional controls */}
            <div className="flex flex-col gap-2.5">
              {settings.resizeMode === 'percentage' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Resize Dimension Percentage
                    </label>
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {settings.resizePercentage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={settings.resizePercentage}
                    onChange={handlePercentageChange}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    id={`slider-percentage-${id}`}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                    <span>10% size</span>
                    <span>Original size</span>
                  </div>
                </div>
              )}

              {settings.resizeMode === 'dimensions' && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Dimensions (px)
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">W</span>
                        <input
                          type="number"
                          placeholder="Width"
                          value={settings.resizeWidth || ''}
                          onChange={handleWidthChange}
                          className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          id={`input-width-${id}`}
                        />
                      </div>
                    </div>
                    <span className="text-slate-400 text-xs">×</span>
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">H</span>
                        <input
                          type="number"
                          placeholder="Height"
                          value={settings.resizeHeight || ''}
                          onChange={handleHeightChange}
                          className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          id={`input-height-${id}`}
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-medium mt-1 select-none">
                    <input
                      type="checkbox"
                      checked={settings.maintainAspectRatio}
                      onChange={handleAspectRatioToggle}
                      className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      id={`checkbox-maintain-aspect-${id}`}
                    />
                    <span>Lock aspect ratio</span>
                  </label>
                </div>
              )}

              {settings.resizeMode === 'none' && (
                <div className="h-full flex items-center justify-center p-3 border border-dashed border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-semibold text-center italic">
                    Image proportions preserved at {originalWidth}x{originalHeight}px
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-4 pt-3 border-t border-slate-100 gap-2">
            <button
              onClick={() => onRecompress(id)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              id={`apply-recompress-btn-${id}`}
            >
              Apply & Recompress
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
