import type { TelemetrySnapshot } from "./telemetry";

export type FusionChannel = "coreAI" | "dominor" | "fallback";

export interface FusionRequest {
    id: string;
    userId?: string;
    message: string;
    timestamp: number;
}

export interface FusionRouteDecision {
    channel: FusionChannel;
    persona: "default" | "crisis" | "diagnostic";
    maxTokens: number;
    temperature: number;
    reason: string;
}

export interface FusionResponse {
    id: string;
    requestId: string;
    channel: FusionChannel;
    content: string;
    createdAt: number;
    latencyMs: number;
    kernelState: TelemetrySnapshot["kernelState"];
    meta: {
        throttled: boolean;
        degraded: boolean;
        tokensApprox: number;
    };
}
