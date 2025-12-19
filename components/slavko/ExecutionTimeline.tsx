"use client"

import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface ExecutionTimelineProps {
  isRunning: boolean
  result: any | null
}

export function ExecutionTimeline({ isRunning, result }: ExecutionTimelineProps) {
  const steps = [
    { name: "Unos", icon: "📝" },
    { name: "SlavkoKernel", icon: "🔧" },
    { name: "Ollama", icon: "⚙️" },
    { name: "Odgovor", icon: "✨" },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Pipeline Izvršavanja</h3>
      <div className="flex gap-2 items-center">
        {steps.map((step, idx) => (
          <div key={step.name} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                isRunning && idx < 3
                  ? "border-primary bg-primary/10 animate-pulse"
                  : result?.success && idx < 4
                    ? "border-primary bg-primary/10"
                    : result?.error && idx < 4
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-card"
              }`}
            >
              {isRunning && idx === 2 ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : result?.success && idx < 4 ? (
                <CheckCircle className="w-4 h-4 text-primary" />
              ) : result?.error && idx < 4 ? (
                <AlertCircle className="w-4 h-4 text-destructive" />
              ) : (
                <span className="text-lg">{step.icon}</span>
              )}
            </div>
            {idx < steps.length - 1 && <div className="w-6 h-0.5 bg-border" />}
          </div>
        ))}
      </div>
      {result && <div className="text-xs text-muted-foreground">Trajanje: {result.metadata?.duration ?? 0}ms</div>}
    </div>
  )
}
