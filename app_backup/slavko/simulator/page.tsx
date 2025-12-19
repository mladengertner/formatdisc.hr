"use client"

import { useState } from "react"
import { PresetSelector } from "@/components/slavko/PresetSelector"
import { PromptEditor } from "@/components/slavko/PromptEditor"
import { ConfigPanel } from "@/components/slavko/ConfigPanel"
import { ExecutionTimeline } from "@/components/slavko/ExecutionTimeline"
import { OutputViewer } from "@/components/slavko/OutputViewer"
import { RunHistoryPanel } from "@/components/slavko/RunHistoryPanel"
import { KernelHealthCard } from "@/components/slavko/KernelHealthCard"
import { Button } from "@/components/ui/button"
import type { PromptPreset } from "@/lib/types/slavko"

export default function SlavkoSimulatorPage() {
  const [prompt, setPrompt] = useState("")
  const [config, setConfig] = useState<{ model?: string }>({ model: "llama2" })
  const [isRunning, setIsRunning] = useState(false)
  const [currentResult, setCurrentResult] = useState<any | null>(null)
  const [history, setHistory] = useState<any[]>([])

  async function runExecution() {
    if (!prompt.trim()) return
    setIsRunning(true)

    try {
      const res = await fetch("/api/slavko/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, config }),
      })
      const data = await res.json()
      setCurrentResult(data)
      setHistory((prev) => [
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          prompt,
          config,
          result: data,
        },
        ...prev.slice(0, 19),
      ])
    } finally {
      setIsRunning(false)
    }
  }

  function applyPreset(preset: PromptPreset) {
    setPrompt(preset.prompt)
    setConfig((prev) => ({ ...prev, ...preset.config }))
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left: Input & config */}
      <div className="w-1/3 border-r border-border p-4 space-y-4 overflow-y-auto">
        <h1 className="text-xl font-bold">SlavkoKernel™ Input Simulator</h1>
        <PresetSelector onSelect={applyPreset} />
        <PromptEditor value={prompt} onChange={setPrompt} />
        <ConfigPanel config={config} onChange={setConfig} />
        <Button onClick={runExecution} disabled={isRunning || !prompt.trim()} className="w-full" size="lg">
          {isRunning ? "Izvršavanje…" : "Pokreni sa SlavkoKernel"}
        </Button>
      </div>

      {/* Center: Execution & output */}
      <div className="flex-1 border-r border-border p-4 flex flex-col gap-4">
        <ExecutionTimeline isRunning={isRunning} result={currentResult} />
        <div className="flex-1 min-h-0">
          <OutputViewer result={currentResult} />
        </div>
      </div>

      {/* Right: History & health */}
      <div className="w-1/4 p-4 space-y-4 overflow-y-auto">
        <KernelHealthCard />
        <RunHistoryPanel history={history} onSelect={(item) => setCurrentResult(item.result)} />
      </div>
    </div>
  )
}
