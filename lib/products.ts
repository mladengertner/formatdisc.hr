export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  tier: "starter" | "professional" | "enterprise"
}

// Product catalog - source of truth
export const PRODUCTS: Product[] = [
  {
    id: "starter-saas",
    name: "Starter SaaS",
    description: "Complete SaaS delivered in 7 days",
    priceInCents: 299900, // €2,999
    tier: "starter",
    features: [
      "7-day delivery",
      "1 MVP simulation iteration",
      "Basic custom branding",
      "Email support",
      "99.5% SLA guarantee",
      "Basic compliance (GDPR)",
    ],
  },
  {
    id: "professional-saas",
    name: "Professional SaaS",
    description: "Advanced SaaS delivered in 5 days",
    priceInCents: 799900, // €7,999
    tier: "professional",
    features: [
      "5-day delivery",
      "3 MVP simulation iterations",
      "Advanced custom branding",
      "Enhanced support",
      "99.7% SLA guarantee",
      "GDPR compliance",
      "Integration with existing systems",
    ],
  },
  {
    id: "enterprise-saas",
    name: "Enterprise SaaS",
    description: "Production-ready SaaS in 48 hours",
    priceInCents: 1499900, // €14,999
    tier: "enterprise",
    features: [
      "48-hour delivery or money back",
      "Unlimited MVP simulations",
      'Complete "Eterični Sjaj" branding',
      "24/7 dedicated support",
      "99.95% SLA guarantee",
      "Full compliance (GDPR/SOC2/HIPAA)",
      "Team training & documentation",
      "Dedicated account manager",
      "3 months priority support",
    ],
  },
]
