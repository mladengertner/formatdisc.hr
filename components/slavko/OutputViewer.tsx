"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface OutputViewerProps {
  result: any | null
}

export function OutputViewer({ result }: OutputViewerProps) {
  const [tab, setTab] = useState<"output" | "metadata" | "json">("output")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Izvršite prompt da vidite rezultate
      </div>
    )
  }

  if (!result.success) {
    return (
      <div className="space-y-2 p-4 bg-destructive/10 border border-destructive rounded-md">
        <h3 className="font-semibold text-destructive">Greška</h3>
        <p className="text-sm text-destructive/80">{result.error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex gap-2 border-b border-border">
        {(["output", "metadata", "json"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "output" && <div className="p-3 bg-card rounded-md text-sm whitespace-pre-wrap">{result.output}</div>}
        {tab === "metadata" && (
          <div className="p-3 bg-card rounded-md text-sm font-mono">
            <pre>{JSON.stringify(result.metadata, null, 2)}</pre>
          </div>
        )}
        {tab === "json" && (
          <div className="p-3 bg-card rounded-md text-sm font-mono">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>

      <Button size="sm" onClick={() => copyToClipboard(result.output)} className="w-full">
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" /> Kopirano
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" /> Kopiraj Output
          </>
        )}
      </Button>
    </div>
  )
}
