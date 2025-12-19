/**
 * SlavkoKernel™ v12 Public API Surface
 */

export interface KernelInput {
  prompt: string
  context?: Record<string, unknown>
  persona?: "default" | "empathetic" | "direct" | "humor" | "neutral"
}

export interface KernelMetrics {
  latencyMs: number
  errorRate: number
  throughput: number
}

export interface KernelOutput {
  text: string
  route: string
  metrics: KernelMetrics
  fallbackUsed?: boolean
  rationale?: string // audit trace (optional)
}

export interface KernelConfig {
  ollamaUrl: string
  model: string
  enableAuditTrace: boolean
  enablePIIRedaction: boolean
}
