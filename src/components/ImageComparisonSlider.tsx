import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Eye } from 'lucide-react';
import { formatBytes } from '../utils/compressor';

interface ImageComparisonSliderProps {
  originalUrl: string;
  compressedUrl: string | null;
  originalSize: number;
  compressedSize: number | null;
  originalWidth: number;
  compressedWidth: number | null;
  originalHeight: number;
  compressedHeight: number | null;
  savingPercentage: number | null;
}

export default function ImageComparisonSlider({
  originalUrl,
  compressedUrl,
  originalSize,
  compressedSize,
  originalWidth,
  compressedWidth,
  originalHeight,
  compressedHeight,
  savingPercentage,
}: ImageComparisonSliderProps) {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage (0-100)
  const [containerWidth, setContainerWidth] = useState<number>(500);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let animationFrameId: number;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      animationFrameId = requestAnimationFrame(() => {
        updateWidth();
      });
    });
    
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return;
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const stopDragging = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopDragging);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', stopDragging);
  };

  const startDragging = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    isDragging.current = true;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', stopDragging);
  };

  useEffect(() => {
    return () => {
      // Clean up event listeners on unmount
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', stopDragging);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-800 text-sm md:text-base">Real-time Split Review</h3>
        </div>
        {savingPercentage !== null && savingPercentage > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Saved {savingPercentage}%
          </span>
        )}
      </div>

      <div
        id="split-compress-compare-container"
        ref={containerRef}
        className="relative h-[250px] md:h-[400px] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 select-none cursor-ew-resize group"
        onMouseDown={startDragging}
        onTouchStart={startDragging}
      >
        {/* Underlay / Left Image: Original */}
        <img
          src={originalUrl}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain p-2"
          referrerPolicy="no-referrer"
          id="split-compare-original-img"
        />
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md rounded-lg text-slate-100 text-xs shadow-md border border-slate-700 font-medium">
          Original <span className="font-mono text-slate-300 ml-1">({formatBytes(originalSize)}{originalWidth ? ` • ${originalWidth}x${originalHeight}` : ''})</span>
        </div>

        {/* Overlay / Right Image: Compressed */}
        <div
          className="absolute inset-y-0 right-0 overflow-hidden bg-slate-900/20 backdrop-blur-[1px]"
          style={{ left: `${sliderPos}%` }}
        >
          {compressedUrl ? (
            <img
              src={compressedUrl}
              alt="Compressed"
              referrerPolicy="no-referrer"
              id="split-compare-compressed-img"
              className="absolute inset-0 w-full h-full object-contain p-2 max-w-none"
              style={{
                width: containerWidth,
                right: 0,
                left: `-${sliderPos}%`,
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Compressing...
            </div>
          )}
        </div>
        
        {compressedUrl && (
          <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-emerald-950/90 backdrop-blur-md rounded-lg text-emerald-100 text-xs shadow-md border border-emerald-800 font-medium">
            Compressed <span className="font-mono text-emerald-300 ml-1">({compressedSize ? formatBytes(compressedSize) : ''}{compressedWidth ? ` • ${compressedWidth}x${compressedHeight}` : ''})</span>
          </div>
        )}

        {/* Divider Bar */}
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-30 flex items-center justify-center cursor-ew-resize"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-lg border border-slate-200 group-hover:scale-110 transition-transform">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 9l-4 4 4 4m8 0l4-4-4-4"
              />
            </svg>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 font-medium">
        Drag the divider to view detail differences between Original and Compressed
      </p>
    </div>
  );
}
