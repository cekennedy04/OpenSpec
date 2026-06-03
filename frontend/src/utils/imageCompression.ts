/**
 * Image compression utilities for client-side processing
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1
  format?: 'jpeg' | 'png' | 'webp'
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxWidth: 1280,
  maxHeight: 960,
  quality: 0.8,
  format: 'jpeg',
}

export async function compressImage(
  file: File,
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions maintaining aspect ratio
        const maxWidth = options.maxWidth || 1280
        const maxHeight = options.maxHeight || 960

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        const mimeType =
          options.format === 'png'
            ? 'image/png'
            : options.format === 'webp'
              ? 'image/webp'
              : 'image/jpeg'

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          mimeType,
          options.quality || 0.8
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = event.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

export async function getCompressedFileSize(
  file: File,
  options?: CompressionOptions
): Promise<number> {
  const compressed = await compressImage(file, options)
  return compressed.size
}

export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}
