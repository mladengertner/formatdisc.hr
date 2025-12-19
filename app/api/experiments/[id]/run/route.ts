import { type NextRequest, NextResponse } from "next/server"
import { runExperiment } from "@/lib/experiment-runner"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const body = await req.json()
    const { input, scenario } = body

    const { data: experiment, error } = await supabase
      .from("experiments")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
    }

    const result = await runExperiment({
      experiment: JSON.parse(experiment.definition || "{}"),
      input,
      scenario,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[v0] Experiment run error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
