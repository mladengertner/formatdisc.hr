export type ExperimentStepType =
  | "input"
  | "transform"
  | "ai_decision"
  | "compliance_check"
  | "metrics"
  | "webhook"
  | "data_mapping"
  | "slavko_pipeline"
  | "kernel_v12"

export interface ExperimentStep {
  id: string
  type: ExperimentStepType
  name: string
  description?: string
  config: Record<string, any>
  position?: { x: number; y: number }
}

export interface ExperimentDefinition {
  id: string
  name: string
  description?: string
  steps: ExperimentStep[]
  created_at?: string
  updated_at?: string
  user_id?: string
}

export interface ExperimentRun {
  id: string
  experiment_id: string
  input: any
  scenario?: string
  finalOutput: any
  logs: ExperimentLog[]
  duration_ms: number
  created_at: string
}

export interface ExperimentLog {
  stepId: string
  stepName: string
  type: ExperimentStepType
  status: "idle" | "running" | "success" | "error" | "skipped"
  data?: any
  error?: string
  duration_ms: number
  ts: string
}

export interface SlavkoCouncilResponse {
  output: string
  summary?: string
  council?: {
    quorum: number
    threshold: number
    votes: Array<{
      agent: string
      vote: "approve" | "reject" | "abstain"
      confidence: number
    }>
    decision: "approved" | "rejected"
  }
  audit?: {
    run_id: string
    pipeline: string
    timestamp: string
  }
  raw?: any
}
