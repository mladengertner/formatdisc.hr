"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Zap } from "lucide-react"
import { useAuditLog } from "@/hooks/use-audit-log"

interface AgentNode {
  id: string
  name: string
  status: "pending" | "running" | "completed" | "error"
  progress: number
  duration?: number
}

export function RuntimeSimulator() {
  const [isRunning, setIsRunning] = useState(false)
  const [agents, setAgents] = useState<AgentNode[]>([
    { id: "1", name: "Data Ingestion Agent", status: "pending", progress: 0 },
    { id: "2", name: "Processing Pipeline", status: "pending", progress: 0 },
    { id: "3", name: "Model Inference", status: "pending", progress: 0 },
    { id: "4", name: "Result Aggregation", status: "pending", progress: 0 },
  ])
  const { logEvent } = useAuditLog()

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setAgents((prev) => {
        const updated = [...prev]
        let allCompleted = true

        for (let i = 0; i < updated.length; i++) {
          const agent = updated[i]

          // Start agents sequentially
          const prevAgent = i > 0 ? updated[i - 1] : null
          const canStart = !prevAgent || prevAgent.status === "completed"

          if (agent.status === "pending" && canStart) {
            updated[i] = { ...agent, status: "running", progress: 0 }
            logEvent("agent_started", { agentId: agent.id, agentName: agent.name })
          } else if (agent.status === "running") {
            const newProgress = Math.min(agent.progress + Math.random() * 15, 100)
            updated[i] = { ...agent, progress: newProgress }

            if (newProgress >= 100) {
              updated[i] = { ...agent, status: "completed", progress: 100 }
              logEvent("agent_completed", { agentId: agent.id, agentName: agent.name })
            }
          }

          if (agent.status !== "completed") {
            allCompleted = false
          }
        }

        if (allCompleted) {
          setIsRunning(false)
          logEvent("simulation_completed", {})
        }

        return updated
      })
    }, 300)

    return () => clearInterval(interval)
  }, [isRunning, logEvent])

  const startSimulation = () => {
    setIsRunning(true)
    logEvent("simulation_started", {})
  }

  const pauseSimulation = () => {
    setIsRunning(false)
    logEvent("simulation_paused", {})
  }

  const resetSimulation = () => {
    setAgents((prev) =>
      prev.map((agent) => ({
        ...agent,
        status: "pending",
        progress: 0,
        duration: undefined,
      })),
    )
    setIsRunning(false)
    logEvent("simulation_reset", {})
  }

  const getStatusColor = (status: AgentNode["status"]) => {
    switch (status) {
      case "running":
        return "bg-primary text-primary-foreground"
      case "completed":
        return "bg-chart-3 text-primary-foreground"
      case "error":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Agent Pipeline Simulator
              </CardTitle>
              <CardDescription>Visualize real-time agent execution flow with audit trail</CardDescription>
            </div>
            <div className="flex gap-2">
              {isRunning ? (
                <Button onClick={pauseSimulation} variant="outline" className="gap-2 bg-transparent">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              ) : (
                <Button onClick={startSimulation} className="gap-2">
                  <Play className="w-4 h-4" />
                  Start
                </Button>
              )}
              <Button onClick={resetSimulation} variant="outline" className="gap-2 bg-transparent">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Agent Pipeline Visualization */}
      <div className="grid gap-4">
        {agents.map((agent, index) => (
          <Card key={agent.id} className="relative overflow-hidden">
            {agent.status === "running" && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Agent ID: {agent.id} • Status: {agent.status}
                    </p>
                  </div>
                  <Badge className={getStatusColor(agent.status)}>{agent.status.toUpperCase()}</Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-semibold">{agent.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={agent.progress} className="h-2" />
                </div>

                {/* Connection Line to Next Agent */}
                {index < agents.length - 1 && (
                  <div className="flex justify-center pt-2">
                    <div className={`w-0.5 h-4 ${agent.status === "completed" ? "bg-primary" : "bg-border"}`} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
