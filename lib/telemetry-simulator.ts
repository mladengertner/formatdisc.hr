import { TelemetrySnapshot, ChartPoint } from "@/types/telemetry";

// In a real V2 implementation, we might import recordScore to auto-persist periodic snapshots,
// but for the V2 spec provided, the simulation is primarily consumed by runFusion via getSnapshot().
// The provided spec code for services/telemetrySimulator.ts says: "emitira TelemetrySnapshot. Na kraju svakog tick‑a poziva persistSnapshot iz slavko-score."
// However, the `slavko-score` spec only exports `recordScore` which takes Fusion Req/Res.
// So we will stick to the logic of managing the state that Fusion consumes.

class TelemetryStore {
    private snapshot: TelemetrySnapshot;
    private history: ChartPoint[];
    private maxHistory = 30; // 30 seconds rolling buffer as per spec

    constructor() {
        this.history = [];
        this.snapshot = {
            cpuUsage: 10,
            memoryUsage: 1.2,
            synapticThroughput: 120,
            subDermalLatency: 5,
            kernelState: "STABLE",
            linesAnalyzed: 0,
            chartHistory: [],
        };

        // Initialize history
        const now = Date.now();
        for (let i = 0; i < this.maxHistory; i++) {
            this.history.push({
                timestamp: now - (this.maxHistory - i) * 1000,
                cpu: 10,
                memory: 1.2,
            });
        }
        this.snapshot.chartHistory = this.history;
    }

    // 2 Hz simulation step - usually called by an interval or on-read
    tick() {
        // Random walk logic
        const last = this.snapshot;

        // CPU: Drift +/- 5%, clamp 0-100
        const cpuDrift = (Math.random() - 0.5) * 10;
        let newCpu = last.cpuUsage + cpuDrift;
        newCpu = Math.max(2, Math.min(newCpu, 100));

        // Memory: Drift +/- 0.1, clamp 0.5 - 16
        const memDrift = (Math.random() - 0.5) * 0.2;
        let newMem = last.memoryUsage + memDrift;
        newMem = Math.max(0.5, Math.min(newMem, 16));

        // Calculate derived metrics
        // Latency inversely prop to CPU (load increases latency) + noise
        let lat = 5 + (newCpu / 3) + (Math.random() * 5);

        // Throughput proportional to CPU up to a point, then drops
        let tps = 100 + (newCpu * 5) - (Math.max(0, newCpu - 80) * 10);

        // Kernel State Logic
        let state: TelemetrySnapshot["kernelState"] = "STABLE";
        if (newCpu > 90 || lat > 50) state = "CRITICAL";
        else if (newCpu > 70 || lat > 20) state = "DEGRADED";

        this.snapshot = {
            cpuUsage: Number(newCpu.toFixed(2)),
            memoryUsage: Number(newMem.toFixed(2)),
            subDermalLatency: Number(lat.toFixed(2)),
            synapticThroughput: Number(tps.toFixed(2)),
            kernelState: state,
            linesAnalyzed: last.linesAnalyzed + Math.floor(Math.random() * 5),
            chartHistory: this.history
        };

        // Update history
        this.history.push({
            timestamp: Date.now(),
            cpu: this.snapshot.cpuUsage,
            memory: this.snapshot.memoryUsage
        });

        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    getSnapshot(): TelemetrySnapshot {
        this.tick();
        return JSON.parse(JSON.stringify(this.snapshot));
    }
}

export const telemetryStore = new TelemetryStore();

export function startTelemetrySimulator() {
    // In a serverless context (Next.js API), we can't easily keep a persistent interval running 
    // across requests unless we use a custom server or global singleton.
    // Since `telemetryStore` is a global singleton module, it persists somewhat in hot lambda containers.
    // The `tick()` in `getSnapshot()` ensures data moves forward on every request.
    // For a real background worker, we'd need an external process.
    // Ideally, we'd enable an interval here if we had a long-running server.
    setInterval(() => {
        telemetryStore.tick();
    }, 500); // 2 Hz
}

// Start simulation if this module is loaded in a long-lived process
if (process.env.NODE_ENV !== 'test') {
    startTelemetrySimulator();
}
