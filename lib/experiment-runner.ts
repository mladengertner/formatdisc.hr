import type { ExperimentDefinition, ExperimentStep, ExperimentLog, SlavkoCouncilResponse } from "@/lib/types/experiment"
import { SlavkoKernel, type KernelInput } from "@/lib/slavko-kernel-v12/kernel"

type StepExecutionContext = {
  prevOutput: any
  logs: ExperimentLog[]
  scenario?: string
  startTime: number
}

type StepHandler = (step: ExperimentStep, ctx: StepExecutionContext) => Promise<any>

const SLAVKO_BASE_URL = process.env.SLAVKO_BASE_URL || "http://localhost:8000"

async function runSlavkoPipeline(step: ExperimentStep, input: any): Promise<SlavkoCouncilResponse> {
  const cfg = step.config as {
    pipelineName?: string
    endpoint?: string
    authTokenEnvKey?: string
  }

  const pipeline = cfg.pipelineName ?? "slavko-demo"
  const endpoint = cfg.endpoint ?? `${SLAVKO_BASE_URL}/v1/council/run`
  const tokenEnvKey = cfg.authTokenEnvKey ?? "SLAVKO_API_TOKEN"
  const token = process.env[tokenEnvKey]

  const body = {
    pipeline,
    inputs: {
      prompt: typeof input === "string" ? input : JSON.stringify(input),
    },
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SlavkoKernel v7 error: ${res.status} ${res.statusText} - ${text}`)
  }

  const json = await res.json()

  return {
    output: json.output ?? json.summary ?? "",
    summary: json.summary,
    council: json.council,
    audit: json.audit,
    raw: json,
  }
}

const stepHandlers: Record<string, StepHandler> = {
  input: async (step, ctx) => {
    return ctx.prevOutput ?? null
  },

  transform: async (step, ctx) => {
    const { mapping, filters } = step.config
    const input = ctx.prevOutput

    let output: any = input
    if (mapping) {
      output = {}
      Object.entries(mapping).forEach(([from, to]: [string, any]) => {
        output[to] = input?.[from]
      })
    }

    if (filters) {
      Object.entries(filters).forEach(([key, condition]: [string, any]) => {
        if (condition.min && output[key] < condition.min) output[key] = condition.min
        if (condition.max && output[key] > condition.max) output[key] = condition.max
      })
    }

    return output
  },

  ai_decision: async (step, ctx) => {
    const { promptTemplate, agentType = "core-ai", threshold } = step.config
    const input = ctx.prevOutput

    const riskScore = input?.riskScore ?? 0.5
    const decision = riskScore > (threshold ?? 0.7) ? "REVIEW" : "APPROVE"

    return {
      decision,
      confidence: Math.abs(0.5 - riskScore) + 0.5,
      reason: `Risk score ${riskScore.toFixed(2)} vs threshold ${threshold ?? 0.7}`,
      agentType,
    }
  },

  compliance_check: async (step, ctx) => {
    const input = ctx.prevOutput
    const { sensitiveFields = ["email", "userId"] } = step.config

    const hasPersonalData = sensitiveFields.some((field: string) => Boolean(input?.[field]))

    return {
      compliant: !hasPersonalData,
      issues: hasPersonalData
        ? [`Contains sensitive fields: ${sensitiveFields.filter((f: string) => input?.[f]).join(", ")}`]
        : [],
      checked_fields: sensitiveFields,
    }
  },

  metrics: async (step, ctx) => {
    const input = ctx.prevOutput
    return {
      ...input,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - ctx.startTime,
    }
  },

  webhook: async (step, ctx) => {
    const { url, method = "POST" } = step.config
    const input = ctx.prevOutput

    if (!url) throw new Error("Webhook URL not configured")

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      return {
        status: response.status,
        success: response.ok,
        data: await response.json(),
      }
    } catch (err: any) {
      throw new Error(`Webhook failed: ${err.message}`)
    }
  },

  data_mapping: async (step, ctx) => {
    const { mappings } = step.config
    const input = ctx.prevOutput

    const output: any = {}
    Object.entries(mappings ?? {}).forEach(([target, source]: [string, any]) => {
      output[target] = source.split(".").reduce((obj: any, key: string) => obj?.[key], input)
    })

    return output
  },

  slavko_pipeline: async (step, ctx) => {
    return await runSlavkoPipeline(step, ctx.prevOutput)
  },

  kernel_v12: async (step, ctx) => {
    const config = step.config as { persona?: KernelInput["persona"] }
    const persona = config.persona ?? "default"

    const input: KernelInput =
      typeof ctx.prevOutput === "string"
        ? { prompt: ctx.prevOutput, persona }
        : { prompt: JSON.stringify(ctx.prevOutput), persona, context: ctx.prevOutput }

    const result = await SlavkoKernel.execute(input)
    return result
  },
}

export async function runExperiment(params: {
  experiment: ExperimentDefinition
  input: any
  scenario?: string
}) {
  const { experiment, input, scenario } = params
  const startTime = Date.now()

  const ctx: StepExecutionContext = {
    prevOutput: input,
    logs: [],
    scenario,
    startTime,
  }

  for (const step of experiment.steps) {
    const handler = stepHandlers[step.type]
    const stepStartTime = Date.now()

    if (!handler) {
      ctx.logs.push({
        stepId: step.id,
        stepName: step.name,
        type: step.type,
        status: "skipped",
        data: { reason: `No handler for type=${step.type}` },
        duration_ms: Date.now() - stepStartTime,
        ts: new Date().toISOString(),
      })
      continue
    }

    let output
    try {
      output = await handler(step, ctx)
      ctx.logs.push({
        stepId: step.id,
        stepName: step.name,
        type: step.type,
        status: "success",
        data: output,
        duration_ms: Date.now() - stepStartTime,
        ts: new Date().toISOString(),
      })
      ctx.prevOutput = output
    } catch (err: any) {
      ctx.logs.push({
        stepId: step.id,
        stepName: step.name,
        type: step.type,
        status: "error",
        error: err?.message ?? "Unknown error",
        duration_ms: Date.now() - stepStartTime,
        ts: new Date().toISOString(),
      })
      break
    }
  }

  return {
    experimentId: experiment.id,
    finalOutput: ctx.prevOutput,
    logs: ctx.logs,
    duration_ms: Date.now() - startTime,
  }
}
