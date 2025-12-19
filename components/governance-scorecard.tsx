"use client"
import { ShieldCheck, Activity, BarChart3, Binary } from "lucide-react"

export function GovernanceScorecard() {
    const metrics = [
        { label: "Compliance", value: "100%", icon: ShieldCheck, color: "text-primary" },
        { label: "Architecture", value: "AA+", icon: Binary, color: "text-primary" },
        { label: "Security", value: "Enterprise", icon: Activity, color: "text-primary" },
        { label: "Stability", value: "99.9%", icon: BarChart3, color: "text-primary" },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            {metrics.map((m, i) => (
                <div key={i} className="bg-card/50 border border-primary/20 rounded-lg p-4 flex flex-col items-center justify-center space-y-2 group hover:border-primary/50 transition-colors">
                    <m.icon className={`w-8 h-8 ${m.color} group-hover:scale-110 transition-transform`} />
                    <div className="text-2xl font-bold tracking-tighter">{m.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.label}</div>
                </div>
            ))}
        </div>
    )
}
