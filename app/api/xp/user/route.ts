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

    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, level, badges")
      .eq("id", user.id)
      .single()

    const { data: events } = await supabase
      .from("xp_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    return NextResponse.json({
      xp: profile?.total_xp || 0,
      level: profile?.level || 1,
      badges: profile?.badges || [],
      recent_events: events || [],
    })
  } catch (error) {
    console.error("[v0] User XP fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
