import { CompressionSettings, UploadedImage } from '../types';

/**
 * Loads an image from a URL and returns an HTMLImageElement
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image.'));
    img.src = url;
  });
}

/**
 * Calculates correct dimensions based on resize settings
 */
export function getTargetDimensions(
  origWidth: number,
  origHeight: number,
  settings: CompressionSettings
): { width: number; height: number } {
  const { resizeMode, resizePercentage, resizeWidth, resizeHeight, maintainAspectRatio } = settings;

  if (resizeMode === 'none') {
    return { width: origWidth, height: origHeight };
  }

  if (resizeMode === 'percentage') {
    const scale = resizePercentage / 100;
    return {
      width: Math.max(1, Math.round(origWidth * scale)),
      height: Math.max(1, Math.round(origHeight * scale)),
    };
  }

  if (resizeMode === 'dimensions') {
    let targetW = resizeWidth;
    let targetH = resizeHeight;

    if (maintainAspectRatio) {
      const aspectRatio = origWidth / origHeight;
      if (targetW > 0 && targetH <= 0) {
        targetH = Math.round(targetW / aspectRatio);
      } else if (targetH > 0 && targetW <= 0) {
        targetW = Math.round(targetH * aspectRatio);
      } else if (targetW > 0 && targetH > 0) {
        // If both are specified, prioritize width to maintain aspect ratio,
        // or fit within the bounding box of width and height
        const scaleW = targetW / origWidth;
        const scaleH = targetH / origHeight;
        const scale = Math.min(scaleW, scaleH);
        targetW = Math.round(origWidth * scale);
        targetH = Math.round(origHeight * scale);
      } else {
        targetW = origWidth;
        targetH = origHeight;
      }
    }

    return {
      width: Math.max(1, targetW),
      height: Math.max(1, targetH),
    };
  }

  return { width: origWidth, height: origHeight };
}

/**
 * Formats bytes to standard human-readable format (KB, MB etc.)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Compress an image using HTML5 Canvas
 */
export async function compressImage(
  image: UploadedImage,
  customSettings?: CompressionSettings
): Promise<Partial<UploadedImage>> {
  const settings = customSettings || image.settings;
  const imgElement = await loadImage(image.originalUrl);

  const { width: targetWidth, height: targetHeight } = getTargetDimensions(
    image.originalWidth,
    image.originalHeight,
    settings
  );

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Draw image clean and crisp onto canvas
  ctx.drawImage(imgElement, 0, 0, targetWidth, targetHeight);

  // Determine mime type
  let mimeType = image.file.type;
  if (settings.format !== 'original') {
    mimeType = settings.format;
  }

  // Handle compression formats
  // Canvas toBlob supports quality for image/jpeg and image/webp
  const quality = settings.quality;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas compression failed (Blob took null value)'));
          return;
        }

        const compressedUrl = URL.createObjectURL(blob);
        const savingPercentage = Math.round(
          ((image.originalSize - blob.size) / image.originalSize) * 100
        );

        resolve({
          compressedSize: blob.size,
          compressedUrl,
          compressedWidth: targetWidth,
          compressedHeight: targetHeight,
          savingPercentage: savingPercentage,
          status: 'completed',
          error: null,
          settings,
        });
      },
      mimeType,
      quality
    );
  });
}
