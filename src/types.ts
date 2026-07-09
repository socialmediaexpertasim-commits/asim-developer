export interface CompressionSettings {
  quality: number; // 0.1 to 1.0
  format: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
  resizeMode: 'none' | 'percentage' | 'dimensions';
  resizePercentage: number; // 10 to 100
  resizeWidth: number; // custom width
  resizeHeight: number; // custom height
  maintainAspectRatio: boolean;
}

export type CompressionStatus = 'idle' | 'compressing' | 'completed' | 'failed';

export interface UploadedImage {
  id: string;
  name: string;
  file: File;
  originalSize: number;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  compressedSize: number | null;
  compressedUrl: string | null;
  compressedWidth: number | null;
  compressedHeight: number | null;
  savingPercentage: number | null;
  status: CompressionStatus;
  error: string | null;
  settings: CompressionSettings;
}

export interface CompressionStats {
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavedSize: number;
  totalPercentageSaved: number;
  imagesCount: number;
}
