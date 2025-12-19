"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"

interface Experiment {
  id: string
  name: string
  description?: string
  created_at: string
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExperiments()
  }, [])

  async function fetchExperiments() {
    try {
      const res = await fetch("/api/experiments")
      if (res.ok) {
        const data = await res.json()
        setExperiments(data.experiments || [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch experiments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Experiments</h1>
          <p className="text-muted-foreground">Manage your AI-driven experiments</p>
        </div>
        <Button asChild>
          <Link href="/experiments/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Experiment
          </Link>
        </Button>
      </div>

      {experiments.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No experiments yet</p>
          <Button asChild>
            <Link href="/experiments/create">Create your first experiment</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {experiments.map((exp) => (
            <Link key={exp.id} href={`/experiments/${exp.id}`}>
              <Card className="p-4 cursor-pointer hover:border-primary/50 transition-colors h-full">
                <h3 className="font-semibold mb-2">{exp.name}</h3>
                <p className="text-sm text-muted-foreground">{exp.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
