import { createClient } from "@/lib/supabase/server"

export type AuditEventCategory = "auth" | "subscription" | "agent" | "system" | "security" | "billing" | "business"

export type AuditEventData = {
  userId: string
  eventType: string
  eventCategory: AuditEventCategory
  eventData: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function logAuditEvent(data: AuditEventData): Promise<string | null> {
  try {
    const supabase = await createClient()

    const { data: result, error } = await supabase.rpc("log_audit_event", {
      p_user_id: data.userId,
      p_event_type: data.eventType,
      p_event_category: data.eventCategory,
      p_event_data: data.eventData,
      p_ip_address: data.ipAddress || null,
      p_user_agent: data.userAgent || null,
    })

    if (error) {
      console.error("[Audit] Failed to log event:", error)
      return null
    }

    console.log(`[Audit] ${data.eventType} logged for user ${data.userId}`)
    return result as string
  } catch (error) {
    console.error("[Audit] Exception logging event:", error)
    return null
  }
}

export async function getAuditEvents(userId: string, limit = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[Audit] Failed to fetch events:", error)
    return []
  }

  return data || []
}
