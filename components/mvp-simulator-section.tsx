"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, Sparkles } from "lucide-react"
import { IdeaSelector } from "@/components/mvp-simulator/IdeaSelector"
import { MvpPipelineVisualizer } from "@/components/mvp-simulator/MvpPipelineVisualizer"
import type { IdeaType } from "@/lib/types/mvp-simulator"
import type { Phase } from "@/lib/types/mvp-simulator"

type ComplianceLevel = "standard" | "gdpr_strict" | "finance_grade"

export function MvpSimulatorSection() {
  const [ideaType, setIdeaType] = useState<IdeaType | null>(null)
  const [targetAudience, setTargetAudience] = useState("")
  const [keyFeatures, setKeyFeatures] = useState("")
  const [complianceLevel, setComplianceLevel] = useState<ComplianceLevel>("standard")
  const [isRunning, setIsRunning] = useState(false)
  const [phases, setPhases] = useState<Phase[] | null>(null)
  const [summary, setSummary] = useState<string | null>(null)

  async function runSimulation() {
    if (!ideaType || keyFeatures.trim().length < 20) return
    setIsRunning(true)
    setPhases(null)
    setSummary(null)

    try {
      const res = await fetch("/api/mvp-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaType,
          targetAudience,
          keyFeatures,
          complianceLevel,
        }),
      })

      const data = await res.json()
      setPhases(data.phases)
      setSummary(data.summary)
    } catch (error) {
      console.error("[v0] Simulation error:", error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section id="simulator" className="relative border-b border-border overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <Badge variant="outline" className="text-primary border-primary/50 px-4 py-2 text-sm font-medium">
              <Rocket className="w-4 h-4 mr-2 inline" />
              Interactive Demo
            </Badge>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">See Your </span>
              <span className="text-primary relative">
                MVP
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path
                    d="M0,8 Q50,0 100,8"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-primary/50"
                  />
                </svg>
              </span>
              <span className="text-foreground"> Come to Life</span>
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Click an idea below and watch how we transform it into a working product in just 48 hours
            </p>
            <p className="text-lg text-muted-foreground/80" lang="hr">
              Klikni ideju ispod i gledaj kako je pretvaramo u proizvod za 48 sati
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Left side: form + selector */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">Interactive Demo – See Your MVP Come to Life</h3>
              <p className="text-sm text-muted-foreground">
                Click an idea and describe your product. We&apos;ll simulate how it goes through our 5-Phase Governance
                Pipeline and show you what production-ready in 48 hours looks like.
              </p>

              <IdeaSelector value={ideaType} onChange={setIdeaType} />

              <div className="space-y-2">
                <label className="text-xs font-medium">Target audience</label>
                <input
                  className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm"
                  placeholder="e.g. B2B SaaS founders in EU fintech"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">
                  Key features & requirements <span className="text-muted-foreground">(min 20 chars)</span>
                </label>
                <textarea
                  className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm h-24 resize-none"
                  placeholder="Describe your SaaS idea, target audience, key features, compliance, integrations..."
                  value={keyFeatures}
                  onChange={(e) => setKeyFeatures(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">{keyFeatures.length}/20 characters minimum</div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Compliance level</label>
                <select
                  className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm"
                  value={complianceLevel}
                  onChange={(e) => setComplianceLevel(e.target.value as ComplianceLevel)}
                >
                  <option value="standard">Standard SaaS</option>
                  <option value="gdpr_strict">GDPR Strict (EU)</option>
                  <option value="finance_grade">Finance-grade / SOC2 / HIPAA</option>
                </select>
              </div>

              <Button
                onClick={runSimulation}
                disabled={!ideaType || keyFeatures.length < 20 || isRunning}
                className="w-full gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isRunning ? "Simulating…" : "Run 48h Simulation"}
              </Button>

              {summary && <p className="text-sm text-muted-foreground border-t border-border pt-4">{summary}</p>}
            </div>

            {/* Right side: pipeline visualizer */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <MvpPipelineVisualizer phases={phases} isRunning={isRunning} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
