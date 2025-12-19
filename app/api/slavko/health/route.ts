import { NextResponse } from "next/server"
import { SlavkoKernel, KERNEL_VERSION } from "@/lib/slavko-kernel-v12"

export async function GET() {
  const isHealthy = await SlavkoKernel.healthCheck()

  return NextResponse.json({
    status: isHealthy ? "online" : "offline",
    version: KERNEL_VERSION,
    timestamp: new Date().toISOString(),
  })
}
