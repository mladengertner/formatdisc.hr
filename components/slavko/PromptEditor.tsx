"use client"

interface PromptEditorProps {
  value: string
  onChange: (v: string) => void
}

export function PromptEditor({ value, onChange }: PromptEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">Prompt</span>
        <span className="text-xs text-muted-foreground">{value.length} znakova</span>
      </div>
      <textarea
        className="w-full h-32 bg-input border border-border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="Opiši što trebaš od SlavkoKernel-a…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        Sistem automatski prefira prompt sa <code className="bg-card px-1 rounded">[SlavkoKernel™]</code>
      </p>
    </div>
  )
}
