export type IdeaType = "saas_dashboard" | "ecommerce" | "booking" | "ai_chatbot" | "mobile_app"
export type ComplianceLevel = "standard" | "gdpr_strict" | "finance_grade"

export interface Phase {
  id: 1 | 2 | 3 | 4 | 5
  name: string
  label: string
  status: "pending" | "running" | "success"
  metrics: {
    durationHours: number
    successRate: number
    notes: string
  }
}

export interface MvpSimulationRequest {
  ideaType: IdeaType
  targetAudience: string
  keyFeatures: string
  complianceLevel: ComplianceLevel
}

export interface MvpSimulationResponse {
  phases: Phase[]
  summary: string
  etaHours: number
}
