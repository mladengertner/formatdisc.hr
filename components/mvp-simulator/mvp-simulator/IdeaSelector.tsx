"use client"

export type IdeaType = "saas_dashboard" | "ecommerce" | "booking" | "ai_chatbot" | "mobile_app"

interface Props {
  value: IdeaType | null
  onChange: (v: IdeaType) => void
}

const IDEAS: { id: IdeaType; label: string; desc: string }[] = [
  { id: "saas_dashboard", label: "SaaS Dashboard", desc: "Analytics, billing, multi-tenant" },
  { id: "ecommerce", label: "E-commerce Store", desc: "Catalog, checkout, payments" },
  { id: "booking", label: "Booking Platform", desc: "Calendars, reservations, payments" },
  { id: "ai_chatbot", label: "AI Chatbot", desc: "LLM, context, integrations" },
  { id: "mobile_app", label: "Mobile App", desc: "API backend + mobile-first UI" },
]

export function IdeaSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">
        Choose an idea to simulate / <span className="text-muted-foreground">Odaberi ideju za simulaciju</span>:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {IDEAS.map((idea) => (
          <button
            key={idea.id}
            onClick={() => onChange(idea.id)}
            className={`text-left rounded-md border px-3 py-2 text-xs transition ${
              value === idea.id ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/60"
            }`}
          >
            <div className="font-medium">{idea.label}</div>
            <div className="text-[11px] text-muted-foreground">{idea.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
