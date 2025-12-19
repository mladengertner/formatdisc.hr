// src/components/enterprise/Dashboard.tsx
import { useEffect, useState } from "react";

interface TelemetryPoint {
    createdAt: number;
    cpuUsage: number;
    subDermalLatency: number;
}

interface Metrics {
    total: number;
    avgQuality: number;
    avgEfficiency: number;
    avgTension: number;
    avgLatency: number;
    avgCpu: number;
    avgSubLatency: number;
    criticalCount: number;
    warnCount: number;
}

interface DashboardPayload {
    metrics: Metrics;
    recent: TelemetryPoint[];
}

/**
 * Pulls `/api/dashboard` (metrics + recent telemetry) and renders a set of
 * KPI cards. No extra charting library is required – the data is shown as
 * simple numbers, keeping the bundle lightweight.
 */
export function Dashboard() {
    const [data, setData] = useState<DashboardPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchDashboard() {
        try {
            const res = await fetch("/api/dashboard");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData(json);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboard();
        const iv = setInterval(fetchDashboard, 30_000); // refresh every 30 s
        return () => clearInterval(iv);
    }, []);

    if (loading) return <p className="text-center py-8">Loading dashboard…</p>;
    if (error)
        return (
            <p className="text-center py-8 text-red-400">
                Failed to load dashboard: {error}
            </p>
        );
    if (!data) return null;

    const { metrics, recent } = data;

    const stat = (label: string, value: string | number, color: string) => (
        <div className={`rounded bg-${color}-900/30 p-4 text-center`}>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-100">{value}</p>
        </div>
    );

    return (
        <section className="mt-12 rounded-xl border border-emerald-600/30 bg-black/30 p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-emerald-200">
                📈 Dashboard (last hour)
            </h2>

            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stat("Total interactions", metrics.total, "emerald")}
                {stat(
                    "Avg. quality",
                    `${(metrics.avgQuality * 100).toFixed(1)} %`,
                    "emerald"
                )}
                {stat(
                    "Avg. efficiency",
                    `${(metrics.avgEfficiency * 100).toFixed(1)} %`,
                    "emerald"
                )}
                {stat(
                    "Avg. tension",
                    `${(metrics.avgTension * 100).toFixed(1)} %`,
                    "emerald"
                )}
                {stat("Avg. latency (ms)", metrics.avgLatency.toFixed(1), "emerald")}
                {stat("Avg. CPU %", `${metrics.avgCpu.toFixed(1)} %`, "emerald")}
                {stat(
                    "Avg. sub‑dermal latency",
                    `${metrics.avgSubLatency.toFixed(1)} ms`,
                    "emerald"
                )}
                {stat(
                    "Critical alerts",
                    metrics.criticalCount,
                    metrics.criticalCount > 0 ? "red" : "emerald"
                )}
                {stat(
                    "Warning alerts",
                    metrics.warnCount,
                    metrics.warnCount > 0 ? "amber" : "emerald"
                )}
            </div>

            {/* Recent telemetry table (last minute) */}
            <div className="mt-8 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-200">
                    <thead className="bg-gray-800/50">
                        <tr>
                            <th className="px-4 py-2">Time</th>
                            <th className="px-4 py-2">CPU %</th>
                            <th className="px-4 py-2">Latency ms</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recent.map((p) => (
                            <tr key={p.createdAt} className="border-b border-gray-700/30">
                                <td className="px-4 py-1">
                                    {new Date(p.createdAt).toLocaleTimeString()}
                                </td>
                                <td className="px-4 py-1">{p.cpuUsage.toFixed(1)}</td>
                                <td className="px-4 py-1">{p.subDermalLatency.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
