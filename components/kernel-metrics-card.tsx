"use client"

import { useEffect, useState } from "react"
import { Activity, Zap, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

interface KernelMetrics {
  latencyMs: number
  errorRate: number
  throughput: number
  route: string
  fallbackUsed: boolean
  status: "healthy" | "unhealthy"
}

export function KernelMetricsCard() {
  const [metrics, setMetrics] = useState<KernelMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/kernel/metrics")
        const data = await res.json()
        setMetrics(data)
      } catch (error) {
        console.error("[KernelMetricsCard] Error fetching metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000) // Refresh every 10s

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-8 bg-muted rounded w-3/4" />
        </div>
      </Card>
    )
  }

  if (!metrics) return null

  const isHealthy = metrics.status === "healthy" && metrics.latencyMs < 900 && !metrics.fallbackUsed

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" aria-hidden="true" />
            SlavkoKernel v12
          </h3>
          <p className="text-sm text-muted-foreground">Real-time AI orchestration metrics</p>
        </div>
        {isHealthy ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" aria-label="Healthy" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-500" aria-label="Degraded" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" aria-hidden="true" />
            <span>P95 Latency</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.latencyMs}ms</div>
          <div className="text-xs text-muted-foreground">{metrics.latencyMs < 900 ? "Within SLA" : "Above target"}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
            <span>Error Rate</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{(metrics.errorRate * 100).toFixed(2)}%</div>
          <div className="text-xs text-muted-foreground">{metrics.errorRate < 0.005 ? "Excellent" : "Degraded"}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="w-3 h-3" aria-hidden="true" />
            <span>Route</span>
          </div>
          <div className="text-2xl font-bold text-foreground capitalize">{metrics.route}</div>
          <div className="text-xs text-muted-foreground">{metrics.fallbackUsed ? "Fallback active" : "Nominal"}</div>
        </div>
      </div>
    </Card>
  )
}
