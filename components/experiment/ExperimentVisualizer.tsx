"use client"

import { useEffect, useState } from "react"
import type { ExperimentDefinition, ExperimentLog } from "@/lib/types/experiment"
import { motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Clock, Zap, Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface Props {
  experiment: ExperimentDefinition
  logs: ExperimentLog[]
}

export function ExperimentVisualizer({ experiment, logs }: Props) {
  const [activeSteps, setActiveSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    const running = logs.filter((l) => l.status === "running" || l.status === "idle").map((l) => l.stepId)
    setActiveSteps(new Set(running))
  }, [logs])

  const lastLogByStep = new Map<string, ExperimentLog>()
  for (const log of logs) {
    lastLogByStep.set(log.stepId, log)
  }

  return (
    <div className="h-full bg-background rounded-lg border border-border p-6 overflow-auto">
      <h3 className="text-lg font-semibold mb-6">Experiment Flow</h3>

      <TooltipProvider>
        <div className="relative">
          {experiment.steps.map((step, idx) => {
            const log = logs.find((l) => l.stepId === step.id)
            const isActive = activeSteps.has(step.id)
            const isSlavkoCouncil = step.type === "slavko_pipeline"
            const councilData = isSlavkoCouncil && log?.data?.council

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="mb-6"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                        isActive
                          ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,255,153,0.35)] animate-pulse"
                          : log?.status === "success"
                            ? "border-green-500/50 bg-green-500/5"
                            : log?.status === "error"
                              ? "border-red-500/50 bg-red-500/5"
                              : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {isActive && <Zap className="h-5 w-5 text-primary animate-pulse" />}
                          {log?.status === "success" && isSlavkoCouncil && <Users className="h-5 w-5 text-green-500" />}
                          {log?.status === "success" && !isSlavkoCouncil && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {log?.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                          {!log && <Clock className="h-5 w-5 text-muted-foreground" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{step.name}</h4>
                            {isSlavkoCouncil && (
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                                Council
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{step.type}</p>
                          {log && (
                            <div className="mt-2 text-xs space-y-1">
                              {log.duration_ms && <span>⏱ {log.duration_ms}ms</span>}
                              {councilData && (
                                <div className="mt-2 p-2 bg-background/50 rounded border border-primary/20">
                                  <p className="font-medium text-primary">
                                    Decision: {councilData.decision.toUpperCase()}
                                  </p>
                                  <p className="text-muted-foreground">
                                    Quorum: {councilData.quorum} | Threshold: {councilData.threshold}
                                  </p>
                                </div>
                              )}
                              {log.error && <p className="text-red-500 mt-1">{log.error}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">{step.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">Type: {step.type}</p>
                      {isSlavkoCouncil && councilData && (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs font-medium">Council Votes:</p>
                          {councilData.votes?.map((vote: any, i: number) => (
                            <div key={i} className="text-xs bg-background p-2 rounded border">
                              <p className="font-medium">{vote.agent}</p>
                              <p>
                                Vote: {vote.vote} | Confidence: {(vote.confidence * 100).toFixed(0)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {log?.data && (
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1">Last Output:</p>
                          <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-40">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      {!log && <p className="text-xs text-muted-foreground">No execution data yet</p>}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {idx < experiment.steps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <motion.div
                      className={`h-4 w-px ${isActive ? "bg-primary" : "bg-border"}`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: idx * 0.1 + 0.05, duration: 0.2 }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </TooltipProvider>

      {logs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 border-t border-border pt-4"
        >
          <h4 className="text-sm font-semibold mb-2">Final Output</h4>
          <div className="bg-card border border-border rounded-lg p-4 overflow-auto max-h-60">
            <pre className="text-xs font-mono">{JSON.stringify(logs[logs.length - 1]?.data ?? {}, null, 2)}</pre>
          </div>
        </motion.div>
      )}
    </div>
  )
}
