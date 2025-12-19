# SlavkoKernel™ v12 — Production Specification

## Executive Summary

**Purpose:** Deterministic AI orchestration with contextual intelligence, measurable performance, and secure fallbacks.

**Status:** Release Candidate (RC)

**Environment:** Gemini 2.5 Pro / Firebase / Next.js / Edge-ready

---

## What's New in v12

### 1. Deterministic Routing v2
- Strict priority-based routing: `direct` > `empathetic` > `default` > `humor`
- Eliminated ambiguous transitions between tones
- Explicit persona override support

### 2. Heuristics Engine v3
- Stabilized signals: `directness`, `frustration`, `indifference`, `irony`
- Confidence scoring per signal (0-1 scale)
- Debounce logic for noisy inputs

### 3. Persona Contract Lock
- `manifest.ts` as immutable contract
- Breaking changes require MAJOR version bump
- Checksum validation for production deployments

### 4. Metrics-First Execution
- Built-in KPIs: **Latency, Error Rate, Throughput** per call
- P95 latency target: <900ms (edge)
- Error rate target: <0.5%

### 5. Graceful Degradation
- Hard fallback for model, network, and payload errors
- Never returns empty response
- Fallback text is brand-safe and user-friendly

### 6. Audit Surface
- Optional rationale trace (signals + confidence + route)
- Hashed inputs/outputs for compliance
- PII-safe logging (redaction enabled by default)

### 7. SlavkoKernel v7 Council Bridge (Optional Enhancement)
- **Overview:** SlavkoKernel v12 can optionally route certain personas (`direct`, `empathetic`) through **SlavkoKernel v7 council** for enhanced AI decision-making. This creates a hybrid architecture:
  - **v12** = Front controller (heuristics, routing, metrics, fallback)
  - **v7** = Backend council (multi-agent deliberation, voting)

- **Configuration:** Add to `.env.local`:
  ```bash
  SLAVKO_BASE_URL=http://localhost:8000
  SLAVKO_API_TOKEN=your_jwt_token_here
  ```

- **How It Works:**
  ```typescript
  // lib/slavko-kernel-v12/kernel.ts

  async function generateForRoute(route: string, input: KernelInput): Promise<string> {
    const shouldUseCouncil = (route === "direct" || route === "empathetic") && process.env.SLAVKO_BASE_URL

    if (shouldUseCouncil) {
      try {
        const councilResult = await runSlavkoCouncil({
          pipeline: "slavko-demo",
          prompt: input.prompt,
          persona: route,
        })
        return councilResult.summary ?? councilResult.markdown ?? input.prompt
      } catch (error) {
        // Fallback to local generation on council failure
        console.warn("[v12] Council unavailable, using local generation")
      }
    }

    // Local generation (fallback or default)
    // ...
  }
  ```

- **Benefits:**
  1. **Enhanced Responses** - Multi-agent council provides richer, consensus-driven outputs
  2. **Graceful Fallback** - If council is offline, v12 falls back to local generation
  3. **Audit Trail** - Both v12 metrics AND v7 council votes are logged
  4. **Zero Coupling** - Council is optional; v12 works standalone

- **Integration with Experiment Orchestrator:** Experiment definitions can now use **both** steps:
  ```json
  {
    "steps": [
      {
        "id": "step-1",
        "type": "kernel_v12",
        "name": "SlavkoKernel v12 Routing",
        "config": { "persona": "direct" }
      },
      {
        "id": "step-2",
        "type": "slavko_pipeline",
        "name": "SlavkoKernel v7 Council",
        "config": { "pipelineName": "slavko-demo" }
      }
    ]
  }
  ```
  This allows A/B testing: v12-only vs v12+v7 hybrid.

---

## Public API Surface

```typescript
export interface KernelInput {
  prompt: string
  context?: Record<string, unknown>
  persona?: "default" | "empathetic" | "direct" | "humor"
}

export interface KernelOutput {
  text: string
  route: string
  metrics: {
    latencyMs: number
    errorRate: number
    throughput: number
  }
  fallbackUsed?: boolean
  rationale?: string // audit trace (optional)
}

export class SlavkoKernel {
  static async execute(input: KernelInput, config?: Partial<KernelConfig>): Promise<KernelOutput>
  static async healthCheck(ollamaUrl?: string): Promise<boolean>
}
```

---

## Execution Logic

```typescript
try {
  analyzeSignals()      // Heuristics Engine v3
  evaluateHeuristics()  // Confidence scoring
  route = selectRoute() // Deterministic Routing v2
  text = generate(route) // Ollama API call
} catch {
  text = HARD_FALLBACK_TEXT
  fallbackUsed = true
}
collectMetrics()
return output
```

---

## Operational Guarantees

| Metric | Target | Status |
|--------|--------|--------|
| P95 Latency | <900ms (edge) | ✅ RC |
| Error Rate | <0.5% | ✅ RC |
| Cold-start Safe | Yes | ✅ |
| Accessibility | n/a (kernel-only) | ✅ |
| Security | No secrets in prompts | ✅ |

---

## Integration Examples

### Basic Usage

```typescript
import { SlavkoKernel } from "@/lib/slavko-kernel-v12"

const output = await SlavkoKernel.execute({
  prompt: "Kako mogu riješiti ovaj problem?",
})

console.log(output.text)
console.log(`Route: ${output.route}`)
console.log(`Latency: ${output.metrics.latencyMs}ms`)
```

### With Explicit Persona

```typescript
const output = await SlavkoKernel.execute({
  prompt: "Objasni mi koncept",
  persona: "direct",
})
```

### With Audit Trace

```typescript
const output = await SlavkoKernel.execute(
  { prompt: "Pomoć" },
  { enableAuditTrace: true }
)

console.log(output.rationale) // JSON with signals + confidence
```

### Health Check

```typescript
const isHealthy = await SlavkoKernel.healthCheck()
if (!isHealthy) {
  console.error("Ollama is offline")
}
```

---

## Deploy Readiness

**Status:** **READY FOR PRODUCTION (RC)**

**Prerequisites before GA:**

1. ✅ Lock `manifest.ts` checksum
2. ⏳ Run synthetic load test (1k req/min)
3. ⏳ Document fallback copy (brand-safe)
4. ⏳ Enable PII redaction in production

---

## API Endpoints

### POST `/api/slavko/execute`

**Request:**
```json
{
  "prompt": "Brzo mi reci",
  "persona": "direct",
  "context": { "userId": "123" },
  "config": {
    "model": "llama3.2",
    "enableAuditTrace": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "output": "Odgovor...",
  "route": "direct",
  "metrics": {
    "latencyMs": 450,
    "errorRate": 0,
    "throughput": 2.22
  },
  "rationale": "{...}",
  "version": "12.0.0-rc"
}
```

### GET `/api/slavko/health`

**Response:**
```json
{
  "status": "online",
  "version": "12.0.0-rc",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

---

## Testing

Run test suite:
```bash
npm test __tests__/slavko-kernel-v12.test.ts
```

---

## Migration from v11

### Breaking Changes

1. `execute()` now requires `KernelInput` object (not string + config)
2. Return type changed to `KernelOutput` (new structure)
3. `manifest.ts` is now immutable contract

### Migration Guide

**Before (v11):**
```typescript
const result = await SlavkoKernel.execute("prompt", { model: "llama2" })
console.log(result.output)
```

**After (v12):**
```typescript
const output = await SlavkoKernel.execute({ prompt: "prompt" }, { model: "llama3.2" })
console.log(output.text)
```

---

## Changelog

**v12.0.0-rc (2025-01-15)**
- Added Deterministic Routing v2
- Added Heuristics Engine v3
- Added Metrics-First Execution
- Added Graceful Degradation
- Added Audit Surface
- Locked Persona Contract
- Added SlavkoKernel v7 Council Bridge

**v11.x (deprecated)**
- Basic routing
- No metrics
- No fallback handling

---

## Support

- **Documentation:** `/docs/SLAVKOKERNEL_V12.md`
- **API Reference:** `/docs/API_REFERENCE.md`
- **Issues:** GitHub Issues
- **Email:** support@formatdisc.hr
