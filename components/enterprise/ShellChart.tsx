"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { ChartPoint } from "@/types/telemetry";

// Register chart.js components
Chart.register(...registerables);

// v2 Spec: No React wrapper, just Canvas. The component here acts as the minimal integration point.
// Wait, the spec says "no React wrapper", but in a React app we need a component to mount the canvas.
// The intention is likely "raw canvas logic inside useEffect" rather than `react-chartjs-2`.

interface ShellChartProps {
    data: ChartPoint[];
}

export default function ShellChart({ data }: ShellChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (!chartInstance.current) {
            // Init
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;

            chartInstance.current = new Chart(ctx, {
                type: "line",
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: "CPU Load",
                            data: [],
                            borderColor: "#10b981", // Emerald 500
                            backgroundColor: (context) => {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                                gradient.addColorStop(0, "rgba(16, 185, 129, 0.5)");
                                gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
                                return gradient;
                            },
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.4,
                            fill: true,
                        },
                        {
                            label: "Memory", // Simulated secondary metric just for visual
                            data: [],
                            borderColor: "#6366f1", // Indigo 500
                            borderWidth: 1,
                            pointRadius: 0,
                            tension: 0.4,
                            borderDash: [5, 5],
                        }
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false, // Performance
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                    },
                    scales: {
                        x: { display: false },
                        y: {
                            display: false,
                            min: 0,
                            max: 100,
                        },
                    },
                },
            });
        }

        // Update
        const chart = chartInstance.current;
        if (chart && data.length > 0) {
            chart.data.labels = data.map((d) => new Date(d.timestamp).toLocaleTimeString());
            chart.data.datasets[0].data = data.map((d) => d.cpu);
            chart.data.datasets[1].data = data.map((d) => (d.memory * 100) / 16); // Normalize mem to 0-100 scale roughly
            chart.update("none"); // Efficient update
        }
    }, [data]);

    // Cleanup
    useEffect(() => {
        return () => {
            chartInstance.current?.destroy();
            chartInstance.current = null;
        };
    }, []);

    return (
        <div className="relative w-full h-full min-h-[200px] overflow-hidden rounded-lg bg-black/20 border border-emerald-500/10">
            <div className="absolute inset-0 bg-shell-grid bg-grid-tight opacity-20 pointer-events-none"></div>
            <canvas ref={canvasRef} />
            {/* Sheen effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-chart-sheen pointer-events-none"></div>
        </div>
    );
}
