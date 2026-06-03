/**
 * Report generation service for backend
 */

import type {
  AnalysisResult,
  ComplianceReport,
  Recommendation,
  CleanlinessViolation,
  ErgonomicsIssue,
} from '@shared/types'

export class ReportGenerator {
  generateReport(analysisResult: AnalysisResult): ComplianceReport {
    const cleanlinessPass = analysisResult.cleanliness.violations.length === 0
    const ergonomicsPass = analysisResult.ergonomics.issues.length === 0
    const overallPass = cleanlinessPass && ergonomicsPass

    const recommendations = this.generateRecommendations(analysisResult)

    const executiveSummary = this.generateExecutiveSummary(
      overallPass,
      cleanlinessPass,
      ergonomicsPass,
      analysisResult
    )

    return {
      reportId: this.generateReportId(),
      timestamp: Date.now(),
      overallPassed: overallPass,
      cleanlinessStatus: cleanlinessPass ? 'PASS' : 'FAIL',
      ergonomicsStatus: ergonomicsPass ? 'PASS' : 'FAIL',
      cleanlinessFinding: analysisResult.cleanliness,
      ergonomicsFinding: analysisResult.ergonomics,
      recommendations,
      executiveSummary,
    }
  }

  private generateRecommendations(analysisResult: AnalysisResult): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Cleanliness recommendations
    analysisResult.cleanliness.violations.forEach((violation) => {
      recommendations.push({
        category: 'cleanliness',
        issue: violation.description,
        action: this.getCleanlinessAction(violation),
        priority:
          violation.severity === 'high' ? 'high' : violation.severity === 'medium' ? 'medium' : 'low',
      })
    })

    // Ergonomics recommendations
    analysisResult.ergonomics.issues.forEach((issue) => {
      recommendations.push({
        category: 'ergonomics',
        issue: issue.description,
        action: this.getErgonomicsAction(issue),
        priority:
          issue.severity === 'high' ? 'high' : issue.severity === 'medium' ? 'medium' : 'low',
      })
    })

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  private getCleanlinessAction(violation: CleanlinessViolation): string {
    const actions: { [key: string]: string } = {
      'spilled food': 'Clean spilled food immediately',
      'spilled beverage': 'Clean spilled beverage immediately',
      'open container': 'Cover or remove open food containers',
      'unsanitary condition': 'Clean and sanitize affected surfaces',
      default: 'Address cleanliness issue immediately',
    }

    const action = actions[violation.type.toLowerCase()] || actions.default
    return action
  }

  private getErgonomicsAction(issue: ErgonomicsIssue): string {
    const actions: { [key: string]: string } = {
      'keyboard angle': 'Adjust keyboard to neutral angle (0-20 degrees)',
      'monitor height': 'Position monitor top at eye level, 20-26 inches away',
      'chair support': 'Use chair with proper lumbar support',
      'wrist position': 'Keep wrist in neutral position while typing',
      'screen distance': 'Position screen 20-26 inches from eyes',
      default: 'Adjust workspace ergonomics',
    }

    const action = actions[issue.type.toLowerCase()] || actions.default
    return action
  }

  private generateExecutiveSummary(
    overallPass: boolean,
    cleanlinessPass: boolean,
    ergonomicsPass: boolean,
    result: AnalysisResult
  ): string {
    const timestamp = new Date().toLocaleString()

    if (overallPass) {
      return `✓ WORKSPACE COMPLIANT (${timestamp})\n\nYour workspace meets both cleanliness and ergonomic standards. Continue following best practices.`
    }

    const issues: string[] = []

    if (!cleanlinessPass) {
      issues.push(
        `${result.cleanliness.violations.length} cleanliness violation(s) detected`
      )
    }

    if (!ergonomicsPass) {
      issues.push(`${result.ergonomics.issues.length} ergonomic issue(s) detected`)
    }

    return `⚠ COMPLIANCE ISSUES FOUND (${timestamp})\n\n${issues.join('\n')}\n\nPlease review recommendations and take corrective action.`
  }

  private generateReportId(): string {
    return `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  }
}

export const reportGenerator = new ReportGenerator()
