import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { retrySlotClaim } from "@/lib/slotLedger"
import { logAuditEvent } from "@/lib/audit"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[Stripe Webhook Error]", err instanceof Error ? err.message : "Unknown error")
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const { data: processed, error: webhookError } = await supabase.rpc("process_stripe_webhook", {
      p_stripe_event_id: event.id,
      p_event_type: event.type,
      p_payload: event.data as any,
    })

    if (webhookError) {
      console.error("[Webhook] Processing error:", webhookError)
      return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const email = session.customer_details?.email

        if (session.payment_status === "paid") {
          const slotClaimed = await retrySlotClaim(
            {
              email: email || undefined,
              tier: session.metadata?.tier,
              sessionId: session.id,
            },
            3,
          )

          if (slotClaimed) {
            await logAuditEvent({
              userId: userId || "guest",
              eventType: "slot_claimed",
              eventCategory: "billing",
              eventData: {
                email,
                sessionId: session.id,
                amountTotal: session.amount_total,
                currency: session.currency,
              },
            })

            console.log(`[Webhook] Slot claimed successfully for ${email}`)
          } else {
            await logAuditEvent({
              userId: userId || "guest",
              eventType: "slot_claim_failed",
              eventCategory: "billing",
              eventData: {
                email,
                sessionId: session.id,
                error: "Slot unavailable or retry exhausted",
              },
            })
            console.error(`[Webhook] Failed to claim slot for ${email} after retries`)
          }
        }

        if (userId && session.subscription) {
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            status: "active",
            plan: "pro",
          })

          console.log(`[Webhook] Subscription created for user ${userId}`)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Webhook] Payment succeeded for invoice ${invoice.id}`)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Webhook] Payment failed for invoice ${invoice.id}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id)

        console.log(`[Webhook] Subscription canceled: ${subscription.id}`)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[Webhook Processing Error]", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
