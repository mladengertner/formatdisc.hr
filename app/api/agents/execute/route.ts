import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { executeAgent } from "@/lib/orchestrator"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { agent_id, prompt, config } = await request.json()

    if (!agent_id || !prompt) {
      return NextResponse.json({ error: "Agent ID and prompt are required" }, { status: 400 })
    }

    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc("check_ai_rate_limit", {
      p_user_id: user.id,
    })

    if (rateLimitError || !rateLimitOk) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please upgrade your plan for higher limits." },
        { status: 429 },
      )
    }

    // Fetch agent
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agent_id)
      .eq("user_id", user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Update agent status
    await supabase.from("agents").update({ status: "running" }).eq("id", agent_id)

    const startTime = Date.now()

    // Execute agent
    const result = await executeAgent(agent.type, prompt, config)

    const latency = Date.now() - startTime

    const { data: executionId, error: recordError } = await supabase.rpc("record_ai_execution", {
      p_agent_id: agent_id,
      p_user_id: user.id,
      p_prompt: prompt,
      p_response: result.output,
      p_status: result.success ? "completed" : "failed",
      p_error: result.error || null,
      p_latency: latency,
    })

    if (recordError) {
      console.error("[v0] Failed to record execution:", recordError)
    }

    // Update agent status
    await supabase
      .from("agents")
      .update({
        status: "idle",
        last_executed_at: new Date().toISOString(),
      })
      .eq("id", agent_id)

    return NextResponse.json({
      executionId,
      result: result.output,
      latency,
      success: result.success,
    })
  } catch (error) {
    console.error("[v0] Agent execution error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
