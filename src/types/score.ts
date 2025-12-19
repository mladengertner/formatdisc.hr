import type { FusionRequest, FusionResponse, FusionRouteDecision } from "./fusion";
import type { TelemetrySnapshot } from "./telemetry";

export interface ScoreRecord {
    id: string;
    createdAt: number;
    userId?: string;
    requestText: string;
    responseText: string;
    kernelState: TelemetrySnapshot["kernelState"];
    channel: FusionRouteDecision["channel"];
    latencyMs: number;
    tokensApprox: number;
    cpuUsage: number;
    subDermalLatency: number;
    persona: FusionRouteDecision["persona"];
    qualityScore: number;
    efficiencyScore: number;
    tensionScore: number;
}
