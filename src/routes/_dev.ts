// src/routes/_dev.ts
import type { Request, Response } from "express";
import { telemetrySimulator } from "../services/telemetrySimulator";

/**
 * POST /api/_dev/simulate
 * Body: { kernelState, cpuUsage, subDermalLatency }
 *
 * **Only available when NODE_ENV !== "production".**
 */
export function devSimulateHandler(req: Request, res: Response) {
    if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ error: "Forbidden in production" });
    }

    const { kernelState, cpuUsage, subDermalLatency } = req.body as {
        kernelState: "NORMAL" | "WARN" | "CRITICAL";
        cpuUsage: number;
        subDermalLatency: number;
    };

    if (
        typeof kernelState !== "string" ||
        typeof cpuUsage !== "number" ||
        typeof subDermalLatency !== "number"
    ) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    // Directly replace the simulator’s internal snapshot (dev‑only hack)
    // @ts-ignore – we know the private fields exist
    telemetrySimulator["snapshot"] = {
        kernelState,
        cpuUsage,
        subDermalLatency,
        timestamp: Date.now(),
    };

    // Notify listeners immediately
    // @ts-ignore
    telemetrySimulator["listeners"].forEach((cb: (s: any) => void) =>
        cb(telemetrySimulator["snapshot"])
    );

    res.status(200).json({ status: "ok", snapshot: telemetrySimulator["snapshot"] });
}
