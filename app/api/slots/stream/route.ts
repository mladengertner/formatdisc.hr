import type { NextRequest } from "next/server"
import { getSlotState } from "@/lib/slotLedger"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const activeConnections = new Set<ReadableStreamDefaultController>()

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      activeConnections.add(controller)

      const sendSlotUpdate = async () => {
        try {
          const slotState = await getSlotState()
          const data = `data: ${JSON.stringify(slotState)}\n\n`
          controller.enqueue(encoder.encode(data))
        } catch (error) {
          console.error("[SSE] Error fetching slot state:", error)
          const errorData = `event: error\ndata: ${JSON.stringify({ error: "Failed to fetch slot state" })}\n\n`
          controller.enqueue(encoder.encode(errorData))
        }
      }

      // Send initial state
      await sendSlotUpdate()

      // Send updates every 10 seconds
      const interval = setInterval(sendSlotUpdate, 10000)

      req.signal.addEventListener("abort", () => {
        clearInterval(interval)
        activeConnections.delete(controller)
        try {
          controller.close()
        } catch {
          // Controller already closed
        }
        console.log(`[SSE] Connection closed. Active connections: ${activeConnections.size}`)
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

export function broadcastSlotUpdate(slotState: any) {
  const encoder = new TextEncoder()
  const data = `data: ${JSON.stringify(slotState)}\n\n`
  const encoded = encoder.encode(data)

  activeConnections.forEach((controller) => {
    try {
      controller.enqueue(encoded)
    } catch (error) {
      console.error("[SSE] Failed to send update to client:", error)
      activeConnections.delete(controller)
    }
  })
}
