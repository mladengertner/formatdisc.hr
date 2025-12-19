/**
 * SlavkoKernel™ v12 - Production-Ready AI Orchestration
 * Release Candidate (RC)
 */

import { PERSONA_MANIFEST, HARD_FALLBACK_TEXT, type PersonaKey, KERNEL_VERSION } from "./manifest"
import { analyzeHeuristics, type HeuristicResult } from "./heuristics"
import type { KernelInput, KernelOutput, KernelConfig, KernelMetrics } from "./types"

export class SlavkoKernel {
  private config: KernelConfig

  constructor(config?: Partial<KernelConfig>) {
    this.config = {
      ollamaUrl: config?.ollamaUrl || process.env.OLLAMA_API_URL || "http://localhost:11434",
      model: config?.model || "llama3.2",
      enableAuditTrace: config?.enableAuditTrace ?? false,
      enablePIIRedaction: config?.enablePIIRedaction ?? true,
    }
  }

  static async execute(input: KernelInput, config?: Partial<KernelConfig>): Promise<KernelOutput> {
    const kernel = new SlavkoKernel(config)
    return kernel.run(input)
  }

  private async run(input: KernelInput): Promise<KernelOutput> {
    const startTime = Date.now()
    let fallbackUsed = false
    let text = ""
    let route = "default"
    let heuristics: HeuristicResult | null = null

    try {
      // Step 1: Analyze signals
      heuristics = analyzeHeuristics(input.prompt)

      // Step 2: Select route (deterministic routing v2)
      route = input.persona || heuristics.suggestedPersona

      // Step 3: Generate response
      text = await this.generate(input.prompt, route as PersonaKey, input.context)
    } catch (error) {
      // Graceful degradation
      console.error("[SlavkoKernel v12] Execution error:", error)
      text = HARD_FALLBACK_TEXT
      fallbackUsed = true
    }

    // Step 4: Collect metrics
    const latencyMs = Date.now() - startTime
    const metrics: KernelMetrics = {
      latencyMs,
      errorRate: fallbackUsed ? 1 : 0,
      throughput: 1 / (latencyMs / 1000), // req/sec
    }

    // Step 5: Build output
    const output: KernelOutput = {
      text,
      route,
      metrics,
      fallbackUsed,
    }

    // Audit trace (optional)
    if (this.config.enableAuditTrace && heuristics) {
      output.rationale = JSON.stringify({
        version: KERNEL_VERSION,
        signals: heuristics.signals,
        confidence: heuristics.confidence,
        selectedRoute: route,
      })
    }

    return output
  }

  private async generate(prompt: string, persona: PersonaKey, context?: Record<string, unknown>): Promise<string> {
    const personaConfig = PERSONA_MANIFEST[persona]

    const payload = {
      model: this.config.model,
      prompt: `${personaConfig.systemPrompt}\n\n${prompt}`,
      temperature: personaConfig.temperature,
      max_tokens: personaConfig.maxTokens,
      context: context ? JSON.stringify(context) : undefined,
    }

    const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response || HARD_FALLBACK_TEXT
  }

  static async healthCheck(ollamaUrl?: string): Promise<boolean> {
    try {
      const url = ollamaUrl || process.env.OLLAMA_API_URL || "http://localhost:11434"
      const response = await fetch(`${url}/api/tags`, { method: "GET" })
      return response.ok
    } catch {
      return false
    }
  }
}

// Export types
export type { KernelInput, KernelOutput, KernelMetrics, KernelConfig } from "./types"
export { KERNEL_VERSION, PERSONA_MANIFEST } from "./manifest"
