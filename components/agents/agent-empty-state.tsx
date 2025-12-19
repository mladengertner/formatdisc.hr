import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, Plus, Sparkles } from "lucide-react"
import Link from "next/link"

export function AgentEmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">No AI Agents Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Create your first AI agent to automate tasks, analyze data, and orchestrate workflows with enterprise-grade
          reliability.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/agents/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Agent
            </Button>
          </Link>
          <Link href="/docs/agents">
            <Button variant="outline">Learn More</Button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">48h</div>
            <div className="text-xs text-muted-foreground">Delivery Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-xs text-muted-foreground">Audit Trail</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-xs text-muted-foreground">Availability</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
