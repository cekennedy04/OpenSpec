import React from 'react'

interface StatusBadgeProps {
  status: 'pass' | 'fail' | 'warning' | 'info'
  label: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusClasses = {
    pass: 'bg-green-100 text-green-900 border-green-300',
    fail: 'bg-red-100 text-red-900 border-red-300',
    warning: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    info: 'bg-blue-100 text-blue-900 border-blue-300',
  }

  const icons = {
    pass: '✓',
    fail: '✗',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusClasses[status]}`}>
      <span className="text-lg">{icons[status]}</span>
      <span className="font-semibold">{label}</span>
    </div>
  )
}
