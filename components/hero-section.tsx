"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Github, Rocket, Sparkles, Users, Cpu, Terminal, Layers, Zap } from "lucide-react"
import Link from "next/link"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

  // Animation classes - disabled if user prefers reduced motion
  const animateClass = shouldReduceMotion ? "" : "animate-in fade-in slide-in-from-bottom-4 duration-700"
  const animateDelayed1 = shouldReduceMotion ? "" : "animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100"
  const animateDelayed2 = shouldReduceMotion ? "" : "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
  const animateDelayed3 = shouldReduceMotion ? "" : "animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300"
  const animateDelayed4 = shouldReduceMotion ? "" : "animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500"

  return (
    <section
      id="entity-intro"
      aria-labelledby="hero-heading"
      className="relative border-b border-border overflow-hidden"
    >
      {/* Background gradient effects */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"
        aria-hidden="true"
      />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 blur-[150px] rounded-full" aria-hidden="true" />

      <div className="container relative mx-auto px-4 py-20 md:py-32 lg:py-40">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* HERO ZONE */}
          <div className="text-center space-y-8">
            {/* Badge */}
            <div
              role="status"
              aria-live="polite"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 ${animateClass}`}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Production Ready AI Orchestration Hub</span>
            </div>

            {/* Main Heading */}
            <div className={`space-y-6 ${animateDelayed1}`}>
              <h1 id="hero-heading" className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance">
                <span className="text-primary">FORMATDISC</span>
                <span className="sr-only">trademark</span>™
              </h1>

              <p className="text-2xl md:text-3xl text-foreground/90 font-medium">Enterprise SaaS in 48 Hours</p>

              <p
                className="text-xl md:text-2xl text-muted-foreground text-balance leading-relaxed max-w-3xl mx-auto"
                lang="en"
              >
                Test your idea in our MVP Simulation Tool. See it working before you invest.
              </p>
            </div>

            {/* Identity Bridge - "Built by" */}
            <div className={`pt-4 ${animateDelayed2}`}>
              <p className="text-lg text-muted-foreground">
                <span className="text-foreground/70">Built by </span>
                <span className="text-primary font-semibold">Mladen Gertner</span>
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1" lang="en">
                AI Systems Architect • Agent Kernels • Audit-Proof Structures
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              role="group"
              aria-label="Call to action buttons"
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 ${animateDelayed3}`}
            >
              <Button size="lg" className="gap-2 text-base px-8 py-6 h-auto" asChild>
                <Link href="#simulator" aria-label="Try the MVP Simulator">
                  <Rocket className="w-5 h-5" aria-hidden="true" />
                  Start Orchestration
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="gap-2 text-base px-8 py-6 h-auto bg-transparent" asChild>
                <Link
                  href="https://github.com/mladengertner"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View projects on GitHub (opens in new tab)"
                >
                  <Github className="w-5 h-5" aria-hidden="true" />
                  View Projects
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="gap-2 text-base px-8 py-6 h-auto bg-transparent" asChild>
                <Link href="#contact" aria-label="Information for investors">
                  <Users className="w-5 h-5" aria-hidden="true" />
                  For Investors
                </Link>
              </Button>
            </div>
          </div>

          {/* CAPABILITY PROOF ZONE - Projects Grid */}
          <div className={`space-y-8 ${animateDelayed4}`}>
            <div className="text-center">
              <Badge variant="outline" className="text-primary border-primary/30">
                Capability Proof / Dokazane Sposobnosti
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CapabilityCard
                title="SlavkoKernel™"
                description="Reproducible agent execution with full audit trails"
                icon={<Cpu aria-hidden="true" className="w-6 h-6 text-primary" />}
                shouldReduceMotion={shouldReduceMotion}
                delay={0}
              />
              <CapabilityCard
                title="ONE CLI"
                description="Unified interface for agent workflow orchestration"
                icon={<Terminal aria-hidden="true" className="w-6 h-6 text-primary" />}
                shouldReduceMotion={shouldReduceMotion}
                delay={1}
              />
              <CapabilityCard
                title="META HIBRID"
                description="Hybrid SSR/CSR/Edge architecture framework"
                icon={<Layers aria-hidden="true" className="w-6 h-6 text-primary" />}
                shouldReduceMotion={shouldReduceMotion}
                delay={2}
              />
              <CapabilityCard
                title="SlavkoShell"
                description="Shell environment with native agent integration"
                icon={<Zap aria-hidden="true" className="w-6 h-6 text-primary" />}
                shouldReduceMotion={shouldReduceMotion}
                delay={3}
              />
            </div>
          </div>

          {/* Stats */}
          <div
            role="region"
            aria-label="Key statistics"
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-4xl mx-auto ${animateDelayed4}`}
          >
            <StatCard value="100+" label="Projects Delivered" />
            <StatCard value="48h" label="Delivery Guarantee" />
            <StatCard value="€14,999" label="Enterprise Tier" />
            <StatCard value="99.95%" label="SLA Uptime" />
          </div>
        </div>
      </div>
    </section>
  )
}

function CapabilityCard({
  title,
  description,
  icon,
  shouldReduceMotion,
  delay,
}: {
  title: string
  description: string
  icon: React.ReactNode
  shouldReduceMotion: boolean
  delay: number
}) {
  const animateClass = shouldReduceMotion ? "" : `animate-in fade-in slide-in-from-bottom-4 duration-500`
  const delayStyle = shouldReduceMotion ? {} : { animationDelay: `${600 + delay * 100}ms` }

  return (
    <Card
      role="article"
      tabIndex={0}
      className={`border-primary/20 bg-card/50 transition-all hover:bg-card hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 group ${animateClass}`}
      style={delayStyle}
    >
      <CardContent className="p-6 space-y-4">
        <div
          className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110"
          aria-hidden="true"
        >
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

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="text-3xl md:text-4xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
