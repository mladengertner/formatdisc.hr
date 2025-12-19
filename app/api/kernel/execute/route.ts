import { type NextRequest, NextResponse } from "next/server"
import { SlavkoKernel, type KernelInput } from "@/lib/slavko-kernel-v12/kernel"
import { createAuditRecord } from "@/lib/slavko-kernel-v12/audit"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const json = (await req.json()) as KernelInput

    if (!json.prompt || typeof json.prompt !== "string") {
      return NextResponse.json({ error: "Invalid payload: 'prompt' is required string" }, { status: 400 })
    }

    const result = await SlavkoKernel.execute(json)

    // Create audit record (PII-safe)
    const auditRecord = createAuditRecord(
      { prompt: json.prompt, context: json.context },
      { text: result.text, route: result.route },
      result.fallbackUsed,
    )

    console.log("[SlavkoKernel v12] Audit:", auditRecord)

    return NextResponse.json(result)
  } catch (error: any) {
    const fallback = {
      text: "I'm currently unavailable, but your request has been safely received and logged for follow-up.",
      route: "fallback",
      metrics: {
        latencyMs: 0,
        errorRate: 1,
        throughput: 0,
      },
      fallbackUsed: true,
    }

    return NextResponse.json({ ...fallback, error: error?.message ?? "Unexpected error" }, { status: 500 })
  }
}
