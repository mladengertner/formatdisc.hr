import { kv } from "@vercel/kv"

const AUDIT_EVENTS_KEY = "audit:events"
const MAX_EVENTS = 1000

export type AuditEvent = {
  event: string
  actor?: string
  path: string
  method: string
  timestamp: string
  meta?: Record<string, any>
}

export async function logAudit(event: AuditEvent): Promise<void> {
  try {
    await kv.lpush(AUDIT_EVENTS_KEY, event)

    // Trim to max events to prevent unbounded growth
    const count = await kv.llen(AUDIT_EVENTS_KEY)
    if (count > MAX_EVENTS) {
      await kv.ltrim(AUDIT_EVENTS_KEY, 0, MAX_EVENTS - 1)
    }

    console.log("[auditLogger]", event.event, event.meta)
  } catch (error) {
    console.error("[auditLogger] Failed to log audit event:", error)
  }
}

export async function getAuditEvents(limit = 50): Promise<AuditEvent[]> {
  try {
    const events = await kv.lrange<AuditEvent>(AUDIT_EVENTS_KEY, 0, limit - 1)
    return events || []
  } catch (error) {
    console.error("[auditLogger] Failed to get audit events:", error)
    return []
  }
}
