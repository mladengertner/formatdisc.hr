"use client"

import { FusionExecutor } from "@/components/fusion-executor"
import { RuntimeSimulator } from "@/components/runtime-simulator"
import { AuditDashboard } from "@/components/audit-dashboard"
import { MetricsDashboard } from "@/components/metrics-dashboard"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, BarChart3, Clock, Terminal } from "lucide-react"

export function PlaygroundSection() {
  return (
    <section id="playground" className="border-b border-border bg-card/30">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              Interactive Playground
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">Try It Live</h2>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
              Experience the power of audit-proof orchestration with real-time execution and monitoring.
            </p>
          </div>

          {/* Playground Tabs */}
          <Tabs defaultValue="executor" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="executor" className="gap-2">
                <Terminal className="w-4 h-4" />
                <span className="hidden sm:inline">Fusion Executor</span>
                <span className="sm:hidden">Executor</span>
              </TabsTrigger>
              <TabsTrigger value="runtime" className="gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Runtime Simulator</span>
                <span className="sm:hidden">Runtime</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Audit Dashboard</span>
                <span className="sm:hidden">Audit</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Metrics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="executor" className="space-y-6">
              <FusionExecutor />
            </TabsContent>

            <TabsContent value="runtime" className="space-y-6">
              <RuntimeSimulator />
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <AuditDashboard />
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <MetricsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
