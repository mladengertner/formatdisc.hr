// Complete experiment types with dynamic step handlers
export type ExperimentStepType =
  | "input"
  | "transform"
  | "ai_decision"
  | "compliance_check"
  | "metrics"
  | "webhook"
  | "data_mapping"

export interface ExperimentStep {
  id: string
  type: ExperimentStepType
  name: string
  description?: string
  config: Record<string, any>
}

export interface ExperimentDefinition {
  id: string
  name: string
  description?: string
  steps: ExperimentStep[]
  createdAt?: string
  updatedAt?: string
}

export interface StepExecutionContext {
  prevOutput: any
  logs: StepLog[]
  scenario?: string
  metadata?: Record<string, any>
}

export interface StepLog {
  stepId: string
  stepName: string
  status: "idle" | "running" | "success" | "error" | "skipped"
  data?: any
  error?: string
  duration: number
  ts: string
}

export interface ExperimentRunResult {
  experimentId: string
  finalOutput: any
  logs: StepLog[]
  totalDuration: number
  success: boolean
}
