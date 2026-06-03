import './styles/globals.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAppStore } from './store/appStore'
import HomeScreen from './screens/HomeScreen'
import CameraScreen from './screens/CameraScreen'
import UploadScreen from './screens/UploadScreen'
import AnalysisScreen from './screens/AnalysisScreen'
import ReportScreen from './screens/ReportScreen'
import ExportScreen from './screens/ExportScreen'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const { isDarkMode } = useAppStore()

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <Router>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/camera" element={<CameraScreen />} />
            <Route path="/upload" element={<UploadScreen />} />
            <Route path="/analysis" element={<AnalysisScreen />} />
            <Route path="/report" element={<ReportScreen />} />
            <Route path="/export" element={<ExportScreen />} />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  )
}

export default App
