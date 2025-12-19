"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CreditCard, CheckCircle } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Subscription {
  id: string
  plan: string
  status: string
  current_period_end: string
  stripe_customer_id: string
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPortal, setProcessingPortal] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    try {
      const response = await fetch("/api/subscriptions/current")
      const data = await response.json()
      setSubscription(data.subscription)
    } catch (error) {
      console.error("[v0] Failed to fetch subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleManageSubscription() {
    setProcessingPortal(true)
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("[v0] Failed to open portal:", error)
      alert("Failed to open billing portal")
    } finally {
      setProcessingPortal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading billing information...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Billing & Subscription</h1>

      <div className="space-y-6">
        {subscription ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Active Subscription
                </CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Plan</div>
                    <div className="text-2xl font-bold capitalize">{subscription.plan}</div>
                  </div>
                  <Badge
                    variant={subscription.status === "active" ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {subscription.status}
                  </Badge>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground mb-1">Next billing date</div>
                  <div className="font-medium">{new Date(subscription.current_period_end).toLocaleDateString()}</div>
                </div>

                <Button onClick={handleManageSubscription} disabled={processingPortal} className="w-full mt-4">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {processingPortal ? "Opening portal..." : "Manage Subscription"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your past invoices and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">Your billing history is available in the Stripe Customer Portal</p>
                  <Button variant="outline" onClick={handleManageSubscription}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View in Stripe Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>Choose a plan to get started</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-6">
                You don't have an active subscription. Choose a plan to unlock all features.
              </p>
              <Button onClick={() => (window.location.href = "/#pricing")}>View Pricing Plans</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
