"use client"

import { useEffect, useState } from "react"

export function KernelHealthCard() {
  const [status, setStatus] = useState<"online" | "offline">("offline")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/slavko/health")
        const data = await response.json()
        setStatus(data.status === "online" ? "online" : "offline")
      } catch (error) {
        setStatus("offline")
      }
      setLastChecked(new Date())
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-3 bg-card border border-border rounded-md space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${status === "online" ? "bg-primary animate-pulse" : "bg-destructive"}`}
        />
        <span className="text-sm font-semibold">SlavkoKernel {status === "online" ? "Online" : "Offline"}</span>
      </div>
      {lastChecked && (
        <p className="text-xs text-muted-foreground">Provjera: {lastChecked.toLocaleTimeString("hr-HR")}</p>
      )}
    </div>
  )
}
