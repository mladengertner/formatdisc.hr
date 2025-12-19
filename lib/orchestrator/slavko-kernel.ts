import type { ExecutionResult } from "./index"

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434"

export class SlavkoKernel {
  static async execute(prompt: string, config?: Record<string, any>): Promise<ExecutionResult> {
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

      return {
        success: true,
        output: data.response,
        metadata: {
          model: data.model,
          created_at: data.created_at,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        output: "",
        error: error.message,
      }
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/tags`)
      return response.ok
    } catch (error) {
      return false
    }
  }
}
