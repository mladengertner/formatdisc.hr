"use client"

import { useEffect, useState } from "react"
import type { ExperimentDefinition, ExperimentRun } from "@/lib/types/experiment"
import { ExperimentVisualizer } from "@/components/experiment/ExperimentVisualizer"
import { InputSimulatorPanel } from "@/components/experiment/InputSimulatorPanel"
import { RunHistoryPanel } from "@/components/experiment/RunHistoryPanel"
import { useToast } from "@/hooks/use-toast"

export default function ExperimentPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [experiment, setExperiment] = useState<ExperimentDefinition | null>(null)
  const [runs, setRuns] = useState<ExperimentRun[]>([])
  const [currentRun, setCurrentRun] = useState<ExperimentRun | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchExperiment()
  }, [id])

  async function fetchExperiment() {
    try {
      const res = await fetch(`/api/experiments/${id}`)
      if (!res.ok) throw new Error("Failed to fetch experiment")
      const data = await res.json()
      setExperiment(data.experiment)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleRunSimulation(input: any, scenario?: string) {
    if (!experiment) return
    setIsRunning(true)

    try {
      const res = await fetch(`/api/experiments/${id}/run`, {
        method: "POST",
        body: JSON.stringify({ input, scenario }),
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) throw new Error("Run failed")
      const data = await res.json()

      const newRun: ExperimentRun = {
        id: `run-${Date.now()}`,
        experiment_id: id,
        input,
        scenario,
        finalOutput: data.finalOutput,
        logs: data.logs,
        duration_ms: data.duration_ms,
        created_at: new Date().toISOString(),
      }

      setCurrentRun(newRun)
      setRuns([newRun, ...runs.slice(0, 9)])
      toast({ title: "Success", description: "Experiment executed successfully" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsRunning(false)
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading experiment…</div>
  if (!experiment) return <div className="p-8 text-destructive">Experiment not found</div>

  return (
    <div className="h-screen flex bg-background">
      {/* Left: Input Simulator */}
      <div className="w-80 border-r border-border p-6 overflow-y-auto">
        <InputSimulatorPanel experiment={experiment} onRun={handleRunSimulation} isRunning={isRunning} />
      </div>

      {/* Center: Visualizer */}
      <div className="flex-1 border-r border-border p-6 overflow-hidden">
        <ExperimentVisualizer experiment={experiment} logs={currentRun?.logs || []} />
      </div>

      {/* Right: Run History */}
      <div className="w-80 p-6 overflow-y-auto">
        <RunHistoryPanel currentRun={currentRun} runs={runs} onSelectRun={setCurrentRun} />
      </div>
    </div>
  )
}
