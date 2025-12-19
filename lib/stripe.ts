import "server-only"

import Stripe from "stripe"

// Use globalThis to ensure single instance of Stripe client
const globalForStripe = globalThis as unknown as {
  stripeClient: Stripe | undefined
}

export function getStripe() {
  // Return existing global instance if available
  if (globalForStripe.stripeClient) {
    return globalForStripe.stripeClient
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[v0] Stripe secret key not configured")
    return null
  }

  // Create new instance only once
  const client = new Stripe(process.env.STRIPE_SECRET_KEY)

  // Store in global to prevent duplicate instances
  globalForStripe.stripeClient = client

  return client
}

// Export singleton for direct import
export const stripe = getStripe()
