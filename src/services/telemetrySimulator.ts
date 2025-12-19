import type { TelemetrySnapshot } from "../types/telemetry";
import { recordScore } from "../lib/score-engine";

/**
 * 2 Hz random‑walk generator.
 * Exposes `getSnapshot()` and `subscribe(cb)` for UI / SSE.
 * Also writes a dummy “telemetry‑tick” score so the chart never stays empty.
 */
export class TelemetrySimulator {
    private snapshot: TelemetrySnapshot;
    private listeners = new Set<(snap: TelemetrySnapshot) => void>();
    private interval?: NodeJS.Timeout;

    constructor() {
        this.snapshot = {
            kernelState: "NORMAL",
            cpuUsage: 12,
            subDermalLatency: 2.5,
            timestamp: Date.now(),
        };
    }

    /** Current snapshot (copy) */
    getSnapshot(): TelemetrySnapshot {
        return { ...this.snapshot };
    }

    /** UI / SSE can subscribe to live updates */
    subscribe(cb: (snap: TelemetrySnapshot) => void) {
        this.listeners.add(cb);
        return () => {
            this.listeners.delete(cb);
        }
    }

    /** Internal tick – 2 Hz */
    private tick() {
        const { cpuUsage, subDermalLatency } = this.snapshot;
        const nextCpu = Math.min(100, Math.max(0, cpuUsage + (Math.random() - 0.5) * 10));
        const nextLat = Math.max(0, subDermalLatency + (Math.random() - 0.5) * 2);
        const nextState =
            nextCpu > 90 || nextLat > 30
                ? "CRITICAL"
                : nextCpu > 70 || nextLat > 20
                    ? "WARN"
                    : "NORMAL";

        this.snapshot = {
            kernelState: nextState,
            cpuUsage: Number(nextCpu.toFixed(1)),
            subDermalLatency: Number(nextLat.toFixed(1)),
            timestamp: Date.now(),
        };

        // broadcast to listeners
        this.listeners.forEach((cb) => cb(this.getSnapshot()));

        // write a dummy score so the chart always has data
        // Use a try-catch block here because recordScore might rely on DB that could fail or be mocked
        if (typeof window === 'undefined') {
            try {
                recordScore({
                    request: {
                        id: `tick_${Date.now()}`,
                        userId: "system",
                        message: "telemetry‑tick",
                        timestamp: Date.now(),
                    },
                    response: {
                        id: `tick_resp_${Date.now()}`,
                        requestId: `tick_${Date.now()}`,
                        channel: "fallback",
                        content: "tick",
                        createdAt: Date.now(),
                        latencyMs: 0,
                        kernelState: this.snapshot.kernelState,
                        meta: { throttled: false, degraded: false, tokensApprox: 1 },
                    },
                    kernel: this.snapshot,
                    route: {
                        channel: "fallback",
                        persona: "default",
                        maxTokens: 64,
                        temperature: 0,
                        reason: "telemetry‑tick",
                    },
                }).catch(() => { });
            } catch (e) {
                // Ignore DB writes if DB is not ready
            }
        }
    }

    /** Start the 2 Hz loop – call once at app start */
    start() {
        this.tick(); // immediate first tick
        this.interval = setInterval(() => this.tick(), 500);
    }

    /** Stop – useful for tests */
    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}

/* Export a singleton – the whole app shares the same source */
export const telemetrySimulator = new TelemetrySimulator();
