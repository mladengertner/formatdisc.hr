"use client"

import { useEffect, useState, useRef } from "react";
import { Cpu, Sun, Zap, Activity } from "lucide-react";
import ShellChart from "./shell-chart";
import { TelemetrySnapshot } from "@/types/telemetry";

/** Re‑usable indicator card */
function Indicator({
    icon: Icon,
    label,
    value,
    unit,
}: {
    icon: typeof Cpu;
    label: string;
    value: number | string;
    unit?: string;
}) {
    const formatted = typeof value === "number" ? value.toFixed(2) : value;
    return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
            <Icon className="w-6 h-6 text-indigo-400" />
            <div className="flex flex-col">
                <span className="text-sm text-gray-300">{label}</span>
                <span className="text-lg font-medium text-gray-100">
                    {formatted}
                    {unit && <span className="ml-1 text-sm">{unit}</span>}
                </span>
            </div>
        </div>
    );
}

/** Main orchestrator – polls /api/telemetry and renders the live UI */
export default function ShellOrchestrator() {
    const [snapshot, setSnapshot] = useState<TelemetrySnapshot | null>(null);
    const pollRef = useRef<number | null>(null);

    // 1️⃣  Poll the telemetry endpoint every second
    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const res = await fetch("/api/telemetry");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: TelemetrySnapshot = await res.json();
                setSnapshot(data);
            } catch (e) {
                console.error("Telemetry fetch error:", e);
            }
        };

        // Immediate fetch + interval
        fetchTelemetry();
        pollRef.current = window.setInterval(fetchTelemetry, 1000) as unknown as number;
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    // 2️⃣  Guard – show a loading placeholder until the first payload arrives
    if (!snapshot) {
        return (
            <section className="bg-black/20 border border-indigo-500/20 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.1)] animate-fade-in backdrop-blur-md">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-2">
                        <Cpu className="w-10 h-10 text-indigo-500/50 animate-pulse" />
                        <p className="text-gray-400 animate-pulse font-mono tracking-widest uppercase">Initializing Shell...</p>
                    </div>
                </div>
            </section>
        );
    }

    const {
        cpuUsage,
        memoryUsage,
        synapticThroughput,
        subDermalLatency,
        linesAnalyzed,
        kernelState,
        chartHistory,
    } = snapshot;

    // 3️⃣  Render UI
    return (
        <section className="bg-black/20 border border-indigo-500/20 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.1)] space-y-6 animate-fade-in backdrop-blur-md">
            <header className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-200">
                    🛠️ Enterprise Shell Environment
                </h2>
                {/* Kernel state badge – colour‑coded */}
                <span
                    className={`
            inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium
            ${kernelState === "CRITICAL"
                            ? "bg-red-600 text-white"
                            : kernelState === "STABLE"
                                ? "bg-green-600 text-white"
                                : "bg-indigo-600 text-white"}
            animate-status-pop
          `}
                >
                    {kernelState}
                </span>
            </header>

            {/* 3️⃣1️⃣ Live indicator cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Indicator icon={Cpu} label="CPU Usage" value={cpuUsage} unit="%" />
                <Indicator icon={Sun} label="Memory" value={memoryUsage} unit=" GB" />
                <Indicator
                    icon={Zap}
                    label="Synaptic Throughput"
                    value={synapticThroughput}
                    unit=" TPS"
                />
                <Indicator
                    icon={Activity}
                    label="Sub‑dermal Latency"
                    value={subDermalLatency}
                    unit=" ms"
                />
            </div>

            {/* 3️⃣2️⃣ Numeric counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-sm text-gray-300">Lines Analyzed</p>
                    <p className="text-lg font-medium text-gray-100">
                        {linesAnalyzed.toLocaleString()}
                    </p>
                </div>
                {/* Add more counters here if you need them */}
            </div>

            {/* 3️⃣3️⃣ Animated chart */}
            <ShellChart data={chartHistory} />
        </section>
    );
}
