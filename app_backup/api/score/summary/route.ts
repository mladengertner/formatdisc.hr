import { NextResponse } from "next/server";
import { getScoreSummary } from "@/lib/slavko-score";

export async function GET() {
    // Ensure no-cache headers for live metrics
    const summary = getScoreSummary();
    return NextResponse.json(summary, {
        headers: {
            "Cache-Control": "no-store, max-age=0",
        },
    });
}
