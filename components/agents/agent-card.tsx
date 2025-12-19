"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Activity, MoreVertical, Play, Pause, Trash2, Settings, Copy } from "lucide-react"

interface Agent {
  id: string
  name: string
  type: string
  status: string
  created_at: string
  last_executed_at: string | null
  execution_count?: number
}

interface AgentCardProps {
  agent: Agent
  selected: boolean
  onSelect: (id: string, selected: boolean) => void
  onAction: (id: string, action: string) => void
}

export function AgentCard({ agent, selected, onSelect, onAction }: AgentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500"
      case "idle":
        return "bg-blue-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "running":
        return "default"
      case "idle":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card className={`transition-all ${selected ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(agent.id, !!checked)}
              aria-label={`Select ${agent.name}`}
            />
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {agent.type}
                </Badge>
                <Badge variant={getStatusBadgeVariant(agent.status)} className="text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(agent.status)} mr-1`} />
                  {agent.status}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction(agent.id, "start")}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(agent.id, "stop")}>
                <Pause className="mr-2 h-4 w-4" />
                Stop
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction(agent.id, "duplicate")}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(agent.id, "settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onAction(agent.id, "delete")}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          {agent.last_executed_at && (
            <div className="flex items-center justify-between">
              <span>Last run:</span>
              <span>{new Date(agent.last_executed_at).toLocaleString()}</span>
            </div>
          )}
          {agent.execution_count !== undefined && (
            <div className="flex items-center justify-between">
              <span>Executions:</span>
              <span className="font-medium text-foreground">{agent.execution_count}</span>
            </div>
          )}
        </div>

        <div className="h-8 bg-muted/50 rounded flex items-end gap-0.5 px-1 mb-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex-1 bg-primary/60 rounded-t" style={{ height: `${Math.random() * 100}%` }} />
          ))}
        </div>

        <Link href={`/agents/${agent.id}`} className="block">
          <Button variant="outline" className="w-full bg-transparent">
            <Activity className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
