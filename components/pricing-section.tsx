"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Zap, Rocket, Crown } from "lucide-react"
import Link from "next/link"

const pricingTiers = [
  {
    name: "Starter",
    nameHr: "Početni",
    price: "€2,999",
    period: "per project / po projektu",
    description: "Perfect for single SaaS MVP in 48h",
    descriptionHr: "Savršen za jedan SaaS MVP u 48h",
    icon: Zap,
    features: [
      "Single SaaS application delivered in 48h / Jedna SaaS aplikacija u 48h",
      "Full-stack React + Next.js + TypeScript",
      "Database integration (Supabase/Neon)",
      "Authentication & user management",
      "Responsive UI with Tailwind CSS",
      "Basic audit logging",
      "Deployment on Vercel",
      "1 week post-launch support / 1 tjedan podrške",
    ],
    cta: "Order Starter",
    ctaHr: "Naruči Početni",
    popular: false,
  },
  {
    name: "Professional",
    nameHr: "Profesionalni",
    price: "€7,999",
    period: "per project / po projektu",
    description: "Enterprise-grade SaaS with advanced features",
    descriptionHr: "Enterprise SaaS sa naprednim funkcionalnostima",
    icon: Rocket,
    features: [
      "Everything in Starter / Sve iz Početnog",
      "Advanced audit-proof logging system",
      "Multi-agent orchestration (SlavkoKernel)",
      "Real-time dashboards & analytics",
      "Payment integration (Stripe)",
      "Email notifications & workflows",
      "API documentation & testing",
      "SEO optimization & meta tags",
      "2 weeks post-launch support / 2 tjedna podrške",
      "Source code + deployment guide",
    ],
    cta: "Order Professional",
    ctaHr: "Naruči Profesionalni",
    popular: true,
  },
  {
    name: "Enterprise",
    nameHr: "Enterprise",
    price: "€14,999",
    period: "per project / po projektu",
    description: "Complete business solution with council governance",
    descriptionHr: "Kompletno poslovno rješenje sa council governance",
    icon: Crown,
    features: [
      "Everything in Professional / Sve iz Profesionalnog",
      "Council-governed multi-agent pipelines",
      "Cryptographically signed audit trails",
      "Custom integrations (Ollama, GitHub, Linear)",
      "Admin dashboard with RBAC",
      "CI/CD pipeline setup (GitHub Actions)",
      "Observability stack (Prometheus, Grafana)",
      "Docker + Kubernetes deployment",
      "1 month priority support / 1 mjesec prioritetne podrške",
      "Dedicated Slack channel",
      "Training session for your team / Trening za vaš tim",
    ],
    cta: "Order Enterprise",
    ctaHr: "Naruči Enterprise",
    popular: false,
  },
]

const subscriptionPlans = [
  {
    name: "Monthly Retainer",
    nameHr: "Mjesečna Pretplata",
    price: "€4,999",
    period: "per month / mjesečno",
    description: "Continuous development & support",
    descriptionHr: "Kontinuirani razvoj i podrška",
    features: [
      "40 hours development time / 40 sati razvoja",
      "Feature updates & bug fixes",
      "Priority support response < 4h",
      "Monthly strategy call / Mjesečni strategijski poziv",
      "Access to all existing projects",
    ],
  },
  {
    name: "Quarterly Package",
    nameHr: "Kvartalni Paket",
    price: "€13,999",
    period: "per quarter / kvartalno",
    description: "Build multiple SaaS products",
    descriptionHr: "Razvoj više SaaS proizvoda",
    features: [
      "2 Professional-tier projects / 2 profesionalna projekta",
      "120 hours development time / 120 sati razvoja",
      "Dedicated project manager",
      "Bi-weekly check-ins / Dvaput tjedno praćenje",
      "Full intellectual property transfer",
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-border">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              Pricing / Cjenik
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Transparent Pricing
              <br />
              <span className="text-primary">No Hidden Fees</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
              Production-ready applications with audit-proof architecture and complete documentation.
            </p>
            <p className="text-lg text-muted-foreground/80 text-balance max-w-3xl mx-auto" lang="hr">
              Aplikacije spremne za produkciju sa audit-proof arhitekturom i kompletnom dokumentacijom.
            </p>
          </div>

          {/* Project-Based Pricing */}
          <div className="space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold text-center">Project-Based / Po Projektu</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {pricingTiers.map((tier) => {
                const Icon = tier.icon
                return (
                  <Card
                    key={tier.name}
                    className={`relative ${
                      tier.popular ? "border-primary/50 shadow-lg shadow-primary/20 scale-105" : "border-border"
                    }`}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                        Most Popular / Najpopularnije
                      </Badge>
                    )}
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Icon className="w-8 h-8 text-primary" />
                        {tier.popular && <Zap className="w-5 h-5 text-primary animate-pulse" />}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tier.nameHr}</p>
                      </div>
                      <div>
                        <div className="text-4xl font-bold">{tier.price}</div>
                        <p className="text-sm text-muted-foreground mt-1">{tier.period}</p>
                      </div>
                      <CardDescription className="text-base">
                        {tier.description}
                        <br />
                        <span className="text-muted-foreground/80">{tier.descriptionHr}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button size="lg" className="w-full" variant={tier.popular ? "default" : "outline"} asChild>
                        <Link href="#saas-order">
                          {tier.cta} / {tier.ctaHr}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold text-center">Subscription Plans / Pretplatni Planovi</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.name} className="border-primary/30">
                  <CardHeader className="space-y-4">
                    <div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.nameHr}</p>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary">{plan.price}</div>
                      <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
                    </div>
                    <CardDescription className="text-base">
                      {plan.description}
                      <br />
                      <span className="text-muted-foreground/80">{plan.descriptionHr}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" className="w-full" asChild>
                      <Link href="#contact">Contact for Subscription / Kontakt za Pretplatu</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Guarantee Badge */}
          <Card className="bg-primary/5 border-primary/20 max-w-4xl mx-auto">
            <CardContent className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <Badge variant="outline" className="text-primary border-primary/50 text-base px-4 py-2">
                  48-Hour Guarantee / 48-Satna Garancija
                </Badge>
              </div>
              <p className="text-lg text-balance leading-relaxed max-w-2xl mx-auto">
                Every project is delivered within 48 hours or your money back. Complete audit trails ensure full
                transparency and reproducibility.
              </p>
              <p className="text-base text-muted-foreground text-balance max-w-2xl mx-auto">
                Svaki projekt se isporučuje u roku od 48 sati ili povrat novca. Potpuni audit zapisi osiguravaju
                transparentnost i reprodukciju.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
