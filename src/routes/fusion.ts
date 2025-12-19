import type { Request, Response } from "express";
import { runFusion } from "../lib/fusion-broker";
import type { FusionRequest } from "../types/fusion";

export async function fusionHandler(req: Request, res: Response) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { message, userId } = req.body as Partial<FusionRequest>;

    if (!message) {
        return res.status(400).json({ error: "Missing `message` field" });
    }

    const fusionReq: FusionRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId,
        message,
        timestamp: Date.now(),
    };

    try {
        const result = await runFusion(fusionReq);
        res.status(200).json(result);
    } catch (e) {
        console.error("[Fusion] error:", e);
        res.status(500).json({ error: "Fusion broker failure" });
    }
}
