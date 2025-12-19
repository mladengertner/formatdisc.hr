"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Clock } from "lucide-react"

interface Log {
  id: string
  prompt: string
  response: string
  latency: number
  status: string
  created_at: string
}

export default function AgentDetailPage() {
  const params = useParams()
  const agentId = params.id as string

  const [prompt, setPrompt] = useState("")
  const [executing, setExecuting] = useState(false)
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const response = await fetch(`/api/agents/${agentId}/logs`)
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("[v0] Failed to fetch logs:", error)
    }
  }

  async function handleExecute() {
    if (!prompt.trim()) return

    setExecuting(true)
    try {
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          prompt,
        }),
      })

      if (response.ok) {
        setPrompt("")
        await fetchLogs()
      } else {
        alert("Execution failed")
      }
    } catch (error) {
      console.error("[v0] Execution error:", error)
      alert("Execution failed")
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Agent Execution</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Execute Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
            />
            <Button onClick={handleExecute} disabled={executing || !prompt.trim()} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              {executing ? "Executing..." : "Execute"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={log.status === "completed" ? "default" : "destructive"}>{log.status}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {log.latency}ms
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">Prompt:</div>
                      <div className="text-muted-foreground line-clamp-2">{log.prompt}</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">Response:</div>
                      <div className="text-muted-foreground line-clamp-3">{log.response}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
