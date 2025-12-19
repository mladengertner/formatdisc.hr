import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartInstance } from "chart.js";
import { telemetrySimulator } from "../../services/telemetrySimulator";

export function ShellChart() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartInstance | null>(null);

    // initialise chart once
    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: Array.from({ length: 30 }, (_, i) => `${i}`),
                datasets: [
                    {
                        label: "CPU %",
                        data: Array(30).fill(0),
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16,185,129,0.15)",
                        tension: 0.32,
                        fill: true,
                    },
                    {
                        label: "Latency ms",
                        data: Array(30).fill(0),
                        borderColor: "#22d3ee",
                        backgroundColor: "rgba(34,211,238,0.15)",
                        tension: 0.32,
                        fill: true,
                    },
                ],
            },
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 120 },
                },
                plugins: {
                    legend: { labels: { color: "#d1d5db" } },
                    tooltip: { enabled: false },
                },
            },
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        }
    }, []);

    // push new data every 500 ms (same interval as telemetry)
    useEffect(() => {
        const iv = setInterval(() => {
            const snap = telemetrySimulator.getSnapshot();
            if (!chartRef.current) return;
            const cpuDs = chartRef.current.data.datasets[0];
            const latDs = chartRef.current.data.datasets[1];
            cpuDs.data.shift();
            cpuDs.data.push(snap.cpuUsage);
            latDs.data.shift();
            latDs.data.push(snap.subDermalLatency);
            chartRef.current.update("none");
        }, 500);
        return () => clearInterval(iv);
    }, []);

    return (
        <div className="relative h-64 w-full overflow-hidden rounded-lg border border-emerald-500/30 bg-black/30 backdrop-blur-sm">
            <canvas ref={canvasRef} className="h-full w-full" />
            {/* sheen overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-chart-sheen" />
        </div>
    );
}
