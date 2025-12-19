import { NextResponse } from "next/server";
import { runFusion } from "@/lib/slavko-fusion";
import { FusionRequest } from "@/types/fusion";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, userId } = body; // as { message?: string; userId?: string };

        if (!message) {
            return NextResponse.json({ error: "Missing `message` field." }, { status: 400 });
        }

        const fusionReq: FusionRequest = {
            id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId: userId || "anonymous",
            message,
            timestamp: Date.now(),
        };

        const result = await runFusion(fusionReq);
        return NextResponse.json(result);
    } catch (e) {
        console.error("[Fusion] error:", e);
        return NextResponse.json({ error: "Fusion broker failure." }, { status: 500 });
    }
}
