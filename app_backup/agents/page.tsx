"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Play, Pause, Trash2 } from "lucide-react"
import Link from "next/link"
import { AgentCard } from "@/components/agents/agent-card"
import { AgentFilters } from "@/components/agents/agent-filters"
import { AgentEmptyState } from "@/components/agents/agent-empty-state"
import { AgentSkeletonGrid } from "@/components/agents/agent-skeleton"
import { useToast } from "@/hooks/use-toast"

interface Agent {
  id: string
  name: string
  type: string
  status: string
  created_at: string
  last_executed_at: string | null
  execution_count?: number
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const { toast } = useToast()

  useEffect(() => {
    fetchAgents()
  }, [])

  async function fetchAgents() {
    try {
      const response = await fetch("/api/agents")
      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error("[v0] Failed to fetch agents:", error)
      toast({
        title: "Error",
        description: "Failed to fetch agents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.type.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || agent.status === statusFilter
      const matchesType = typeFilter === "all" || agent.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [agents, search, statusFilter, typeFilter])

  function handleSelect(id: string, selected: boolean) {
    const newSelected = new Set(selectedAgents)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedAgents(newSelected)
  }

  function handleSelectAll() {
    if (selectedAgents.size === filteredAgents.length) {
      setSelectedAgents(new Set())
    } else {
      setSelectedAgents(new Set(filteredAgents.map((a) => a.id)))
    }
  }

  async function handleAction(id: string, action: string) {
    toast({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Agent action "${action}" triggered`,
    })
    // TODO: Implement actual agent actions via API
  }

  async function handleBulkAction(action: string) {
    const count = selectedAgents.size
    toast({
      title: `Bulk ${action}`,
      description: `${action} triggered for ${count} agents`,
    })
    setSelectedAgents(new Set())
    // TODO: Implement bulk actions via API
  }

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Agents</h1>
            <p className="text-muted-foreground">Manage your AI orchestration agents</p>
          </div>
        </div>
        <AgentSkeletonGrid />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Agents</h1>
          <p className="text-muted-foreground">
            Manage your AI orchestration agents
            {agents.length > 0 && ` (${agents.length} total)`}
          </p>
        </div>
        <Link href="/agents/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </Link>
      </div>

      {agents.length > 0 && (
        <>
          <AgentFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            onClearFilters={clearFilters}
          />

          {selectedAgents.size > 0 && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedAgents.size} selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("start")}>
                  <Play className="mr-1 h-3 w-3" />
                  Start All
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("stop")}>
                  <Pause className="mr-1 h-3 w-3" />
                  Stop All
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedAgents(new Set())}>
                Clear
              </Button>
            </div>
          )}
        </>
      )}

      {filteredAgents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              selected={selectedAgents.has(agent.id)}
              onSelect={handleSelect}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : agents.length > 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No agents match your filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <AgentEmptyState />
      )}
    </div>
  )
}
