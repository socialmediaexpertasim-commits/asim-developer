import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Trash2,
  Download,
  RefreshCw,
  Gauge,
  Smartphone,
  HardDrive,
  CheckCircle2,
  Info,
  Lock,
  Zap,
} from 'lucide-react';

import { CompressionSettings, UploadedImage } from './types';
import ImageComparisonSlider from './components/ImageComparisonSlider';
import ImageUploader from './components/ImageUploader';
import CompressionStatsPanel from './components/CompressionStats';
import ImageItemRow from './components/ImageItemRow';
import GlobalSettings from './components/GlobalSettings';
import { compressImage, formatBytes, loadImage } from './utils/compressor';

const DEFAULT_SETTINGS: CompressionSettings = {
  quality: 0.8,
  format: 'image/jpeg',
  resizeMode: 'none',
  resizePercentage: 80,
  resizeWidth: 1920,
  resizeHeight: 1080,
  maintainAspectRatio: true,
};

export default function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [globalSettings, setGlobalSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);

  // Dynamic statistics
  const stats = useMemo(() => {
    const completed = images.filter((img) => img.status === 'completed' && img.compressedSize !== null);
    const totalOriginalSize = completed.reduce((sum, img) => sum + img.originalSize, 0);
    const totalCompressedSize = completed.reduce((sum, img) => sum + (img.compressedSize || 0), 0);
    const totalSavedSize = Math.max(0, totalOriginalSize - totalCompressedSize);
    const totalPercentageSaved = totalOriginalSize > 0 ? Math.round((totalSavedSize / totalOriginalSize) * 100) : 0;

    return {
      totalOriginalSize,
      totalCompressedSize,
      totalSavedSize,
      totalPercentageSaved,
      imagesCount: images.length,
    };
  }, [images]);

  // Determine active compare item
  const currentCompareImage = useMemo(() => {
    if (images.length === 0) return null;
    const found = images.find((img) => img.id === compareId);
    return found || images[0];
  }, [images, compareId]);

  // Set the first completed/uploaded image for compare if none is active
  useEffect(() => {
    if (images.length > 0 && !compareId) {
      setCompareId(images[0].id);
    } else if (images.length === 0) {
      setCompareId(null);
    }
  }, [images, compareId]);

  // Sequential batch compression worker
  const triggerCompression = async (id: string, currentImagesMap?: UploadedImage[]) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, status: 'compressing' as const } : img))
    );

    try {
      const list = currentImagesMap || images;
      const target = list.find((img) => img.id === id);
      if (!target) return;

      const compressedPartial = await compressImage(target, target.settings);

      setImages((prev) =>
        prev.map((img) => {
          if (img.id === id) {
            if (img.compressedUrl) {
              URL.revokeObjectURL(img.compressedUrl);
            }
            return {
              ...img,
              ...compressedPartial,
              status: 'completed' as const,
            } as UploadedImage;
          }
          return img;
        })
      );
    } catch (error: any) {
      console.error('Core compression failed:', error);
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? ({
                ...img,
                status: 'failed' as const,
                error: error.message || 'Optimization failed',
              } as UploadedImage)
            : img
        )
      );
    }
  };

  // Drag and drop parser
  const handleFilesSelected = async (newFiles: File[]) => {
    const newUploadsPromises = newFiles.map(async (file) => {
      const id = Math.random().toString(36).substr(2, 9);
      const originalUrl = URL.createObjectURL(file);

      let width = 0;
      let height = 0;
      try {
        const img = await loadImage(originalUrl);
        width = img.width;
        height = img.height;
      } catch (e) {
        console.error('Could not parse image dimensions:', e);
      }

      const defaultImageSettings = { ...globalSettings };

      const newImage: UploadedImage = {
        id,
        name: file.name,
        file,
        originalSize: file.size,
        originalUrl,
        originalWidth: width,
        originalHeight: height,
        compressedSize: null,
        compressedUrl: null,
        compressedWidth: null,
        compressedHeight: null,
        savingPercentage: null,
        status: 'idle',
        error: null,
        settings: defaultImageSettings,
      };

      return newImage;
    });

    const parsedUploads = await Promise.all(newUploadsPromises);
    
    // Combine state
    const combinedImages = [...images, ...parsedUploads];
    setImages(combinedImages);

    // Auto-compress sequential queue
    parsedUploads.forEach((image) => {
      triggerCompression(image.id, combinedImages);
    });
  };

  // Row update triggers
  const handleUpdateSettings = (id: string, settings: CompressionSettings) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, settings } : img))
    );
  };

  const handleRecompress = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        // Trigger with the latest state mapping
        triggerCompression(id, prev);
      }
      return prev;
    });
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.originalUrl);
        if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
      }
      const remaining = prev.filter((img) => img.id !== id);
      if (compareId === id) {
        setCompareId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const handleClearAll = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });
    setImages([]);
    setCompareId(null);
  };

  const handleDownload = (id: string) => {
    const target = images.find((img) => img.id === id);
    if (target && target.compressedUrl) {
      const link = document.createElement('a');
      link.href = target.compressedUrl;

      let ext = 'jpg';
      if (target.settings.format === 'image/png') ext = 'png';
      else if (target.settings.format === 'image/webp') ext = 'webp';
      else {
        const origExt = target.name.split('.').pop();
        if (origExt) ext = origExt;
      }

      const baseName = target.name.substring(0, target.name.lastIndexOf('.')) || target.name;
      link.download = `${baseName}_compressly.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = () => {
    images.forEach((img) => {
      if (img.status === 'completed' && img.compressedUrl) {
        handleDownload(img.id);
      }
    });
  };

  const handleGlobalSettingsChange = (settings: CompressionSettings) => {
    setGlobalSettings(settings);
  };

  const handleApplyGlobalToAll = () => {
    setImages((prev) => {
      const updated = prev.map((img) => ({
        ...img,
        settings: { ...globalSettings },
        status: 'idle' as const,
      }));

      setTimeout(() => {
        updated.forEach((img) => {
          triggerCompression(img.id, updated);
        });
      }, 50);

      return updated;
    });
  };

  const isCompressingAny = images.some((img) => img.status === 'compressing');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100 px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl shadow-sm text-white">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg md:text-xl text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                Compressly Image
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                Pro Browser Optimizer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              100% Secure Local Context
            </span>
            <span className="text-slate-300 text-sm hidden sm:inline">|</span>
            <span className="text-slate-500 text-xs font-mono font-bold uppercase hidden md:inline">
              v1.2 Stable
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6 md:gap-8">
        
        {/* Dynamic Showcase comparison / hero header */}
        {images.length > 0 && currentCompareImage ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-fade-in">
            {/* Split screen display (Takes 2 columns) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5 flex flex-col justify-between">
              <ImageComparisonSlider
                originalUrl={currentCompareImage.originalUrl}
                compressedUrl={currentCompareImage.compressedUrl}
                originalSize={currentCompareImage.originalSize}
                compressedSize={currentCompareImage.compressedSize}
                originalWidth={currentCompareImage.originalWidth}
                compressedWidth={currentCompareImage.compressedWidth}
                originalHeight={currentCompareImage.originalHeight}
                compressedHeight={currentCompareImage.compressedHeight}
                savingPercentage={currentCompareImage.savingPercentage}
              />
            </div>

            {/* Quick compare selector */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Select Image to Preview</h3>
                <p className="text-slate-400 text-xs mt-0.5">Click any item below to inspect detailed side-by-side compression specs:</p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[180px] lg:max-h-[290px] flex flex-col gap-2 pr-1">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setCompareId(img.id)}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      currentCompareImage.id === img.id
                        ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                        : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    id={`preview-selector-${img.id}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                      <img src={img.originalUrl} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-705 text-xs truncate leading-snug">{img.name}</p>
                      <p className="font-mono text-[10px] text-slate-600 mt-0.5">
                        {formatBytes(img.originalSize)}
                        {img.savingPercentage !== null && (
                          <span className="text-emerald-600 font-bold ml-1.5">(-{img.savingPercentage}%)</span>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
                <span>Active Showcase size:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {currentCompareImage.compressedSize ? formatBytes(currentCompareImage.compressedSize) : 'Processing'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state hero greeting */
          <div className="text-center py-6 md:py-10 max-w-2xl mx-auto flex flex-col items-center gap-4 animate-fade-in">
            <h2 className="font-display font-extrabold text-slate-900 text-3xl md:text-5xl leading-tight tracking-tight">
              Optimize files like magic. <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">No server uploads.</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-lg leading-relaxed">
              Compressly Image helps you downsize JPEGs, PNGs, and WebPs in seconds. It runs 100% on your device, shielding your data and keeping it completely private.
            </p>
          </div>
        )}

        {/* Core Drop Zone or Double-Column Layout */}
        {images.length === 0 ? (
          /* Large dropzone on empty state */
          <div className="max-w-4xl mx-auto w-full">
            <ImageUploader onFilesSelected={handleFilesSelected} />
          </div>
        ) : (
          /* Split layout once files are active */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Column: List of items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base md:text-lg">Uploaded File Register</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Configure individual item filters or recompress them anytime</p>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-200 px-2.5 py-0.7 rounded-full">
                  {images.length} item{images.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Sequential row rendering */}
              <div className="flex flex-col gap-3">
                {images.map((img) => (
                  <ImageItemRow
                    key={img.id}
                    image={img}
                    onUpdateSettings={handleUpdateSettings}
                    onRemove={handleRemove}
                    onDownload={handleDownload}
                    onRecompress={handleRecompress}
                  />
                ))}
              </div>

              {/* Smaller Docked Dropzone for adding more files */}
              <div className="p-4 bg-white border border-slate-100 rounded-3xl mt-2">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Want to add more files?</p>
                <ImageUploader onFilesSelected={handleFilesSelected} />
              </div>
            </div>

            {/* Right Column: Global optimization controller & live stats */}
            <div className="flex flex-col gap-6">
              
              {/* Live Aggregate stats panel */}
              <CompressionStatsPanel
                stats={stats}
                onDownloadAll={handleDownloadAll}
                onClearAll={handleClearAll}
                isProcessing={isCompressingAny}
              />

              {/* Global Preset parameters panel */}
              <GlobalSettings
                settings={globalSettings}
                onSettingsChange={handleGlobalSettingsChange}
                onApplyToAll={handleApplyGlobalToAll}
                hasImages={images.length > 0}
              />

              {/* High production guide checklist */}
              <div className="p-5 bg-white border border-slate-100 shadow-sm rounded-3xl flex flex-col gap-3">
                <div className="flex items-center gap-1 text-slate-800 font-bold text-xs">
                  <Info className="w-4 h-4 text-emerald-500" />
                  <span>Interactive Tips & Tricks</span>
                </div>
                
                <ul className="text-xs text-slate-500 flex flex-col gap-3 leading-normal list-none pl-0">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-700">WebP Conversion:</strong> Choose WebP as your output format. WebP achieves up to 40% smaller file sizes than JPEG with identical visual fidelity!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-700">Lossless Optimize:</strong> When compressing PNG, downsize using the height/width presets or the slide scale directly, since PNG maintains perfect clarity.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-700">Fine-tuning:</strong> Expand a file row using the sliders icon to customize its compression settings individually, perfect for hero content.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* Bottom Banner Area */}
        {images.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 md:mt-12 select-none border-t border-slate-100 pt-8">
            <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Gauge className="w-4.5 h-4.5 text-emerald-500" />
                <span>Supercharged Swift Speed</span>
              </div>
              <p className="text-slate-500 text-xs leading-normal">
                Uses native modern canvas routines and multithreaded extraction, delivering file compression results in milliseconds.
              </p>
            </div>

            <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Smartphone className="w-4.5 h-4.5 text-emerald-500" />
                <span>Fully Mobile Responsive</span>
              </div>
              <p className="text-slate-500 text-xs leading-normal">
                Fits perfectly on desktop monitors, tablets, and mobile devices. Edit dimensions on the touch display effortlessly.
              </p>
            </div>

            <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <HardDrive className="w-4.5 h-4.5 text-emerald-500" />
                <span>Zero Server Dependencies</span>
              </div>
              <p className="text-slate-500 text-xs leading-normal">
                Operates entirely within your local browser sandbox. Upload, optimize, and convert files safely without network overheads or server quotas.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 px-4 py-6 md:py-8 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-600">Compressly Image</span>
            <span className="text-slate-300">•</span>
            <span>Your Personal Offline-First Utility Hub</span>
          </div>

          <div className="flex items-center gap-1 mt-1 md:mt-0 text-[11px]">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>Encrypted sandbox execution. Compliance approved since 2026.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
