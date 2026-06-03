/**
 * Shared types for WorkSpaceRx camera and file upload functionality
 */

export interface ImageUploadOptions {
  maxSizeBytes: number;
  minWidthPx: number;
  minHeightPx: number;
  acceptedFormats: string[];
}

export interface ImageData {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface CameraPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    format: string;
    size: number;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

export interface AnalysisRequest {
  imageData: ImageData;
  requestId: string;
  timestamp: number;
}

export interface AnalysisResult {
  requestId: string;
  cleanliness: CleanlinessAnalysis;
  ergonomics: ErgonomicsAnalysis;
  timestamp: number;
}

export interface CleanlinessAnalysis {
  passed: boolean;
  violations: CleanlinessViolation[];
}

export interface CleanlinessViolation {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface ErgonomicsAnalysis {
  passed: boolean;
  issues: ErgonomicsIssue[];
}

export interface ErgonomicsIssue {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface ComplianceReport {
  reportId: string;
  timestamp: number;
  overallPassed: boolean;
  cleanlinessStatus: 'PASS' | 'FAIL';
  ergonomicsStatus: 'PASS' | 'FAIL';
  cleanlinessFinding: CleanlinessAnalysis;
  ergonomicsFinding: ErgonomicsAnalysis;
  recommendations: Recommendation[];
  executiveSummary: string;
}

export interface Recommendation {
  category: 'cleanliness' | 'ergonomics';
  issue: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ReportExportFormat {
  format: 'text' | 'pdf' | 'json';
  includeTimestamp: boolean;
  includeReportId: boolean;
}
