import type { ExecutionResult } from "@/lib/types/slavko"

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434"

export class SlavkoKernel {
  static async execute(prompt: string, config?: Record<string, any>): Promise<ExecutionResult> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config?.model || "llama2",
          prompt: `[SlavkoKernel™ System] ${prompt}`,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      const duration = Date.now() - startTime

      return {
        success: true,
        output: data.response,
        metadata: {
          model: data.model,
          created_at: new Date().toISOString(),
          duration,
        },
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      return {
        success: false,
        output: "",
        error: error.message,
        metadata: {
          duration,
          model: config?.model || "unknown",
          created_at: new Date().toISOString(),
        },
      }
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}
