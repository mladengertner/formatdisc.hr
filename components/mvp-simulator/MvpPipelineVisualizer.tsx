"use client"

import { motion } from "framer-motion"
import type { Phase } from "@/lib/types/mvp-simulator"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

interface Props {
  phases: Phase[] | null
  isRunning: boolean
}

const DEFAULT_PHASES: Phase[] = [
  {
    id: 1,
    name: "Phase 1",
    label: "Client Input / Klijent Zahtjev",
    status: "pending",
    metrics: { durationHours: 2, successRate: 100, notes: "Requirements captured" },
  },
  {
    id: 2,
    name: "Phase 2",
    label: "MVP Simulation / MVP Simulacija",
    status: "pending",
    metrics: { durationHours: 8, successRate: 99.7, notes: "Zagreb sandbox" },
  },
  {
    id: 3,
    name: "Phase 3",
    label: "SlavkoKernel Orchestration / Orkestracija",
    status: "pending",
    metrics: { durationHours: 8, successRate: 98, notes: "Model loading & resource mgmt" },
  },
  {
    id: 4,
    name: "Phase 4",
    label: "Compliance Gate / Sigurnost",
    status: "pending",
    metrics: { durationHours: 6, successRate: 98, notes: "GDPR/SOC2 checks" },
  },
  {
    id: 5,
    name: "Phase 5",
    label: "Production / Produkcija",
    status: "pending",
    metrics: { durationHours: 24, successRate: 100, notes: "Zero-downtime deploy" },
  },
]

export function MvpPipelineVisualizer({ phases, isRunning }: Props) {
  const data = phases ?? DEFAULT_PHASES

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Governance Pipeline</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
            Real-time Deployment Simulation
          </p>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            LIVE SIGNAL
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 relative">
        {/* Connection Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-primary/10 to-transparent" />

        {data.map((phase, index) => {
          const isSuccess = phase.status === "success"
          const isRunningPhase = phase.status === "running"

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12"
            >
              {/* Status Indicator */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                {isSuccess ? (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,255,153,0.5)]">
                    <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                ) : isRunningPhase ? (
                  <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-background border border-primary/20 flex items-center justify-center">
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className={cn(
                "p-4 rounded-2xl border transition-all duration-500",
                isSuccess ? "bg-primary/5 border-primary/30" :
                  isRunningPhase ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(0,255,153,0.15)] scale-[1.02]" :
                    "bg-background/20 border-white/5 opacity-50"
              )}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-mono text-primary/70 uppercase tracking-tighter mb-0.5">{phase.name}</div>
                    <div className="text-sm font-bold">{phase.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-muted-foreground">ETA: {phase.metrics.durationHours}h</div>
                    <div className="text-xs font-bold text-primary">{phase.metrics.successRate}% REL.</div>
                  </div>
                </div>

                {isRunningPhase && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-3 h-0.5 bg-primary origin-left rounded-full"
                  />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
