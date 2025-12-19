import type { TelemetrySnapshot } from "../types/telemetry";
import { telemetrySimulator } from "../services/telemetrySimulator";

export class KernelManager {
    /** Current telemetry snapshot */
    getSnapshot(): TelemetrySnapshot {
        return telemetrySimulator.getSnapshot();
    }

    /** Simple heuristic – true when the kernel is not in a healthy state */
    isDegraded(): boolean {
        const snap = this.getSnapshot();
        return snap.kernelState !== "NORMAL";
    }
}

/* Export a singleton for the rest of the codebase */
export const kernelManager = new KernelManager();
