import { NextResponse } from "next/server";
import { telemetryStore } from "@/lib/telemetry-simulator";

/**
 * GET /api/telemetry
 * Returns the current snapshot of the simulated system.
 * The front‑end polls this endpoint.
 */
export async function GET() {
    const snapshot = telemetryStore.getSnapshot();
    return NextResponse.json(snapshot);
}
