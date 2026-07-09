import React from 'react';
import { ArrowDownToLine, Zap, Layers, RefreshCw, Sparkles } from 'lucide-react';
import { CompressionStats as StatsType } from '../types';
import { formatBytes } from '../utils/compressor';

interface CompressionStatsPanelProps {
  stats: StatsType;
  onDownloadAll: () => void;
  onClearAll: () => void;
  isProcessing: boolean;
}

export default function CompressionStatsPanel({
  stats,
  onDownloadAll,
  onClearAll,
  isProcessing,
}: CompressionStatsPanelProps) {
  const { totalOriginalSize, totalCompressedSize, totalSavedSize, totalPercentageSaved, imagesCount } = stats;

  if (imagesCount === 0) return null;

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch p-5 md:p-6 gap-6 md:gap-8">
      {/* Circle / Radial Savings Graphic */}
      <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-2xl md:w-1/3 border border-slate-100 relative min-h-[160px]">
        <div className="absolute top-2.5 right-2.5">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
        </div>
        
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1.5 shadow-md shadow-emerald-100">
          <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-full">
            <span className="text-2xl font-black text-emerald-600 tracking-tight leading-none">
              -{totalPercentageSaved}%
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mt-0.5">
              Saved
            </span>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="font-extrabold text-slate-800 text-lg">
            {formatBytes(totalSavedSize)} saved
          </h4>
          <p className="text-slate-500 text-xs mt-0.5">across your images</p>
        </div>
      </div>

      {/* Aggregate Details and Action Bar */}
      <div className="flex-1 flex flex-col justify-between gap-6">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Images</span>
            </div>
            <span className="text-base md:text-lg font-bold text-slate-800">
              {imagesCount} {imagesCount === 1 ? 'file' : 'files'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Input Size</span>
            </div>
            <span className="text-base md:text-lg font-bold text-slate-800">
              {formatBytes(totalOriginalSize)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Output Size</span>
            </div>
            <span className="text-base md:text-lg font-bold text-emerald-600">
              {totalCompressedSize > 0 ? formatBytes(totalCompressedSize) : 'Pending'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClearAll}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 rounded-xl transition-all cursor-pointer text-center"
            id="stats-clear-all-btn"
          >
            Clear All Images
          </button>

          <button
            onClick={onDownloadAll}
            disabled={isProcessing || totalCompressedSize === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer disabled:pointer-events-none"
            id="stats-download-all-btn"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Download Zip / Bulk
          </button>
        </div>
      </div>
    </div>
  );
}
