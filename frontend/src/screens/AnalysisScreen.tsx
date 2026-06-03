import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { apiService, type ProcessStep } from '../services/apiService'
import { ErrorMessage } from '../components/ErrorMessage'
import { ProgressBar } from '../components/ProgressBar'

const STEP_INFO: Record<ProcessStep, { label: string; progress: number }> = {
  uploading: { label: 'Uploading image…', progress: 20 },
  analyzing: { label: 'Analyzing workspace for compliance…', progress: 65 },
  reporting: { label: 'Generating compliance report…', progress: 90 },
  done: { label: 'Done!', progress: 100 },
}

export default function AnalysisScreen() {
  const navigate = useNavigate()
  const selectedImage = useAppStore((state) => state.selectedImage)
  const setAnalyzing = useAppStore((state) => state.setAnalyzing)
  const setAnalysisResult = useAppStore((state) => state.setAnalysisResult)
  const setCurrentReport = useAppStore((state) => state.setCurrentReport)
  const addToReportHistory = useAppStore((state) => state.addToReportHistory)
  const setError = useAppStore((state) => state.setError)

  const [step, setStep] = useState<ProcessStep>('uploading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  // Guards against React StrictMode running the effect (and the analysis) twice.
  const startedAttempt = useRef(-1)

  useEffect(() => {
    if (!selectedImage) {
      navigate('/')
      return
    }
    if (startedAttempt.current === attempt) return
    startedAttempt.current = attempt

    const runAnalysis = async () => {
      try {
        setAnalyzing(true)
        setError(null)
        setErrorMessage(null)
        setStep('uploading')

        const { analysisResult, report } = await apiService.processImage(
          selectedImage,
          (nextStep) => setStep(nextStep)
        )

        setAnalysisResult(analysisResult)
        setCurrentReport(report)
        addToReportHistory(report)

        navigate('/report')
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to analyze image. Please try again.'
        setError(message)
        setErrorMessage(message)
        console.error('Analysis error:', error)
      } finally {
        setAnalyzing(false)
      }
    }

    runAnalysis()
  }, [
    selectedImage,
    attempt,
    navigate,
    setAnalyzing,
    setAnalysisResult,
    setCurrentReport,
    addToReportHistory,
    setError,
  ])

  const { label, progress } = STEP_INFO[step]

  return (
    <main className="flex flex-col min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Analyzing Image</h1>

      <div className="flex-1 flex flex-col items-center justify-center">
        {!errorMessage && (
          <>
            <div className="animate-spin text-6xl mb-4">⏳</div>
            <p className="text-gray-700 text-lg font-semibold text-center">{label}</p>
            <div className="w-full max-w-xs mt-6">
              <ProgressBar value={progress} />
            </div>
            <p className="text-gray-500 text-sm mt-3">
              This usually takes 10–30 seconds
            </p>
          </>
        )}
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
      >
        Cancel
      </button>

      {errorMessage && (
        <ErrorMessage
          title="Analysis Failed"
          message={errorMessage}
          onRetry={() => {
            setErrorMessage(null)
            setAttempt((a) => a + 1)
          }}
          onDismiss={() => navigate('/')}
        />
      )}
    </main>
  )
}
