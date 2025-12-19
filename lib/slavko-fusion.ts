import type {
    FusionRequest,
    FusionResponse,
    FusionRouteDecision,
    FusionChannel,
} from "@/types/fusion";
import type { TelemetrySnapshot } from "@/types/telemetry";
import { telemetryStore } from "@/lib/telemetry-simulator";
import { recordScore } from "./slavko-score";

/* ---------- LLM‑stubs (replace with real SDKs later) ---------- */
async function callOpenAI(prompt: string) {
    // Simulate network
    await new Promise(r => setTimeout(r, 180));
    return { content: `OpenAI answer: ${prompt.substring(0, 50)}...`, tokens: Math.round(prompt.length / 4) };
}
async function callGemini(prompt: string) {
    await new Promise(r => setTimeout(r, 220));
    return { content: `Gemini answer: ${prompt.substring(0, 50)}...`, tokens: Math.round(prompt.length / 5) };
}
async function callFallback(prompt: string) {
    await new Promise(r => setTimeout(r, 80));
    return { content: `Fallback answer: ${prompt.substring(0, 50)}...`, tokens: Math.round(prompt.length / 6) };
}

/* ---------- Routing heuristics ---------- */
export function decideRoute(
    req: FusionRequest,
    kernel: TelemetrySnapshot
): FusionRouteDecision {
    const highCpu = kernel.cpuUsage > 85;
    const highLatency = kernel.subDermalLatency > 20;
    const critical = kernel.kernelState === "CRITICAL";

    let channel: FusionChannel = "openai";
    let persona: FusionRouteDecision["persona"] = "default";
    let maxTokens = 512;
    let temperature = 0.4;
    let reason = "baseline-openai";

    if (critical || highCpu || highLatency) {
        channel = "fallback";
        persona = "crisis";
        maxTokens = 128;
        temperature = 0.2;
        reason = "kernel-critical-or-degraded";
    } else if (req.message.length > 480) {
        channel = "gemini";
        persona = "diagnostic";
        maxTokens = 1024;
        temperature = 0.3;
        reason = "long-form-diagnostic";
    }

    return { channel, persona, maxTokens, temperature, reason };
}

/* ---------- Persona wrapper ---------- */
function applyPersona(persona: FusionRouteDecision["persona"], msg: string) {
    if (persona === "crisis") {
        return `You are a crisis‑aware assistant. Respond concisely.\n\nUser: ${msg}`;
    }
    if (persona === "diagnostic") {
        return `You are a diagnostic system architect. Explain in detail.\n\nUser: ${msg}`;
    }
    return `You are Slavko, the HR‑assistant. Be helpful and friendly.\n\nUser: ${msg}`;
}

/* ---------- Main orchestrator ---------- */
export async function runFusion(req: FusionRequest): Promise<FusionResponse> {
    // Get current kernel state
    const kernel = telemetryStore.getSnapshot();
    const route = decideRoute(req, kernel);
    const prompt = applyPersona(route.persona, req.message);

    const start = performance.now();
    let raw: { content: string; tokens: number };

    // Dispatch
    if (route.channel === "openai") raw = await callOpenAI(prompt);
    else if (route.channel === "gemini") raw = await callGemini(prompt);
    else raw = await callFallback(prompt);

    const latencyMs = Math.round(performance.now() - start);

    const response: FusionResponse = {
        id: `fusion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        requestId: req.id,
        channel: route.channel,
        content: raw.content,
        createdAt: Date.now(),
        latencyMs,
        kernelState: kernel.kernelState,
        meta: {
            throttled: route.channel === "fallback",
            degraded: kernel.kernelState === "CRITICAL",
            tokensApprox: raw.tokens,
        },
    };

    // Persist for Score engine
    // Note: We use a fire-and-forget pattern here usually, but await ensuring correctness for this implementation
    try {
        await recordScore({ request: req, response, kernel, route });
    } catch (e) {
        console.warn("Failed to record score:", e);
    }

    return response;
}
