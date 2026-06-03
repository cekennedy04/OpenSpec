/**
 * Image validation utilities
 */

export interface ImageValidationConfig {
  maxSizeBytes: number
  minWidthPx: number
  minHeightPx: number
  acceptedFormats: string[]
}

export const DEFAULT_VALIDATION_CONFIG: ImageValidationConfig = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  minWidthPx: 640,
  minHeightPx: 480,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
}

export async function validateImage(
  file: File,
  config: ImageValidationConfig = DEFAULT_VALIDATION_CONFIG
): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  if (file.size > config.maxSizeBytes) {
    const maxMB = Math.round(config.maxSizeBytes / (1024 * 1024))
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxMB}MB.`,
    }
  }

  // Check file format
  if (!config.acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `File format not supported. Accepted formats: ${config.acceptedFormats.join(', ')}`,
    }
  }

  // Check image dimensions
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (img.width < config.minWidthPx || img.height < config.minHeightPx) {
        resolve({
          valid: false,
          error: `Image resolution too low. Minimum ${config.minWidthPx}x${config.minHeightPx}px required.`,
        })
      } else {
        resolve({ valid: true })
      }
    }
    img.onerror = () => {
      resolve({
        valid: false,
        error: 'Failed to validate image dimensions.',
      })
    }
    img.src = URL.createObjectURL(file)
  })
}

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      reject(new Error('Failed to get image dimensions'))
    }
    img.src = URL.createObjectURL(file)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
