"use client"

import { motion } from "framer-motion"
import type { Phase } from "@/lib/types/mvp-simulator"

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
    label: "Compliance Gate",
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">5-Phase Governance Pipeline</h3>
          <p className="text-xs text-muted-foreground">
            From idea to production in 48 hours. Each phase is fully auditable and documented.
          </p>
        </div>
        {isRunning && (
          <motion.div
            className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          >
            Simulating…
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-3">
        {data.map((phase, index) => {
          const color =
            phase.status === "success"
              ? "border-primary bg-primary/10"
              : phase.status === "running"
                ? "border-primary bg-primary/10"
                : "border-border bg-background"

          return (
            <div key={phase.id} className="relative">
              <motion.div
                className={`rounded-lg border px-4 py-3 ${color}`}
                animate={
                  phase.status === "running"
                    ? { boxShadow: "0 0 20px rgba(0,255,153,0.35)" }
                    : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
                }
                transition={{ duration: 0.3 }}
              >
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{phase.name}</div>
                <div className="text-sm font-medium">{phase.label}</div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Duration: ~{phase.metrics.durationHours}h</span>
                  <span>Success: {phase.metrics.successRate}%</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{phase.metrics.notes}</div>
              </motion.div>

              {index < data.length - 1 && <div className="absolute left-1/2 -translate-x-1/2 w-px h-3 bg-border" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
