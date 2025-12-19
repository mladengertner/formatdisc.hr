import { useEffect, useState } from "react";
import { telemetrySimulator } from "../../services/telemetrySimulator";
import { ShellChart } from "./ShellChart";
import { FusionChat } from "./FusionChat";

export function ShellOrchestrator() {
    const [snap, setSnap] = useState(telemetrySimulator.getSnapshot());

    useEffect(() => {
        const unsub = telemetrySimulator.subscribe(setSnap);
        return unsub;
    }, []);

    const badgeClass =
        snap.kernelState === "CRITICAL"
            ? "border-red-500/70 bg-red-900/30 text-red-200 animate-shell-pulse"
            : snap.kernelState === "WARN"
                ? "border-amber-400/70 bg-amber-900/30 text-amber-200 animate-shell-pulse"
                : "border-emerald-500/70 bg-emerald-900/30 text-emerald-200 animate-shell-pulse";

    return (
        <section className="relative mt-8 w-full max-w-5xl mx-auto overflow-hidden rounded-2xl border border-emerald-500/40 bg-black/60 shadow-[0_0_60px_rgba(16,185,129,0.4)]">
            {/* background grid + gradient */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-shell-grid bg-grid-tight opacity-20" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-fusion-gradient bg-fusion-pan mix-blend-soft-light animate-gradient-pan" />

            {/* kernel badge */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
                <div className="relative">
                    {/* orbiting halo */}
                    <div className="pointer-events-none absolute -inset-3 rounded-full border border-emerald-400/30 animate-shell-orbit" />
                    <div
                        className={`relative flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm shadow-sm animate-status-pop ${badgeClass}`}
                    >
                        <span className="uppercase tracking-[0.18em]">{snap.kernelState}</span>
                        <span className="ml-1 text-[0.7rem] opacity-80">
                            CPU {snap.cpuUsage.toFixed(0)}% | Latency {snap.subDermalLatency.toFixed(1)}ms
                        </span>
                    </div>
                </div>
            </div>

            {/* chart */}
            <div className="p-6 pt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ShellChart />
                    <FusionChat />
                </div>
            </div>
        </section>
    );
}
