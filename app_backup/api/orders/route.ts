import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAuditEvent } from "@/lib/audit"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, tier, project, timestamp, source } = body

    // Validation
    if (!name || !email || !tier || !project) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const supabase = await createClient()

    // Insert order into database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        name,
        email,
        company: company || null,
        tier,
        project_description: project,
        status: "pending",
        source: source || "website",
        created_at: timestamp || new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error("[Orders API] Insert error:", orderError)

      // Log failed order attempt
      await logAuditEvent({
        userId: "guest",
        eventType: "order_failed",
        eventCategory: "business",
        eventData: { email, tier, error: orderError.message },
      })

      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Log successful order
    await logAuditEvent({
      userId: "guest",
      eventType: "order_created",
      eventCategory: "business",
      eventData: {
        orderId: order.id,
        email,
        tier,
        company,
      },
    })

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to customer

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order received successfully",
    })
  } catch (error) {
    console.error("[Orders API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Admin endpoint - requires authentication
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const limit = Number.parseInt(searchParams.get("limit") || "50")

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(limit)

  if (status) {
    query = query.eq("status", status)
  }

  const { data: orders, error } = await query

  if (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }

  return NextResponse.json({ orders })
}
