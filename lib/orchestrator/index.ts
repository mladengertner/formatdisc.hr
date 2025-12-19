import { SlavkoKernel } from "./slavko-kernel"
import { CoreAI } from "./core-ai"
import { Dominor } from "./dominor"

export type AgentType = "slavko-kernel" | "core-ai" | "dominor"

export interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  metadata?: Record<string, any>
}

export async function executeAgent(
  type: AgentType,
  prompt: string,
  config?: Record<string, any>,
): Promise<ExecutionResult> {
  try {
    switch (type) {
      case "slavko-kernel":
        return await SlavkoKernel.execute(prompt, config)
      case "core-ai":
        return await CoreAI.execute(prompt, config)
      case "dominor":
        return await Dominor.execute(prompt, config)
      default:
        throw new Error(`Unknown agent type: ${type}`)
    }
  } catch (error: any) {
    console.error("[v0] Agent execution failed:", error)
    return {
      success: false,
      output: "",
      error: error.message,
    }
  }
}

export async function healthCheck(type: AgentType): Promise<boolean> {
  try {
    switch (type) {
      case "slavko-kernel":
        return await SlavkoKernel.healthCheck()
      case "core-ai":
        return await CoreAI.healthCheck()
      case "dominor":
        return await Dominor.healthCheck()
      default:
        return false
    }
  } catch (error) {
    console.error("[v0] Health check failed:", error)
    return false
  }
}
