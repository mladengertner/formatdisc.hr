"use client"

import { useState } from "react"
import type { ExperimentDefinition } from "@/lib/types/experiment"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const PRESETS = [
  { id: "happy", label: "Happy Path", input: { riskScore: 0.2, email: null } },
  { id: "high-risk", label: "High Risk", input: { riskScore: 0.9, email: "user@example.com" } },
  { id: "gdpr", label: "GDPR Sensitive", input: { riskScore: 0.5, email: "person@eu.com" } },
]

interface Props {
  experiment: ExperimentDefinition
  onRun: (input: any, scenario?: string) => void
  isRunning: boolean
}

export function InputSimulatorPanel({ experiment, onRun, isRunning }: Props) {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0])
  const [riskScore, setRiskScore] = useState(selectedPreset.input.riskScore)
  const [includeEmail, setIncludeEmail] = useState(Boolean(selectedPreset.input.email))

  function buildInput() {
    return {
      riskScore,
      email: includeEmail ? "user@example.com" : null,
    }
  }

  function handleRun() {
    onRun(buildInput(), selectedPreset.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Input Simulator</h2>
        <p className="text-sm text-muted-foreground">Configure inputs and run the experiment.</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Scenario Presets</p>
        <div className="flex gap-2">
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedPreset(preset)
                setRiskScore(preset.input.riskScore)
                setIncludeEmail(Boolean(preset.input.email))
              }}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                selectedPreset.id === preset.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
              }`}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Risk slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Risk Score</span>
          <span className="text-muted-foreground font-mono">{riskScore.toFixed(2)}</span>
        </div>
        <Slider
          value={[riskScore]}
          onValueChange={(val) => setRiskScore(val[0])}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* Email toggle */}
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={includeEmail}
          onChange={(e) => setIncludeEmail(e.target.checked)}
          className="rounded"
        />
        <span>Include personal email (GDPR-sensitive)</span>
      </label>

      {/* Live JSON preview */}
      <div className="text-xs bg-card border border-border rounded-md p-3 font-mono overflow-x-auto max-h-40 overflow-y-auto">
        <div className="text-muted-foreground mb-2">// Input payload preview</div>
        <pre className="text-xs">{JSON.stringify(buildInput(), null, 2)}</pre>
      </div>

      {/* Run button */}
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button onClick={handleRun} disabled={isRunning} className="w-full" size="lg">
          {isRunning ? "Running…" : "Run Simulation"}
        </Button>
      </motion.div>
    </div>
  )
}
