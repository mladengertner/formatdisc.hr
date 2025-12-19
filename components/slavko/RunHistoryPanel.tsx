"use client"

import { formatDistanceToNow } from "date-fns"
import { hr } from "date-fns/locale"
import { CheckCircle, AlertCircle } from "lucide-react"

interface RunHistoryPanelProps {
  history: any[]
  onSelect: (item: any) => void
}

export function RunHistoryPanel({ history, onSelect }: RunHistoryPanelProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Istorija Izvršavanja</h3>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Nema istorije</p>
        ) : (
          history.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left p-2 rounded-md bg-card hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.prompt.substring(0, 40)}…</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.timestamp), {
                      locale: hr,
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {item.result?.success ? (
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
