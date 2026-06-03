/**
 * API service for backend communication
 */

import type {
  AnalysisResult,
  ComplianceReport,
  ImageData,
} from '@shared/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')
// Vision analysis is much slower than a normal request, so give it its own,
// longer budget instead of timing out at the default 30s.
const ANALYSIS_TIMEOUT = parseInt(import.meta.env.VITE_ANALYSIS_TIMEOUT || '120000')

export type ProcessStep = 'uploading' | 'analyzing' | 'reporting' | 'done'

class ApiService {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = this.timeout
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(
          `Request timed out after ${Math.round(timeout / 1000)}s. Please try again.`
        )
      }
      throw new Error(
        'Could not reach the server. Make sure the backend is running on ' +
          `${this.baseUrl}.`
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /** Pull the most useful error message out of a failed response. */
  private async errorMessage(response: Response, fallback: string): Promise<string> {
    try {
      const data = await response.json()
      if (data?.error) return data.error
    } catch {
      // body wasn't JSON; fall through
    }
    return `${fallback} (${response.status} ${response.statusText})`
  }

  async uploadImage(imageFile: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await this.fetchWithTimeout(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(await this.errorMessage(response, 'Upload failed'))
    }

    const data = await response.json()
    return data.filePath
  }

  async analyzeImage(imagePath: string): Promise<AnalysisResult> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath }),
      },
      ANALYSIS_TIMEOUT
    )

    if (!response.ok) {
      throw new Error(await this.errorMessage(response, 'Analysis failed'))
    }

    // Backend wraps payloads as { success, data }.
    const body = await response.json()
    return body.data as AnalysisResult
  }

  async generateReport(analysisResult: AnalysisResult): Promise<ComplianceReport> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisResult }),
    })

    if (!response.ok) {
      throw new Error(await this.errorMessage(response, 'Report generation failed'))
    }

    const body = await response.json()
    return body.data as ComplianceReport
  }

  async processImage(
    imageData: ImageData,
    onProgress?: (step: ProcessStep) => void
  ): Promise<{ analysisResult: AnalysisResult; report: ComplianceReport }> {
    // Step 1: Upload image
    onProgress?.('uploading')
    const imagePath = await this.uploadImage(imageData.file)

    // Step 2: Run analysis
    onProgress?.('analyzing')
    const analysisResult = await this.analyzeImage(imagePath)

    // Step 3: Generate report
    onProgress?.('reporting')
    const report = await this.generateReport(analysisResult)

    onProgress?.('done')
    return { analysisResult, report }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`)
      return response.ok
    } catch {
      return false
    }
  }
}

export const apiService = new ApiService()
