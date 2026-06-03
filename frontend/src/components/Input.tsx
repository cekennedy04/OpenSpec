import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-sm font-semibold mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3
          border border-gray-300 rounded-lg
          text-base font-normal
          focus:outline-2 focus:outline-offset-2 focus:outline-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
