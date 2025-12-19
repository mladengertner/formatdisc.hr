import type {
    FusionRequest,
    FusionResponse,
    FusionRouteDecision,
    FusionChannel,
} from "../types/fusion";
import type { TelemetrySnapshot } from "../types/telemetry";
import { kernelManager } from "./kernel-manager";
import { recordScore } from "./score-engine";

/* -----------------------------------------------------------------
   Stub LLM calls – replace with real SDKs when you have API keys.
------------------------------------------------------------------- */
async function callCoreAI(prompt: string) {
    await new Promise((r) => setTimeout(r, 180));
    return { content: `CoreAI → ${prompt}`, tokens: Math.round(prompt.length / 4) };
}
async function callDominor(prompt: string) {
    await new Promise((r) => setTimeout(r, 250));
    return { content: `Dominor → ${prompt}`, tokens: Math.round(prompt.length / 5) };
}
async function callFallback(prompt: string) {
    await new Promise((r) => setTimeout(r, 80));
    return { content: `Fallback → ${prompt}`, tokens: Math.round(prompt.length / 6) };
}

/* -----------------------------------------------------------------
   Routing decision based on telemetry + request length.
------------------------------------------------------------------- */
export function decideRoute(
    req: FusionRequest,
    snap: TelemetrySnapshot
): FusionRouteDecision {
    const highCpu = snap.cpuUsage > 85;
    const highLat = snap.subDermalLatency > 20;
    const critical = snap.kernelState === "CRITICAL";

    // defaults
    let channel: FusionChannel = "coreAI";
    let persona: FusionRouteDecision["persona"] = "default";
    let maxTokens = 512;
    let temperature = 0.4;
    let reason = "baseline";

    if (critical || highCpu || highLat) {
        channel = "fallback";
        persona = "crisis";
        maxTokens = 128;
        temperature = 0.2;
        reason = "kernel‑degraded";
    } else if (req.message.length > 480) {
        channel = "dominor";
        persona = "diagnostic";
        maxTokens = 1024;
        temperature = 0.3;
        reason = "long‑form‑diagnostic";
    }

    return { channel, persona, maxTokens, temperature, reason };
}

/* -----------------------------------------------------------------
   Persona wrapper – injects a system prompt that the LLM sees.
------------------------------------------------------------------- */
function applyPersona(persona: FusionRouteDecision["persona"], msg: string): string {
    if (persona === "crisis") {
        return `You are a CRITICAL‑load assistant. Be ultra‑concise.\n\nUser: ${msg}`;
    }
    if (persona === "diagnostic") {
        return `You are a diagnostic system architect. Explain clearly.\n\nUser: ${msg}`;
    }
    return `You are Slavko, the HR‑assistant. Friendly & practical.\n\nUser: ${msg}`;
}

/* -----------------------------------------------------------------
   Main executor – called by the API route.
------------------------------------------------------------------- */
export async function runFusion(req: FusionRequest): Promise<FusionResponse> {
    const kernelSnap = kernelManager.getSnapshot();
    const route = decideRoute(req, kernelSnap);
    const prompt = applyPersona(route.persona, req.message);

    const start = performance.now();
    let raw;
    if (route.channel === "coreAI") raw = await callCoreAI(prompt);
    else if (route.channel === "dominor") raw = await callDominor(prompt);
    else raw = await callFallback(prompt);
    const latencyMs = Math.round(performance.now() - start);

    const resp: FusionResponse = {
        id: `fusion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        requestId: req.id,
        channel: route.channel,
        content: raw.content,
        createdAt: Date.now(),
        latencyMs,
        kernelState: kernelSnap.kernelState,
        meta: {
            throttled: route.channel === "fallback",
            degraded: kernelSnap.kernelState === "CRITICAL",
            tokensApprox: raw.tokens,
        },
    };

    // Persist the interaction (fire‑and‑forget)
    await recordScore({ request: req, response: resp, kernel: kernelSnap, route }).catch(() => { });

    return resp;
}
