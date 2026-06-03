import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { cameraService } from '../services/cameraService'
import { useAppStore } from '../store/appStore'

export default function CameraScreen() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setImagePreview = useAppStore((state) => state.setImagePreview)

  useEffect(() => {
    const initCamera = async () => {
      try {
        if (videoRef.current) {
          await cameraService.startStream(videoRef.current, {
            facingMode: 'environment',
            width: 1280,
            height: 720,
          })
          setIsCameraReady(true)
        }
      } catch (err) {
        setError('Failed to access camera. Please check permissions.')
        console.error(err)
      }
    }

    initCamera()

    return () => {
      cameraService.stopStream()
    }
  }, [])

  const handleCapture = async () => {
    try {
      const blob = await cameraService.captureFrame()
      const url = URL.createObjectURL(blob)
      setImagePreview(url)
      navigate('/upload')
    } catch (err) {
      setError('Failed to capture image')
      console.error(err)
    }
  }

  return (
    <main className="flex flex-col min-h-screen px-4 py-6 bg-black">
      <button
        onClick={() => {
          cameraService.stopStream()
          navigate(-1)
        }}
        className="mb-4 text-white font-semibold z-10"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4 text-white">Camera Capture</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!isCameraReady && !error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white text-lg">Initializing camera...</p>
        </div>
      )}

      {isCameraReady && (
        <>
          <div className="flex-1 flex items-center justify-center bg-black rounded-lg mb-4 overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          </div>

          <div className="space-y-2 pb-safe">
            <button
              onClick={handleCapture}
              disabled={!isCameraReady}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition"
            >
              📸 Capture
            </button>
            <button
              onClick={() => {
                cameraService.stopStream()
                navigate('/')
              }}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </main>
  )
}
