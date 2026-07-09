import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, ShieldCheck } from 'lucide-react';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export default function ImageUploader({ onFilesSelected }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesList = Array.from(e.dataTransfer.files) as File[];
      const imageFiles = filesList.filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesList = Array.from(e.target.files) as File[];
      const imageFiles = filesList.filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        id="image-dropzone-container"
        className={`relative flex flex-col items-center justify-center min-h-[220px] md:min-h-[280px] px-6 py-8 border-2 border-dashed rounded-3xl transition-all duration-300 group cursor-pointer ${
          isDragActive
            ? 'border-emerald-500 bg-emerald-50/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[0.98]'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          id="dropzone-file-input"
        />

        <div className="flex flex-col items-center justify-center text-center max-w-md">
          {/* Decorative icons */}
          <div className="relative mb-5 flex items-center justify-center">
            {/* Background elements */}
            <div className={`absolute w-16 h-16 rounded-full bg-emerald-50 blur-sm transition-transform duration-300 group-hover:scale-125 ${isDragActive ? 'scale-125 bg-emerald-100' : ''}`} />
            <div className="relative flex items-center justify-center p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-600 transition-transformation duration-300 group-hover:-translate-y-1">
              <Upload className={`w-8 h-8 text-emerald-500 transition-all duration-300 ${isDragActive ? 'animate-bounce' : 'group-hover:text-emerald-600'}`} />
            </div>
            <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center p-1 bg-amber-50 rounded-lg border border-amber-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            </div>
          </div>

          <p className="text-slate-800 font-semibold text-lg md:text-xl tracking-tight mb-1">
            Drag & drop images here
          </p>
          <p className="text-slate-500 text-sm mb-4">
            or <span className="text-emerald-600 font-semibold underline decoration-2 underline-offset-2 hover:text-emerald-700">browse from computer</span>
          </p>
          <span className="inline-flex gap-1.5 items-center px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            Supports JPEG, PNG, WebP
          </span>
        </div>
      </div>

      {/* Privacy and Trust Badge */}
      <div className="flex items-center justify-center gap-3 py-3 px-4 bg-[#f8fafc] rounded-2xl border border-slate-100 text-slate-500 text-xs font-medium max-w-xl mx-auto w-full">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="leading-tight text-center sm:text-left">
          <strong className="text-slate-700 font-semibold">Privacy First:</strong> Your images never leave your computer. Processing occurs entirely locally in your web browser.
        </span>
      </div>
    </div>
  );
}
