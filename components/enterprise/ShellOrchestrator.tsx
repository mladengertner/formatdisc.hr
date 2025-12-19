"use client";

import { useState, useEffect } from "react";
import { Activity, Cpu, Database, Zap, ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ShellChart from "./ShellChart";
import FusionChat from "./FusionChat";
import { TelemetrySnapshot } from "@/types/telemetry";

export default function ShellOrchestrator() {
    const [snapshot, setSnapshot] = useState<TelemetrySnapshot | null>(null);

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const res = await fetch("/api/telemetry");
                if (res.ok) {
                    const data = await res.json();
                    setSnapshot(data);
                }
            } catch (e) {
                console.error("Telemetry fetch error", e);
            }
        };

        const interval = setInterval(fetchTelemetry, 1000);
        fetchTelemetry();

        return () => clearInterval(interval);
    }, []);

    if (!snapshot) {
        return (
            <div className="p-12 text-center animate-pulse">
                <Activity className="w-12 h-12 mx-auto text-emerald-500/50 mb-4" />
                <p className="text-emerald-500/70 font-mono tracking-widest text-sm">INITIALIZING KERNEL LINK...</p>
            </div>
        );
    }

    const isCritical = snapshot.kernelState === "CRITICAL";

    return (
        <div className="w-full space-y-8 p-1">
            {/* Top Bar: Status & Key Metrics */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-xl bg-black/40 border border-emerald-500/20 backdrop-blur-sm relative overflow-hidden group">
                {/* Status Pulse BG */}
                <div className={`absolute inset-0 opacity-10 pointer-events-none ${isCritical ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></div>

                <div className="flex items-center gap-4 z-10">
                    <div className={`p-3 rounded-full ${isCritical ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-400"} shadow-lg shadow-emerald-500/10`}>
                        <Activity className={`w-6 h-6 ${isCritical ? "animate-bounce" : "animate-shell-pulse"}`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">SlavkoKernel v12</h3>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isCritical ? "bg-red-500 animate-ping" : "bg-emerald-500"}`}></span>
                            <span className="text-xs font-mono text-emerald-200/70">{snapshot.kernelState} // UPTIME: 99.99%</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 z-10 font-mono text-sm">
                    <div className="flex items-center gap-2 text-emerald-100/80 bg-black/30 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                        <Cpu className="w-4 h-4 text-emerald-500" />
                        <span>{snapshot.cpuUsage}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-100/80 bg-black/30 px-3 py-1.5 rounded-lg border border-indigo-500/10">
                        <Database className="w-4 h-4 text-indigo-500" />
                        <span>{snapshot.memoryUsage}GB</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-100/80 bg-black/30 px-3 py-1.5 rounded-lg border border-purple-500/10">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <span>{snapshot.synapticThroughput} TPS</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Chart Visualization */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Real-Time Telemetry
                        </h4>
                        <span className="text-xs text-emerald-500/50 font-mono">{snapshot.linesAnalyzed.toLocaleString()} LINES SCANNED</span>
                    </div>
                    <div className="h-[400px]">
                        <ShellChart data={snapshot.chartHistory} />
                    </div>
                </div>

                {/* Right: Fusion Chat */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Fusion Interface
                        </h4>
                        <span className="text-xs text-indigo-500/50 font-mono">SECURE CHANNEL ESTABLISHED</span>
                    </div>
                    <div className="h-[400px]">
                        <FusionChat />
                    </div>
                </div>
            </div>
        </div>
    );
}
