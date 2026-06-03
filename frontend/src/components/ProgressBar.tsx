import React from 'react'

interface ProgressProps {
  value: number
  max?: number
  label?: string
}

export function ProgressBar({ value, max = 100, label }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold mb-2">
          {label}
        </label>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">{Math.round(percentage)}%</p>
    </div>
  )
}
