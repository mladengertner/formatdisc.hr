import type { Request, Response } from "express";
import { telemetrySimulator } from "./telemetrySimulator";

/**
 * GET /api/telemetry  →  Server‑Sent Events stream.
 * Emits a full snapshot on every 2 Hz tick.
 */
export const telemetrySSE = (req: Request, res: Response) => {
    // Set SSE headers
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    });

    // Helper to send data
    const send = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // send the current snapshot immediately
    send(telemetrySimulator.getSnapshot());

    // subscribe to future updates
    const unsub = telemetrySimulator.subscribe((snap) => send(snap));

    // clean up when client disconnects
    req.on("close", () => {
        unsub();
        res.end();
    });
};
