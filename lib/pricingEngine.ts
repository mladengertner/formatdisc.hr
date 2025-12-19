import { getSlotState } from "./slotLedger"

const BASE_PRICING = {
  starter: 999,
  pro: 3999,
  enterprise: 7999,
  premium: 14999,
}

const ESCALATION_MULTIPLIER = 3

export type PricingTier = {
  tier: keyof typeof BASE_PRICING
  basePrice: number
  foundersPrice: number
  escalatedPrice: number
  activePrice: number
}

export type PricingState = {
  tiers: PricingTier[]
  slotState: {
    remaining: number
    total: number
    escalationTriggered: boolean
  }
}

export async function getPricing(): Promise<PricingState> {
  const slotState = await getSlotState()

  const tiers: PricingTier[] = Object.entries(BASE_PRICING).map(([tier, basePrice]) => {
    const foundersPrice = basePrice
    const escalatedPrice = basePrice * ESCALATION_MULTIPLIER
    const activePrice = slotState.escalationTriggered ? escalatedPrice : foundersPrice

    return {
      tier: tier as keyof typeof BASE_PRICING,
      basePrice,
      foundersPrice,
      escalatedPrice,
      activePrice,
    }
  })

  return {
    tiers,
    slotState: {
      remaining: slotState.remaining,
      total: slotState.total,
      escalationTriggered: slotState.escalationTriggered,
    },
  }
}

export function getPriceForTier(tier: keyof typeof BASE_PRICING, escalated: boolean): number {
  const basePrice = BASE_PRICING[tier]
  return escalated ? basePrice * ESCALATION_MULTIPLIER : basePrice
}
