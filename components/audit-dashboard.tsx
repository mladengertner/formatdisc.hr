"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Download, Play, AlertCircle } from "lucide-react"
import { useAuditLog } from "@/hooks/use-audit-log"

export function AuditDashboard() {
  const { events, exportEvents, replayEvents } = useAuditLog()

  const getEventIcon = (type: string) => {
    if (type.includes("error")) return <AlertCircle className="w-4 h-4 text-destructive" />
    if (type.includes("started")) return <Play className="w-4 h-4 text-primary" />
    return <Clock className="w-4 h-4 text-muted-foreground" />
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Stats Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{events.length}</CardTitle>
          <CardDescription>Total Events Logged</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{events.filter((e) => e.type.includes("completed")).length}</CardTitle>
          <CardDescription>Completed Actions</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{events.filter((e) => e.type.includes("error")).length}</CardTitle>
          <CardDescription>Error Events</CardDescription>
        </CardHeader>
      </Card>

      {/* Event Log */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Audit Event Log
              </CardTitle>
              <CardDescription>Complete timeline of all system interactions with replay capability</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={replayEvents}
                variant="outline"
                className="gap-2 bg-transparent"
                disabled={events.length === 0}
              >
                <Play className="w-4 h-4" />
                Replay
              </Button>
              <Button
                onClick={exportEvents}
                variant="outline"
                className="gap-2 bg-transparent"
                disabled={events.length === 0}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] rounded-md border">
            <div className="p-4 space-y-4">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No audit events yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Events will appear here as you interact with the system
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="shrink-0 mt-1">{getEventIcon(event.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold">{event.type.replace(/_/g, " ").toUpperCase()}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">{formatTimestamp(event.timestamp)}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {event.id.slice(0, 8)}
                        </Badge>
                      </div>
                      {Object.keys(event.data).length > 0 && (
                        <div className="rounded-md bg-secondary/50 p-3">
                          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
