import { type NextRequest, NextResponse } from "next/server"
import { SlavkoKernel, type KernelInput } from "@/lib/slavko-kernel-v12"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const input: KernelInput = {
      prompt: body.prompt,
      context: body.context,
      persona: body.persona,
    }

    if (!input.prompt || typeof input.prompt !== "string") {
      return NextResponse.json({ success: false, error: "Prompt je obavezan" }, { status: 400 })
    }

    const result = await SlavkoKernel.execute(input, {
      model: body.config?.model,
      enableAuditTrace: body.config?.enableAuditTrace,
    })

    return NextResponse.json({
      success: !result.fallbackUsed,
      output: result.text,
      route: result.route,
      metrics: result.metrics,
      rationale: result.rationale,
      version: "12.0.0-rc",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Neočekivana greška",
      },
      { status: 500 },
    )
  }
}
