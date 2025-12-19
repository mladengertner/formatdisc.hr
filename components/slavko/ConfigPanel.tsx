"use client"

interface ConfigPanelProps {
  config: { model?: string }
  onChange: (config: { model?: string }) => void
}

const MODELS = ["llama2", "mistral", "codellama"]

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">Konfiguracija</label>
      <select
        className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        value={config.model ?? "llama2"}
        onChange={(e) => onChange({ ...config, model: e.target.value })}
      >
        {MODELS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <div className="text-xs bg-card border border-border rounded-md p-2 font-mono overflow-x-auto">
        <pre className="text-muted-foreground">{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  )
}
