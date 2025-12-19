import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Fetch user profile with XP
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return NextResponse.json({ user, profile })
  } catch (error) {
    console.error("[v0] User error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
