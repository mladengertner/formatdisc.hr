"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, CheckCircle2, Lightbulb, Rocket, Shield } from "lucide-react"

interface PipelinePhase {
  id: number
  title: string
  titleHr: string
  icon: React.ReactNode
  color: string
  description: string
  descriptionHr: string
  metrics: {
    label: string
    labelHr: string
    value: string
  }[]
}

const phases: PipelinePhase[] = [
  {
    id: 1,
    title: "Client Input",
    titleHr: "Klijent Zahtjev",
    icon: <Lightbulb className="h-8 w-8" />,
    color: "from-blue-500 to-cyan-500",
    description: "Enterprise requirements gathering and specification",
    descriptionHr: "Prikupljanje enterprise zahtjeva i specifikacija",
    metrics: [
      { label: "Processing Time", labelHr: "Vrijeme obrade", value: "2h" },
      { label: "Success Rate", labelHr: "Stopa uspjeha", value: "100%" },
    ],
  },
  {
    id: 2,
    title: "MVP Simulation",
    titleHr: "MVP Simulacija",
    icon: <Brain className="h-8 w-8" />,
    color: "from-purple-500 to-pink-500",
    description: "Zagreb sandbox deployment with real-time validation",
    descriptionHr: "Zagreb sandbox deployment sa validacijom u realnom vremenu",
    metrics: [
      { label: "Accuracy", labelHr: "Točnost", value: "99.7%" },
      { label: "Bug Detection", labelHr: "Detekcija bugova", value: "94%" },
    ],
  },
  {
    id: 3,
    title: "SlavkoKernel Orchestration",
    titleHr: "SlavkoKernel Orkestracija",
    icon: <Brain className="h-8 w-8" />,
    color: "from-orange-500 to-red-500",
    description: "Resource management and model loading",
    descriptionHr: "Upravljanje resursima i učitavanje modela",
    metrics: [
      { label: "Resource Use", labelHr: "Korištenje resursa", value: "87%" },
      { label: "Load Time", labelHr: "Vrijeme učitavanja", value: "<30s" },
    ],
  },
  {
    id: 4,
    title: "Compliance Gate",
    titleHr: "Compliance Gate",
    icon: <Shield className="h-8 w-8" />,
    color: "from-green-500 to-emerald-500",
    description: "Security audit and GDPR/SOC2 validation",
    descriptionHr: "Sigurnosni audit i GDPR/SOC2 validacija",
    metrics: [
      { label: "Pass Rate", labelHr: "Stopa prolaska", value: "98%" },
      { label: "SBOM Gen", labelHr: "SBOM gen", value: "<5min" },
    ],
  },
  {
    id: 5,
    title: "Production",
    titleHr: "Produkcija",
    icon: <Rocket className="h-8 w-8" />,
    color: "from-[#76B900] to-green-600",
    description: "Zero-downtime global deployment",
    descriptionHr: "Globalni deployment bez prekida",
    metrics: [
      { label: "Success", labelHr: "Uspjeh", value: "100%" },
      { label: "SLA", labelHr: "SLA", value: "99.95%" },
    ],
  },
]

export default function GovernancePipeline() {
  return (
    <section id="governance" aria-labelledby="governance-heading" className="w-full py-16 px-4 border-b border-border">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">5-Phase Governance Pipeline</Badge>
          <h2
            id="governance-heading"
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent"
          >
            From Idea to Production in 48 Hours
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Complete enterprise governance system with MVP simulation, security audits, and zero-downtime deployment
          </p>
        </div>

        {/* Desktop View - Horizontal Pipeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 via-green-500 to-[#76B900] -translate-y-1/2 z-0" />

            {/* Phase Cards */}
            <div className="grid grid-cols-5 gap-4 relative z-10">
              {phases.map((phase, index) => (
                <Card
                  key={phase.id}
                  className="relative bg-card/50 backdrop-blur-sm border-2 hover:border-[#76B900] transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="p-6">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center text-white mb-4 mx-auto`}
                    >
                      {phase.icon}
                    </div>

                    {/* Phase Number */}
                    <div className="text-center mb-2">
                      <Badge variant="outline" className="font-bold">
                        Phase {phase.id}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-center mb-1 text-sm">{phase.title}</h3>
                    <p className="text-xs text-muted-foreground text-center mb-4">{phase.titleHr}</p>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground text-center mb-4 leading-relaxed">
                      {phase.description}
                    </p>

                    {/* Metrics */}
                    <div className="space-y-2">
                      {phase.metrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{metric.label}:</span>
                          <span className="font-bold text-[#76B900]">{metric.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Success Indicator */}
                    <div className="mt-4 flex items-center justify-center gap-1 text-xs text-green-500">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Validated</span>
                    </div>
                  </CardContent>

                  {/* Arrow Connector (except last) */}
                  {index < phases.length - 1 && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-20">
                      <div className="w-4 h-4 bg-background rounded-full flex items-center justify-center border-2 border-[#76B900]">
                        <ArrowRight className="h-3 w-3 text-[#76B900]" />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet View - Vertical Pipeline */}
        <div className="lg:hidden space-y-4">
          {phases.map((phase, index) => (
            <div key={phase.id} className="relative">
              <Card className="bg-card/50 backdrop-blur-sm border-2 hover:border-[#76B900] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {phase.icon}
                    </div>

                    <div className="flex-1">
                      {/* Phase Badge */}
                      <Badge variant="outline" className="mb-2">
                        Phase {phase.id}
                      </Badge>

                      {/* Title */}
                      <h3 className="font-bold mb-1">{phase.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{phase.titleHr}</p>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{phase.descriptionHr}</p>

                      {/* Metrics */}
                      <div className="flex gap-4">
                        {phase.metrics.map((metric, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="text-muted-foreground">{metric.labelHr}: </span>
                            <span className="font-bold text-[#76B900]">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Arrow Connector (except last) */}
              {index < phases.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center border-2 border-[#76B900]">
                    <ArrowRight className="h-4 w-4 text-[#76B900] rotate-90" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto" lang="hr">
            Svaka faza je potpuno auditirana i dokumentirana. Dobivate kompletnu transparentnost cijelog processa od
            ideje do produkcije.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#playground"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all"
            >
              <Brain className="h-5 w-5" aria-hidden="true" />
              Try MVP Simulator
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-background border-2 border-primary text-primary hover:bg-primary/10 rounded-lg font-semibold transition-all"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
