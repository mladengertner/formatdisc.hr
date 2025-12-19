import Stripe from "stripe";

// Use environment variable or fallback to a placeholder for build stability
// In production, strictly require the env var
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key_12345";

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia", // Use latest API version or pin to a known stable one
  typescript: true,
});

export function isStripeConfigured() {
  return process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_");
}
