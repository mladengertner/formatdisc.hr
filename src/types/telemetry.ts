export type KernelState = "NORMAL" | "WARN" | "CRITICAL";

export interface TelemetrySnapshot {
    kernelState: KernelState;
    cpuUsage: number;          // % (0‑100)
    subDermalLatency: number;  // ms
    timestamp: number;
}
