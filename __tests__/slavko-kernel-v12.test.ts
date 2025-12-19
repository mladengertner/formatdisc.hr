import { describe, it, expect } from "vitest"
import { SlavkoKernel, KERNEL_VERSION } from "@/lib/slavko-kernel-v12"
import { analyzeHeuristics } from "@/lib/slavko-kernel-v12/heuristics"

describe("SlavkoKernel v12", () => {
  describe("Heuristics Engine v3", () => {
    it("should detect directness signal", () => {
      const result = analyzeHeuristics("Daj mi brzo odgovor odmah!")
      expect(result.signals.directness).toBeGreaterThan(0.5)
      expect(result.suggestedPersona).toBe("direct")
    })

    it("should detect frustration signal", () => {
      const result = analyzeHeuristics("Ovo ne radi, imam problem sa greškom")
      expect(result.signals.frustration).toBeGreaterThan(0.5)
      expect(result.suggestedPersona).toBe("direct")
    })

    it("should detect irony signal", () => {
      const result = analyzeHeuristics("Naravno, super, baš odlično!")
      expect(result.signals.irony).toBeGreaterThan(0.5)
      expect(result.suggestedPersona).toBe("humor")
    })

    it("should default to empathetic for neutral input", () => {
      const result = analyzeHeuristics("Kako mogu pomoći?")
      expect(result.suggestedPersona).toBe("empathetic")
    })
  })

  describe("Deterministic Routing v2", () => {
    it("should prioritize direct over empathetic", () => {
      const result = analyzeHeuristics("Hitno trebam pomoć, imam problem")
      expect(result.suggestedPersona).toBe("direct")
    })

    it("should use explicit persona override", async () => {
      const output = await SlavkoKernel.execute({
        prompt: "Test",
        persona: "humor",
      })
      expect(output.route).toBe("humor")
    })
  })

  describe("Graceful Degradation", () => {
    it("should return fallback text on error", async () => {
      const kernel = new SlavkoKernel({ ollamaUrl: "http://invalid-url:99999" })
      const output = await kernel.execute({ prompt: "Test" })

      expect(output.fallbackUsed).toBe(true)
      expect(output.text).toContain("ne mogu obraditi")
    })

    it("should track error rate metric", async () => {
      const kernel = new SlavkoKernel({ ollamaUrl: "http://invalid-url:99999" })
      const output = await kernel.execute({ prompt: "Test" })

      expect(output.metrics.errorRate).toBe(1)
    })
  })

  describe("Metrics Collection", () => {
    it("should measure latency", async () => {
      const output = await SlavkoKernel.execute({ prompt: "Test" })
      expect(output.metrics.latencyMs).toBeGreaterThan(0)
    })

    it("should calculate throughput", async () => {
      const output = await SlavkoKernel.execute({ prompt: "Test" })
      expect(output.metrics.throughput).toBeGreaterThan(0)
    })
  })

  describe("Version Contract", () => {
    it("should export correct version", () => {
      expect(KERNEL_VERSION).toBe("12.0.0-rc")
    })
  })

  describe("Health Check", () => {
    it("should return boolean status", async () => {
      const isHealthy = await SlavkoKernel.healthCheck()
      expect(typeof isHealthy).toBe("boolean")
    })
  })
})
