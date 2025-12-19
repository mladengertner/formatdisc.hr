import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: leaderboard, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, total_xp, level, badges")
      .order("total_xp", { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("[v0] Leaderboard fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
