"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal, Palette, Briefcase, Wrench, ExternalLink } from "lucide-react"

const projectCategories = [
  { id: "all", label: "All Projects", count: 100 },
  { id: "saas", label: "SaaS", count: 35 },
  { id: "cli", label: "CLI Tools", count: 28 },
  { id: "ui", label: "UI Motion", count: 22 },
  { id: "consulting", label: "Consulting", count: 15 },
]

const featuredProjects = [
  {
    title: "Agent Orchestration Platform",
    description: "Full-stack SaaS for managing AI agent workflows with audit trails",
    category: "saas",
    tags: ["Next.js", "TypeScript", "Supabase"],
    icon: Terminal,
  },
  {
    title: "Motion-First Component Library",
    description: "Production-ready React components with built-in animations",
    category: "ui",
    tags: ["React", "Framer Motion", "Tailwind"],
    icon: Palette,
  },
  {
    title: "Business Structure Automation",
    description: "Automated compliance and legal document generation system",
    category: "consulting",
    tags: ["Node.js", "PDF Generation", "APIs"],
    icon: Briefcase,
  },
  {
    title: "CLI Workflow Orchestrator",
    description: "Command-line tool for managing complex deployment pipelines",
    category: "cli",
    tags: ["Go", "Docker", "Kubernetes"],
    icon: Wrench,
  },
]

export function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState("all")

  return (
    <section id="projects" className="border-b border-border bg-card/30">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header - Bilingual */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              Projects / Projekti
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              100+ Delivered Projects
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
              From SaaS platforms to CLI tools, UI systems to consulting solutions.
            </p>
            <p className="text-lg text-muted-foreground/80 text-balance max-w-3xl mx-auto">
              Od SaaS platformi do CLI alata, UI sustava do konzultantskih rješenja.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full max-w-3xl">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                {projectCategories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="flex flex-col gap-1 py-3">
                    <span className="text-sm font-medium">{cat.label}</span>
                    <span className="text-xs text-muted-foreground">{cat.count}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Featured Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects
              .filter((project) => activeCategory === "all" || project.category === activeCategory)
              .map((project, index) => (
                <Card key={index} className="border-primary/20 bg-card hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <project.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Button size="sm" variant="ghost" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription className="text-base">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button size="lg" variant="outline" className="gap-2 bg-transparent">
              View All 100+ Projects
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
