import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cpu, Terminal, Layers, Zap } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-heading" className="border-b border-border">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto space-y-12">
          <header className="text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              About / O meni
            </Badge>
            <h2 id="about-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Mladen Gertner
            </h2>
            <p
              lang="en"
              className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed"
            >
              Architect of agent kernels, motion-first UI systems, and audit-proof business structures.
            </p>
            <p lang="hr" className="text-lg md:text-xl text-muted-foreground/80 text-balance max-w-3xl mx-auto">
              Arhitekt agent kernela, motion-first UI sustava i audit-proof poslovnih struktura.
            </p>
          </header>

          {/* Showcase Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              title="SlavkoKernel™"
              description="Reproducible agent execution with full audit trails and narrative replay capabilities."
              icon={<Cpu aria-hidden="true" className="w-6 h-6 text-primary" />}
            />
            <FeatureCard
              title="ONE CLI Platform"
              description="Unified command-line interface for orchestrating complex agent workflows and deployments."
              icon={<Terminal aria-hidden="true" className="w-6 h-6 text-primary" />}
            />
            <FeatureCard
              title="META HIBRID Builder"
              description="Hybrid architecture framework combining SSR, CSR, and edge computing for optimal performance."
              icon={<Layers aria-hidden="true" className="w-6 h-6 text-primary" />}
            />
            <FeatureCard
              title="SlavkoShell"
              description="Advanced shell environment with native agent integration and real-time monitoring."
              icon={<Zap aria-hidden="true" className="w-6 h-6 text-primary" />}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card
      role="article"
      tabIndex={0}
      className="border-primary/20 bg-card/50 transition-colors hover:bg-card focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <CardContent className="p-6 space-y-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center" aria-hidden="true">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
