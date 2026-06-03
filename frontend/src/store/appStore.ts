import { create } from 'zustand'
import type {
  ImageData,
  AnalysisResult,
  ComplianceReport,
} from '@shared/types'

interface AppStore {
  // UI State
  isDarkMode: boolean
  currentScreen: string
  loading: boolean
  error: string | null

  // Image State
  selectedImage: ImageData | null
  imagePreview: string | null

  // Analysis State
  isAnalyzing: boolean
  analysisResult: AnalysisResult | null

  // Report State
  currentReport: ComplianceReport | null
  reportHistory: ComplianceReport[]

  // Actions
  setDarkMode: (isDark: boolean) => void
  setCurrentScreen: (screen: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedImage: (image: ImageData | null) => void
  setImagePreview: (url: string | null) => void
  setAnalyzing: (analyzing: boolean) => void
  setAnalysisResult: (result: AnalysisResult | null) => void
  setCurrentReport: (report: ComplianceReport | null) => void
  addToReportHistory: (report: ComplianceReport) => void
  clearHistory: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  // UI State
  isDarkMode: false,
  currentScreen: 'home',
  loading: false,
  error: null,

  // Image State
  selectedImage: null,
  imagePreview: null,

  // Analysis State
  isAnalyzing: false,
  analysisResult: null,

  // Report State
  currentReport: null,
  reportHistory: [],

  // Actions
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedImage: (image) => set({ selectedImage: image }),
  setImagePreview: (url) => set({ imagePreview: url }),
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setCurrentReport: (report) => set({ currentReport: report }),
  addToReportHistory: (report) =>
    set((state) => ({
      reportHistory: [report, ...state.reportHistory].slice(0, 50),
    })),
  clearHistory: () => set({ reportHistory: [] }),
}))
