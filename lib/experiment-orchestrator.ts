import type {
  ExperimentDefinition,
  ExperimentStep,
  StepExecutionContext,
  StepLog,
  ExperimentRunResult,
} from "./types/experiment-full"

type StepHandler = (step: ExperimentStep, ctx: StepExecutionContext) => Promise<any>

const stepHandlers: Record<string, StepHandler> = {
  input: async (step, ctx) => {
    return ctx.prevOutput ?? step.config.defaultValue ?? null
  },

  transform: async (step, ctx) => {
    const { mapping, filters } = step.config
    const input = ctx.prevOutput
    const output: any = {}

    if (mapping) {
      Object.entries(mapping).forEach(([from, to]) => {
        output[to as string] = input?.[from as string]
      })
    }

    if (filters) {
      return Object.entries(output).reduce((acc, [k, v]) => {
        if (filters[k] !== false) acc[k] = v
        return acc
      }, {} as any)
    }

    return output
  },

  ai_decision: async (step, ctx) => {
    const { promptTemplate } = step.config
    const input = ctx.prevOutput

    // MVP: deterministic simulation
    const riskScore = input?.riskScore ?? 0.5
    const decision = riskScore > 0.7 ? "REVIEW" : "APPROVE"

    return {
      decision,
      confidence: 0.95,
      reason: `Risk score: ${riskScore}`,
      timestamp: new Date().toISOString(),
    }
  },

  compliance_check: async (step, ctx) => {
    const input = ctx.prevOutput
    const hasPersonalData = Boolean(input?.email || input?.userId)

    return {
      compliant: !hasPersonalData,
      issues: hasPersonalData ? ["Contains personal data"] : [],
      checkedAt: new Date().toISOString(),
    }
  },

  metrics: async (step, ctx) => {
    return {
      ...ctx.prevOutput,
      timestamp: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    }
  },

  webhook: async (step, ctx) => {
    const { url, method } = step.config
    // MVP: simulate webhook
    return {
      webhookStatus: "sent",
      url,
      method,
      sentAt: new Date().toISOString(),
    }
  },

  data_mapping: async (step, ctx) => {
    const { mappings } = step.config
    const result: any = {}

    Object.entries(mappings ?? {}).forEach(([target, source]: [string, any]) => {
      result[target] = ctx.prevOutput?.[source]
    })

    return result
  },
}

export async function runExperiment(params: {
  experiment: ExperimentDefinition
  input: any
  scenario?: string
}): Promise<ExperimentRunResult> {
  const { experiment, input, scenario } = params
  const startTime = Date.now()

  const ctx: StepExecutionContext = {
    prevOutput: input,
    logs: [],
    scenario,
    metadata: { experimentId: experiment.id },
  }

  for (const step of experiment.steps) {
    const stepStartTime = Date.now()
    const handler = stepHandlers[step.type]

    if (!handler) {
      const log: StepLog = {
        stepId: step.id,
        stepName: step.name,
        status: "skipped",
        data: { reason: `No handler for type: ${step.type}` },
        duration: Date.now() - stepStartTime,
        ts: new Date().toISOString(),
      }
      ctx.logs.push(log)
      continue
    }

    let output
    try {
      output = await handler(step, ctx)

      const log: StepLog = {
        stepId: step.id,
        stepName: step.name,
        status: "success",
        data: output,
        duration: Date.now() - stepStartTime,
        ts: new Date().toISOString(),
      }
      ctx.logs.push(log)
      ctx.prevOutput = output
    } catch (err: any) {
      const log: StepLog = {
        stepId: step.id,
        stepName: step.name,
        status: "error",
        error: err?.message ?? "Unknown error",
        duration: Date.now() - stepStartTime,
        ts: new Date().toISOString(),
      }
      ctx.logs.push(log)
      break
    }
  }

  const totalDuration = Date.now() - startTime
  const success = ctx.logs.every((log) => log.status !== "error")

  return {
    experimentId: experiment.id,
    finalOutput: ctx.prevOutput,
    logs: ctx.logs,
    totalDuration,
    success,
  }
}

export { stepHandlers }
