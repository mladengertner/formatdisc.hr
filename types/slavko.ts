export interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  metadata: {
    model: string
    created_at: string
    duration: number
  }
}

export interface PromptPreset {
  id: string
  name: string
  description: string
  prompt: string
  config: { model?: string }
}

export interface KernelExecutionResult {
  success: boolean
  output: string
  route?: string
  metrics?: {
    latencyMs: number
    errorRate: number
    throughput: number
  }
  rationale?: string
  version?: string
  error?: string
  metadata?: {
    model: string
    created_at: string
    duration: number
  }
}
