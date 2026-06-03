/**
 * Camera service for accessing device camera via getUserMedia API
 */

export interface CameraStreamOptions {
  width?: number
  height?: number
  facingMode?: 'user' | 'environment'
}

export class CameraService {
  private stream: MediaStream | null = null
  private video: HTMLVideoElement | null = null

  async requestPermission(): Promise<boolean> {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      return true
    } catch (error) {
      console.error('Camera permission denied:', error)
      return false
    }
  }

  async startStream(
    videoElement: HTMLVideoElement,
    options: CameraStreamOptions = {}
  ): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: options.facingMode || 'environment',
          width: options.width ? { ideal: options.width } : undefined,
          height: options.height ? { ideal: options.height } : undefined,
        },
        audio: false,
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.video = videoElement
      this.video.srcObject = this.stream

      return this.stream
    } catch (error) {
      console.error('Failed to start camera stream:', error)
      throw error
    }
  }

  async captureFrame(): Promise<Blob> {
    if (!this.video) {
      throw new Error('Video element not initialized')
    }

    const canvas = document.createElement('canvas')
    canvas.width = this.video.videoWidth
    canvas.height = this.video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    ctx.drawImage(this.video, 0, 0)

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to capture frame'))
        }
      }, 'image/jpeg', 0.95)
    })
  }

  stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    if (this.video) {
      this.video.srcObject = null
    }
  }

  async switchCamera(): Promise<void> {
    this.stopStream()
    if (this.video) {
      const newMode = 'user' // Toggle between user and environment
      await this.startStream(this.video, { facingMode: newMode })
    }
  }
}

export const cameraService = new CameraService()
