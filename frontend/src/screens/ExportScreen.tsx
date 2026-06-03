import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { ReportExporter } from '../utils/reportExporter'

export default function ExportScreen() {
  const navigate = useNavigate()
  const currentReport = useAppStore((state) => state.currentReport)
  const [copied, setCopied] = useState(false)

  if (!currentReport) {
    return (
      <main className="flex flex-col min-h-screen px-4 py-6">
        <p className="text-center text-gray-600">No report to export</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg"
        >
          Go Home
        </button>
      </main>
    )
  }

  const handleCopyToClipboard = async () => {
    try {
      await ReportExporter.copyToClipboard(currentReport)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDownloadText = () => {
    ReportExporter.downloadAsText(currentReport)
  }

  const handleDownloadPDF = async () => {
    try {
      await ReportExporter.downloadAsPDF(currentReport)
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  const handleShareEmail = () => {
    ReportExporter.shareViaEmail(currentReport)
  }

  const handleShareSMS = () => {
    ReportExporter.shareViaSMS(currentReport)
  }

  return (
    <main className="flex flex-col min-h-screen px-4 py-6 pb-safe">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 font-semibold"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Export Report</h1>

      <div className="flex-1 space-y-3 mb-4">
        {/* Email */}
        <button
          onClick={handleShareEmail}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">📧</span> Email Report
        </button>

        {/* SMS */}
        <button
          onClick={handleShareSMS}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">💬</span> Share via SMS
        </button>

        {/* Copy to Clipboard */}
        <button
          onClick={handleCopyToClipboard}
          className={`w-full font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2 ${
            copied
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          <span className="text-xl">{copied ? '✓' : '📋'}</span>{' '}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>

        {/* Download as Text */}
        <button
          onClick={handleDownloadText}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">📄</span> Download as Text
        </button>

        {/* Download as PDF */}
        <button
          onClick={handleDownloadPDF}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">📑</span> Download as PDF
        </button>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Home
        </button>
      </div>
    </main>
  )
}
