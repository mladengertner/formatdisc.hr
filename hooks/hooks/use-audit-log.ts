"use client"

import { useState, useCallback } from "react"

export interface AuditEvent {
  id: string
  type: string
  timestamp: string
  data: Record<string, unknown>
}

// Global store for audit events (persists across component mounts)
let globalEvents: AuditEvent[] = []
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function useAuditLog() {
  const [, forceUpdate] = useState({})

  // Subscribe to global events
  useState(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  })

  const logEvent = useCallback((type: string, data: Record<string, unknown> = {}) => {
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      data,
    }
    globalEvents = [event, ...globalEvents].slice(0, 100) // Keep last 100 events
    notifyListeners()
  }, [])

  const exportEvents = useCallback(() => {
    const blob = new Blob([JSON.stringify(globalEvents, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-log-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const replayEvents = useCallback(() => {
    // Simple replay - log to console
    console.log("[v0] Replaying audit events:", globalEvents)
    globalEvents.forEach((event, index) => {
      setTimeout(() => {
        console.log(`[v0] Event ${index + 1}:`, event.type, event.data)
      }, index * 500)
    })
  }, [])

  const clearEvents = useCallback(() => {
    globalEvents = []
    notifyListeners()
  }, [])

  return {
    events: globalEvents,
    logEvent,
    exportEvents,
    replayEvents,
    clearEvents,
  }
}
