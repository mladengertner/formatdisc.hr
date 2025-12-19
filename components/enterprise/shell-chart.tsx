"use client"

import { useEffect, useRef } from "react";
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Tooltip,
    Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { ChartPoint } from "@/types/telemetry";

Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Filler);

type Props = {
    /** History buffer – already limited to ~30 s by the backend. */
    data: ChartPoint[];
};

export default function ShellChart({ data }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    // 1️⃣  Initialise / update the chart whenever `data` changes
    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        // If the chart already exists, just update its datasets
        if (chartRef.current) {
            chartRef.current.data.labels = data.map((p) => new Date(p.ts));
            chartRef.current.data.datasets[0].data = data.map((p) => p.cpu);
            chartRef.current.data.datasets[1].data = data.map((p) => p.mem);
            chartRef.current.update("none");
            return;
        }

        // First‑time creation
        chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: data.map((p) => new Date(p.ts)),
                datasets: [
                    {
                        label: "CPU % (core)",
                        data: data.map((p) => p.cpu),
                        borderColor: "#6366F1",
                        backgroundColor: "#6366F133",
                        tension: 0.3,
                        fill: true,
                    },
                    {
                        label: "Memory (GB)",
                        data: data.map((p) => p.mem),
                        borderColor: "#F59E0B",
                        backgroundColor: "#F59E0B33",
                        tension: 0.3,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 500,
                    easing: "easeOutQuart",
                },
                scales: {
                    x: {
                        type: "time",
                        time: { unit: "second", displayFormats: { second: "HH:mm:ss" } },
                        grid: { display: false },
                        ticks: { color: "#cbd5e1" },
                    },
                    y: {
                        beginAtZero: true,
                        max: 100, // CPU is a percentage
                        grid: { color: "#33415533" },
                        ticks: { color: "#cbd5e1" },
                    },
                },
                plugins: {
                    tooltip: {
                        mode: "index",
                        intersect: false,
                        backgroundColor: "#111827dd",
                        titleColor: "#fff",
                        bodyColor: "#e5e7eb",
                    },
                    legend: {
                        labels: { color: "#e5e7eb" },
                    },
                },
            },
        });
    }, [data]);

    // 2️⃣  Clean up on unmount
    useEffect(() => {
        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, []);

    return (
        <div className="relative h-64 w-full">
            <canvas ref={canvasRef} />
        </div>
    );
}
