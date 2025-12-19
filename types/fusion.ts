export type FusionChannel = "openai" | "gemini" | "fallback";

export interface FusionRouteDecision {
    channel: FusionChannel;
    persona: "default" | "crisis" | "diagnostic";
    maxTokens: number;
    temperature: number;
    reason: string;
}

export interface FusionRequest {
    id: string;
    message: string;
    [key: string]: any;
}

export interface FusionResponse {
    id: string;
    requestId: string;
    channel: FusionChannel;
    content: string;
    createdAt: number;
    latencyMs: number;
    kernelState: string; // was accessing kernel.kernelState, assumes string
    meta: {
        throttled: boolean;
        degraded: boolean;
        tokensApprox: number;
    };
}
