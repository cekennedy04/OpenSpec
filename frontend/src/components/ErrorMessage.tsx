import React from 'react'

interface ErrorMessageProps {
  title: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorMessage({
  title,
  message,
  onRetry,
  onDismiss,
}: ErrorMessageProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-lg p-6 pb-safe animate-slide-up">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-red-900 mb-2">❌ {title}</h2>
          <p className="text-gray-700">{message}</p>
        </div>
        
        <div className="space-y-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg"
            >
              🔄 Try Again
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface WarningMessageProps {
  title: string
  message: string
  onConfirm?: () => void
  onCancel?: () => void
}

export function WarningMessage({
  title,
  message,
  onConfirm,
  onCancel,
}: WarningMessageProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-yellow-900 mb-2">⚠️ {title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          )}
          
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
