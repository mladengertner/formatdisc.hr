"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Calendar, MessageSquare, Smartphone } from "lucide-react"

export type IdeaType = "saas_dashboard" | "ecommerce" | "booking" | "ai_chatbot" | "mobile_app"

interface Props {
  value: IdeaType | null
  onChange: (v: IdeaType) => void
}

const IDEAS: { id: IdeaType; label: string; desc: string; icon: any }[] = [
  { id: "saas_dashboard", label: "SaaS Dashboard", desc: "Analytics & Multi-tenant", icon: LayoutDashboard },
  { id: "ecommerce", label: "E-commerce", desc: "Storefront & Payments", icon: ShoppingCart },
  { id: "booking", label: "Booking Platform", desc: "Reservations & Scheduling", icon: Calendar },
  { id: "ai_chatbot", label: "AI Chatbot", desc: "Agents & LLM Integration", icon: MessageSquare },
  { id: "mobile_app", label: "Mobile App", desc: "Native Experience", icon: Smartphone },
]

export function IdeaSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {IDEAS.map((idea) => {
        const Icon = idea.icon
        const isActive = value === idea.id

        return (
          <motion.button
            key={idea.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(idea.id)}
            className={cn(
              "text-left p-4 rounded-xl border transition-all relative overflow-hidden group",
              isActive
                ? "bg-primary/10 border-primary ring-1 ring-primary shadow-[0_0_20px_rgba(0,255,153,0.1)]"
                : "bg-background/40 border-primary/10 hover:border-primary/30"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary/20"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="font-bold text-sm tracking-tight">{idea.label}</div>
            <div className="text-[11px] text-muted-foreground line-clamp-1">{idea.desc}</div>

            {isActive && (
              <motion.div
                layoutId="activeGlow"
                className="absolute inset-0 bg-primary/5 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
