import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { validateImage, formatFileSize } from '../utils/imageValidation'
import { compressImage } from '../utils/imageCompression'

export default function UploadScreen() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const setImageData = useAppStore((state) => state.setSelectedImage)

  const handleFileSelect = async (file: File) => {
    setValidating(true)
    setError(null)

    try {
      // Validate image
      const validation = await validateImage(file)
      if (!validation.valid) {
        setError(validation.error || 'Validation failed')
        setValidating(false)
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to validate image')
      console.error(err)
    } finally {
      setValidating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleProceed = async () => {
    if (selectedFile && preview) {
      try {
        setValidating(true)
        // Compress image before sending
        const compressed = await compressImage(selectedFile)
        const compressedFile = new File([compressed], selectedFile.name, {
          type: 'image/jpeg',
        })

        // Store image data
        setImageData({
          file: compressedFile,
          previewUrl: preview,
          width: 1280,
          height: 960,
          sizeBytes: compressedFile.size,
        })

        navigate('/analysis')
      } catch (err) {
        setError('Failed to compress image')
        console.error(err)
      } finally {
        setValidating(false)
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <main className="flex flex-col min-h-screen px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 font-semibold"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Upload Image</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">❌ {error}</p>
        </div>
      )}

      {validating && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p>Processing image...</p>
        </div>
      )}

      {!preview ? (
        <div
          className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg mb-4 p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="text-center">
            <p className="text-5xl mb-4">📁</p>
            <p className="text-gray-600 font-semibold">Tap to select an image</p>
            <p className="text-gray-500 text-sm mt-2">or drag and drop</p>
            <p className="text-gray-400 text-xs mt-4">JPG, PNG • Max 10MB</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            onChange={handleInputChange}
            disabled={validating}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center mb-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain rounded-lg max-h-96"
          />
          {selectedFile && (
            <div className="mt-4 w-full bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <strong>File:</strong> {selectedFile.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Size:</strong> {formatFileSize(selectedFile.size)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 pb-safe">
        {preview && (
          <button
            onClick={() => {
              setSelectedFile(null)
              setPreview(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
            disabled={validating}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Choose Different Image
          </button>
        )}

        {preview && (
          <button
            onClick={handleProceed}
            disabled={validating}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {validating ? 'Processing...' : 'Proceed to Analysis'}
          </button>
        )}

        <button
          onClick={() => navigate('/')}
          disabled={validating}
          className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </main>
  )
}
