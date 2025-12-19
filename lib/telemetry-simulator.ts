import { TelemetrySnapshot, ChartPoint } from "@/types/telemetry";

/**
 * Simple random‑walk generator that mimics a live system.
 * Keeps a history buffer.
 */
class TelemetryStore {
    private snapshot: TelemetrySnapshot;
    private history: ChartPoint[] = [];

    constructor() {
        this.snapshot = this.initialSnapshot();
        // Prime the buffer
        for (let i = 0; i < 12; i++) this.tick();
    }

    private initialSnapshot(): TelemetrySnapshot {
        return {
            cpuUsage: 5,
            memoryUsage: 2,
            synapticThroughput: 0,
            subDermalLatency: 12,
            linesAnalyzed: 0,
            kernelState: "INITIALIZING",
            chartHistory: [],
        };
    }

    /** Advance the simulation by one step. */
    tick() {
        const now = Date.now();

        // Random walk helpers
        const walk = (value: number, step: number, min = 0, max = 100) => {
            const delta = (Math.random() - 0.5) * step * 2;
            const next = Math.min(max, Math.max(min, value + delta));
            return Number(next.toFixed(2));
        };

        // Update each metric
        const cpu = walk(this.snapshot.cpuUsage, 2, 0, 100);
        const mem = walk(this.snapshot.memoryUsage, 0.5, 1, 32);
        // Throughput can jump
        const syn = Math.max(0, this.snapshot.synapticThroughput + (Math.random() - 0.5) * 50);
        const latency = Math.max(5, this.snapshot.subDermalLatency + (Math.random() - 0.5) * 2);
        const lines = this.snapshot.linesAnalyzed + Math.floor(Math.random() * 15);

        // Kernel state logic
        let state: TelemetrySnapshot["kernelState"] = "STABLE";
        if (cpu > 85 || latency > 50) state = "CRITICAL";
        else if (lines < 100) state = "INITIALIZING";

        this.snapshot = {
            cpuUsage: cpu,
            memoryUsage: mem,
            synapticThroughput: Number(syn.toFixed(2)),
            subDermalLatency: Number(latency.toFixed(2)),
            linesAnalyzed: lines,
            kernelState: state,
            chartHistory: [], // filled below
        };

        this.history.push({ ts: now, cpu, mem });
        // Keep last 30s
        const cutoff = now - 30_000;
        this.history = this.history.filter((p) => p.ts >= cutoff);
        this.snapshot.chartHistory = [...this.history];
    }

    getSnapshot(): TelemetrySnapshot {
        // Tick on read to simulate constant activity even in serverless
        this.tick();
        return JSON.parse(JSON.stringify(this.snapshot));
    }
}

// Global instance to maintain state across requests in warm envs
// In purely ephemeral serverless, this resets, but tick() primes it, so it's fine for demo.
const globalForTelemetry = global as unknown as { telemetryStore: TelemetryStore };

export const telemetryStore =
    globalForTelemetry.telemetryStore || new TelemetryStore();

if (process.env.NODE_ENV !== "production") {
    globalForTelemetry.telemetryStore = telemetryStore;
}
