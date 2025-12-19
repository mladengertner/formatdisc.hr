import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch recent agent executions for metrics
    const { data: logs } = await supabase
      .from("agent_logs")
      .select("latency, status, created_at")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 3600000).toISOString()) // Last hour
      .order("created_at", { ascending: false })

    const totalExecutions = logs?.length || 0
    const failedExecutions = logs?.filter((l) => l.status === "failed").length || 0
    const avgLatency = logs?.length ? logs.reduce((sum, l) => sum + l.latency, 0) / logs.length : 0

    const metrics = {
      latency: Math.round(avgLatency),
      error_rate: totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0,
      throughput: totalExecutions,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error("[v0] Metrics fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
