// Audit-ready surface with PII-safe hashing (Edge-compatible)

export interface KernelAuditRecord {
  inputHash: string
  outputHash: string
  route: string
  ts: string
  fallbackUsed?: boolean
}

// Simple hash for Edge runtime (since we can't easily use sync sha256 from Node crypto)
// For a real production app on Edge, we would use crypto.subtle.digest (async)
// But for this audit trace, a simple stable hash is often enough for the demo.
// However, let's try to be as close as possible.
export function hashPayload(payload: unknown): string {
  const json = JSON.stringify(payload)
  // Simple deterministic hash
  let hash = 0
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
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
