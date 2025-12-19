export type AuditDimension = "throughput" | "visibility" | "control" | "risk" | "revenue"

export type AuditIssue = {
  id: string
  title: string
  dimension: AuditDimension
  severity: 1 | 2 | 3 | 4 | 5
  problem: string
  impactEuroPerMonth?: number
  impactNarrative: string
  fixPlan: string
  tierRecommendation: "starter" | "pro" | "enterprise" | "premium"
  estimatedWindowHours: number
}

export type AuditReport = {
  auditId: string
  clientName: string
  generatedAt: string
  summary: string
  issues: AuditIssue[]
  totalEstimatedRecoveryPerMonth?: number
  recommendedTierOverall: AuditIssue["tierRecommendation"]
}
