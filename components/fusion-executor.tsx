"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Copy, Download, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuditLog } from "@/hooks/use-audit-log"

interface ExecutionOutput {
  timestamp: string
  type: "stdout" | "stderr" | "info" | "error" | "success"
  content: string
}

export function FusionExecutor() {
  const [command, setCommand] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [output, setOutput] = useState<ExecutionOutput[]>([])
  const [charCount, setCharCount] = useState(0)
  const outputRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { logEvent } = useAuditLog()

  const MAX_CHARS = 5000

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const handleCommandChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setCommand(value)
      setCharCount(value.length)
    }
  }

  const executeCommand = async () => {
    if (!command.trim()) {
      toast({
        title: "Error",
        description: "Please enter a command to execute",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    logEvent("execution_started", { command: command.trim() })

    // Add info output
    setOutput((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        type: "info",
        content: `$ ${command.trim()}`,
      },
    ])

    // Simulate CLI execution with realistic output
    await new Promise((resolve) => setTimeout(resolve, 500))

    setOutput((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        type: "stdout",
        content: "Initializing NVIDIA Fusion Runtime...",
      },
    ])

    await new Promise((resolve) => setTimeout(resolve, 800))

    setOutput((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        type: "stdout",
        content: "Loading agent pipeline modules...",
      },
    ])

    await new Promise((resolve) => setTimeout(resolve, 600))

    setOutput((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        type: "success",
        content: "✓ Execution completed successfully",
      },
    ])

    await new Promise((resolve) => setTimeout(resolve, 400))

    setOutput((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        type: "stdout",
        content: `Output: Command "${command.trim()}" processed with audit ID: ${Date.now()}`,
      },
    ])

    setIsExecuting(false)
    logEvent("execution_completed", { command: command.trim(), status: "success" })

    toast({
      title: "Execution Complete",
      description: "Command executed successfully with full audit trail",
    })
  }

  const stopExecution = () => {
    setIsExecuting(false)
    logEvent("execution_stopped", { command: command.trim() })
    setOutput((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        type: "error",
        content: "✗ Execution stopped by user",
      },
    ])
  }

  const clearOutput = () => {
    setOutput([])
    logEvent("output_cleared", {})
  }

  const copyOutput = () => {
    const text = output.map((o) => `[${o.type}] ${o.content}`).join("\n")
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Output copied to clipboard",
    })
  }

  const downloadOutput = () => {
    const text = output.map((o) => `[${new Date(o.timestamp).toISOString()}] [${o.type}] ${o.content}`).join("\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `execution-${Date.now()}.log`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    logEvent("output_downloaded", {})
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Command Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Command Executor
          </CardTitle>
          <CardDescription>Enter commands to execute with full audit logging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label className="text-muted-foreground">Command Input</label>
              <span
                className={`font-mono ${charCount > MAX_CHARS * 0.9 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {charCount} / {MAX_CHARS}
              </span>
            </div>
            <Textarea
              value={command}
              onChange={(e) => handleCommandChange(e.target.value)}
              placeholder="Enter your command here..."
              className="min-h-[200px] font-mono text-sm resize-none"
              disabled={isExecuting}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {isExecuting ? (
              <Button onClick={stopExecution} variant="destructive" className="gap-2">
                <Square className="w-4 h-4" />
                Stop Execution
              </Button>
            ) : (
              <Button onClick={executeCommand} className="gap-2">
                <Play className="w-4 h-4" />
                Execute
              </Button>
            )}
            <Button onClick={clearOutput} variant="outline" disabled={output.length === 0}>
              Clear Output
            </Button>
          </div>

          {charCount > MAX_CHARS * 0.9 && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                Approaching character limit. Maximum {MAX_CHARS} characters allowed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Execution Output</CardTitle>
              <CardDescription>Real-time command execution results</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={copyOutput} disabled={output.length === 0}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={downloadOutput} disabled={output.length === 0}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={outputRef}
            className="min-h-[300px] max-h-[500px] overflow-y-auto rounded-md bg-secondary/50 p-4 font-mono text-sm space-y-1"
          >
            {output.length === 0 ? (
              <p className="text-muted-foreground italic">No output yet. Execute a command to see results.</p>
            ) : (
              output.map((line, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <Badge
                    variant={line.type === "error" ? "destructive" : line.type === "success" ? "default" : "secondary"}
                    className="shrink-0 mt-0.5 text-xs"
                  >
                    {line.type}
                  </Badge>
                  <span
                    className={`flex-1 ${
                      line.type === "error"
                        ? "text-destructive"
                        : line.type === "success"
                          ? "text-primary"
                          : line.type === "info"
                            ? "text-foreground font-semibold"
                            : "text-foreground"
                    }`}
                  >
                    {line.content}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
