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

    const { event_type, xp_amount, metadata } = await request.json()

    if (!event_type || !xp_amount) {
      return NextResponse.json({ error: "Event type and XP amount are required" }, { status: 400 })
    }

    // Create XP event
    await supabase.from("xp_events").insert({
      user_id: user.id,
      event_type,
      xp_amount,
      metadata: metadata || {},
    })

    // Update user total XP
    const { data: profile } = await supabase.from("profiles").select("total_xp").eq("id", user.id).single()

    const newTotalXp = (profile?.total_xp || 0) + xp_amount

    await supabase.from("profiles").update({ total_xp: newTotalXp }).eq("id", user.id)

    return NextResponse.json({
      success: true,
      new_total_xp: newTotalXp,
    })
  } catch (error) {
    console.error("[v0] XP event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
