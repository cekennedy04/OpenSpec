/**
 * Report export utilities
 */

import type { ComplianceReport } from '@shared/types'

export class ReportExporter {
  static formatAsText(report: ComplianceReport): string {
    const lines: string[] = [
      '═══════════════════════════════════════════',
      'WORKSPACE COMPLIANCE REPORT',
      '═══════════════════════════════════════════',
      '',
      `Report ID: ${report.reportId}`,
      `Date: ${new Date(report.timestamp).toLocaleString()}`,
      '',
      '───────────────────────────────────────────',
      'OVERALL STATUS',
      '───────────────────────────────────────────',
      report.overallPassed ? '✓ WORKSPACE COMPLIANT' : '⚠ COMPLIANCE ISSUES FOUND',
      '',
      '───────────────────────────────────────────',
      'CLEANLINESS STATUS: ' + report.cleanlinessStatus,
      '───────────────────────────────────────────',
    ]

    if (report.cleanlinessFinding.violations.length > 0) {
      lines.push('Violations Found:')
      report.cleanlinessFinding.violations.forEach((v) => {
        lines.push(`  • ${v.description} (Confidence: ${Math.round(v.confidence * 100)}%)`)
      })
    } else {
      lines.push('✓ No cleanliness violations detected')
    }

    lines.push('')
    lines.push('───────────────────────────────────────────')
    lines.push('ERGONOMICS STATUS: ' + report.ergonomicsStatus)
    lines.push('───────────────────────────────────────────')

    if (report.ergonomicsFinding.issues.length > 0) {
      lines.push('Issues Found:')
      report.ergonomicsFinding.issues.forEach((i) => {
        lines.push(`  • ${i.description} (Confidence: ${Math.round(i.confidence * 100)}%)`)
      })
    } else {
      lines.push('✓ No ergonomic issues detected')
    }

    if (report.recommendations.length > 0) {
      lines.push('')
      lines.push('───────────────────────────────────────────')
      lines.push('RECOMMENDATIONS')
      lines.push('───────────────────────────────────────────')
      report.recommendations.forEach((rec) => {
        lines.push(`[${rec.priority.toUpperCase()}] ${rec.issue}`)
        lines.push(`      → ${rec.action}`)
      })
    }

    lines.push('')
    lines.push('═══════════════════════════════════════════')
    lines.push(report.executiveSummary)
    lines.push('═══════════════════════════════════════════')

    return lines.join('\n')
  }

  static copyToClipboard(report: ComplianceReport): Promise<void> {
    const text = this.formatAsText(report)
    return navigator.clipboard.writeText(text)
  }

  static downloadAsText(report: ComplianceReport): void {
    const text = this.formatAsText(report)
    const blob = new Blob([text], { type: 'text/plain' })
    this.downloadBlob(blob, `workspace-report-${report.reportId}.txt`)
  }

  static async downloadAsPDF(report: ComplianceReport): Promise<void> {
    // Note: This is a placeholder. In production, use a library like jsPDF or pdfkit
    const text = this.formatAsText(report)
    const blob = new Blob([text], { type: 'application/pdf' })
    this.downloadBlob(blob, `workspace-report-${report.reportId}.pdf`)
  }

  static shareViaEmail(report: ComplianceReport): void {
    const text = this.formatAsText(report)
    const subject = `WorkSpaceRx Compliance Report - ${report.reportId}`
    const body = encodeURIComponent(text)
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`
  }

  static shareViaSMS(report: ComplianceReport): void {
    const summary = `${report.overallPassed ? 'Workspace is compliant' : 'Compliance issues found'} - Cleanliness: ${report.cleanlinessStatus}, Ergonomics: ${report.ergonomicsStatus}`
    const text = encodeURIComponent(`WorkSpaceRx Report: ${summary}`)
    window.location.href = `sms:?body=${text}`
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
