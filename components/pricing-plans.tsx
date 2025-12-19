"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface PricingPlan {
  name: string
  price: string
  priceId: string
  description: string
  features: string[]
  popular?: boolean
}

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: "€2,999",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || "",
    description: "Perfect for MVP prototypes and small teams",
    features: [
      "48h enterprise SaaS delivery",
      "Up to 3 AI agents",
      "Basic audit logging",
      "Email support",
      "99.5% SLA uptime",
      "1 month support included",
    ],
  },
  {
    name: "Professional",
    price: "€7,999",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "",
    description: "For growing businesses with complex needs",
    features: [
      "48h enterprise SaaS delivery",
      "Up to 10 AI agents",
      "Advanced audit + replay",
      "Priority support",
      "99.9% SLA uptime",
      "3 months support included",
      "Custom integrations",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "€14,999",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE || "",
    description: "Maximum scale with council governance",
    features: [
      "48h enterprise SaaS delivery",
      "Unlimited AI agents",
      "Full governance pipeline",
      "24/7 dedicated support",
      "99.95% SLA uptime",
      "6 months support included",
      "White-label options",
      "On-premise deployment",
      "Security audit included",
      "Council-level compliance",
    ],
  },
]

export function PricingPlans() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(priceId: string, planName: string) {
    if (!priceId) {
      alert("Price ID not configured. Please contact support.")
      return
    }

    setLoading(planName)
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Subscription error:", error)
      alert("Failed to start subscription. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : "border-primary/20"}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
          )}
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
            <div className="mt-4">
              <div className="text-4xl font-bold">{plan.price}</div>
              <div className="text-sm text-muted-foreground mt-1">one-time project</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
              onClick={() => handleSubscribe(plan.priceId, plan.name)}
              disabled={loading !== null}
            >
              {loading === plan.name ? "Processing..." : "Get Started"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
