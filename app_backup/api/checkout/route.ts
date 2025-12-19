import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const { priceId, successUrl, cancelUrl } = await req.json();

        if (!isStripeConfigured()) {
            // Mock response for demo/dev without keys
            return NextResponse.json({
                url: successUrl || "http://localhost:3000?success=true",
                mock: true
            });
        }

        if (!priceId) {
            return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?success=true`,
            cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?canceled=true`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("[Stripe] Checkout error:", error);
        return NextResponse.json({ error: "Checkout session creation failed" }, { status: 500 });
    }
}
