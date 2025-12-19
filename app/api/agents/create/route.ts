import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

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

    const { name, type, config } = await request.json()

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        user_id: user.id,
        name,
        type,
        config: config || {},
        status: "idle",
      })
      .select()
      .single()

    if (error) throw error

    // Log audit event
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "agent_created",
      resource_type: "agent",
      resource_id: agent.id,
      metadata: { name, type },
    })

    return NextResponse.json({ agent })
  } catch (error) {
    console.error("[v0] Agent creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
