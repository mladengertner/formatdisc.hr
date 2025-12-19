// Audit-ready surface with PII-safe hashing
import crypto from "crypto"

export interface KernelAuditRecord {
  inputHash: string
  outputHash: string
  route: string
  ts: string
  fallbackUsed?: boolean
}

export function hashPayload(payload: unknown): string {
  const json = JSON.stringify(payload)
  return crypto.createHash("sha256").update(json).digest("hex")
}

export function createAuditRecord(
  input: { prompt: string; context?: Record<string, unknown> },
  output: { text: string; route: string },
  fallbackUsed?: boolean,
): KernelAuditRecord {
  return {
    inputHash: hashPayload({ prompt: input.prompt, context: input.context }),
    outputHash: hashPayload({ text: output.text, route: output.route }),
    route: output.route,
    ts: new Date().toISOString(),
    ...(fallbackUsed ? { fallbackUsed: true } : {}),
  }
}
