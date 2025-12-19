"use client"

import type { ExperimentRun } from "@/lib/types/experiment"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface Props {
  currentRun: ExperimentRun | null
  runs: ExperimentRun[]
  onSelectRun: (run: ExperimentRun) => void
}

export function RunHistoryPanel({ currentRun, runs, onSelectRun }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Run History</h3>

      {runs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No runs yet. Execute the experiment to see history.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {runs.map((run) => (
            <Card
              key={run.id}
              onClick={() => onSelectRun(run)}
              className={`p-3 cursor-pointer transition-colors ${
                currentRun?.id === run.id ? "bg-primary/20 border-primary" : "hover:bg-accent"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium capitalize">{run.scenario || "Custom"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                  </p>
                </div>
                <span className="text-xs font-mono">{run.duration_ms}ms</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
