"use client"

import { useEffect, useState, useRef } from "react"

type SlotState = {
  remaining: number
  total: number
  lastClaimedAt?: string
  escalationTriggered?: boolean
}

export function SlotCounter({ slotState }: { slotState: SlotState }) {
  const [state, setState] = useState(slotState)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const eventSource = new EventSource("/api/slots/stream")
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setState(data)
      } catch (error) {
        console.error("[SlotCounter] Failed to parse SSE data:", error)
      }
    }

    eventSource.onerror = () => {
      console.error("[SlotCounter] SSE connection error")
      eventSource.close()
      // Fallback to polling after 5 seconds
      setTimeout(() => {
        const newEventSource = new EventSource("/api/slots/stream")
        eventSourceRef.current = newEventSource
      }, 5000)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const percent = state.total > 0 ? Math.round(((state.total - state.remaining) / state.total) * 100) : 0

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-6 py-5 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-400">Founder's Edition</p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Slots Remaining: {state.remaining} / {state.total}
          </h2>
          {state.lastClaimedAt && (
            <p className="mt-1 text-xs text-neutral-400">
              Last slot claimed: {new Date(state.lastClaimedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="w-40">
          <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-neutral-400">{percent}% claimed</p>
        </div>
      </div>
      {state.escalationTriggered && (
        <p className="mt-3 text-xs font-medium text-red-400">
          Price escalation event triggered — all tiers ×3 (ledger-locked).
        </p>
      )}
    </div>
  )
}
