import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { StatusBadge } from '../components/StatusBadge'

export default function ReportScreen() {
  const navigate = useNavigate()
  const currentReport = useAppStore((state) => state.currentReport)

  if (!currentReport) {
    return (
      <main className="flex flex-col min-h-screen px-4 py-6">
        <p className="text-center text-gray-600">No report available</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg"
        >
          Go Home
        </button>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen px-4 py-6 pb-safe">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 font-semibold"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Compliance Report</h1>

      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {/* Overall Status */}
        <div
          className={`rounded-lg p-4 ${
            currentReport.overallPassed
              ? 'bg-green-100 border border-green-300'
              : 'bg-red-100 border border-red-300'
          }`}
        >
          <p
            className={`font-semibold text-lg ${
              currentReport.overallPassed ? 'text-green-900' : 'text-red-900'
            }`}
          >
            {currentReport.overallPassed
              ? '✓ WORKSPACE COMPLIANT'
              : '⚠ COMPLIANCE ISSUES FOUND'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(currentReport.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Cleanliness Status */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Cleanliness Status</h3>
            <StatusBadge
              status={currentReport.cleanlinessStatus === 'PASS' ? 'pass' : 'fail'}
              label={currentReport.cleanlinessStatus}
            />
          </div>
          {currentReport.cleanlinessFinding.violations.length > 0 && (
            <ul className="text-sm text-gray-700 space-y-1 mt-2">
              {currentReport.cleanlinessFinding.violations.map((v, i) => (
                <li key={i}>• {v.description}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Ergonomics Status */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Ergonomics Status</h3>
            <StatusBadge
              status={currentReport.ergonomicsStatus === 'PASS' ? 'pass' : 'fail'}
              label={currentReport.ergonomicsStatus}
            />
          </div>
          {currentReport.ergonomicsFinding.issues.length > 0 && (
            <ul className="text-sm text-gray-700 space-y-1 mt-2">
              {currentReport.ergonomicsFinding.issues.map((i, idx) => (
                <li key={idx}>• {i.description}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommendations */}
        {currentReport.recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Recommendations</h3>
            <div className="space-y-2">
              {currentReport.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white rounded p-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {rec.issue}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    → {rec.action}
                  </p>
                  <p className={`text-xs mt-1 ${
                    rec.priority === 'high'
                      ? 'text-red-600'
                      : rec.priority === 'medium'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                  }`}>
                    Priority: {rec.priority.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Executive Summary */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {currentReport.executiveSummary}
          </p>
        </div>

        {/* Report ID */}
        <div className="text-center text-xs text-gray-500 py-2">
          Report ID: {currentReport.reportId}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => navigate('/export')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          📤 Export Report
        </button>
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
