import { NextResponse } from "next/server"
import { SlavkoKernel } from "@/lib/slavko-kernel-v12/kernel"

export const runtime = "edge"

export async function GET() {
  try {
    // Synthetic probe for live metrics
    const result = await SlavkoKernel.execute({
      prompt: "Synthetic latency probe.",
      persona: "neutral",
    })

    return NextResponse.json({
      latencyMs: result.metrics.latencyMs,
      errorRate: result.metrics.errorRate,
      throughput: result.metrics.throughput,
      route: result.route,
      fallbackUsed: result.fallbackUsed ?? false,
      ts: new Date().toISOString(),
      status: "healthy",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        latencyMs: 0,
        errorRate: 1,
        throughput: 0,
        route: "error",
        fallbackUsed: true,
        ts: new Date().toISOString(),
        status: "unhealthy",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 },
    )
  }
}
