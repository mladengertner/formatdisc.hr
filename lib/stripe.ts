import "server-only"

import Stripe from "stripe"

// Use globalThis to ensure single instance of Stripe client
const globalForStripe = globalThis as unknown as {
  stripeClient: Stripe | undefined
}

export function getStripe(): Stripe {
  // Return existing global instance if available
  if (globalForStripe.stripeClient) {
    return globalForStripe.stripeClient
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("[FormatDisc] STRIPE_SECRET_KEY environment variable is required")
  }

  // Create new instance only once
  const client = new Stripe(process.env.STRIPE_SECRET_KEY)

  // Store in global to prevent duplicate instances
  globalForStripe.stripeClient = client

  return client
}

// Export singleton for direct import - lazy initialization
export const stripe = {
  get checkout() { return getStripe().checkout },
  get customers() { return getStripe().customers },
  get subscriptions() { return getStripe().subscriptions },
  get billingPortal() { return getStripe().billingPortal },
  get webhooks() { return getStripe().webhooks },
  get prices() { return getStripe().prices },
} as unknown as Stripe
