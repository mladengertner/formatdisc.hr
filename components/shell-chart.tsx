"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState, useRef } from "react"

interface DataPoint {
    time: number
    value: number
}

interface ShellChartProps {
    title: string
    color: string
    isActive: boolean
    maxValue?: number
    unit?: string
}

export function ShellChart({ title, color, isActive, maxValue = 100, unit = "%" }: ShellChartProps) {
    const [data, setData] = useState<DataPoint[]>([])
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!isActive) return

        const interval = setInterval(() => {
            setData((prev) => {
                const base = maxValue * 0.4
                const varience = maxValue * 0.2
                const newValue = base + Math.random() * varience + (Math.sin(Date.now() / 1000) * varience)
                const newData = [...prev, { time: Date.now(), value: Math.min(newValue, maxValue) }]
                return newData.slice(-60) // Keep last 60 points
            })
        }, 150)

        return () => clearInterval(interval)
    }, [isActive, maxValue])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || data.length === 0) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height
        const dpr = window.devicePixelRatio || 1

        // Set display size
        canvas.style.width = width + "px"
        canvas.style.height = height + "px"

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Draw grid
        ctx.strokeStyle = "rgba(0, 255, 153, 0.05)"
        ctx.lineWidth = 1
        for (let i = 0; i < 5; i++) {
            const y = (height / 4) * i
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.stroke()
        }

        // Draw line
        ctx.strokeStyle = color
        ctx.shadowBlur = 10
        ctx.shadowColor = color
        ctx.lineWidth = 2
        ctx.beginPath()

        data.forEach((point, i) => {
            const x = (i / (data.length - 1)) * width
            const y = height - (point.value / maxValue) * height

            if (i === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        })

        ctx.stroke()
        ctx.shadowBlur = 0 // Reset shadow

        // Draw gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        const rgbaColor = color.replace("rgb", "rgba").replace(")", ", 0.2)")
        gradient.addColorStop(0, rgbaColor)
        gradient.addColorStop(1, "rgba(0, 255, 153, 0)")

        ctx.fillStyle = gradient
        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()
        ctx.fill()
    }, [data, color, maxValue])

    return (
        <Card className="relative overflow-hidden border-primary/10 bg-black/40 backdrop-blur-xl group hover:border-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-mono text-primary uppercase tracking-tighter">{title}</h3>
                        <div className="text-2xl font-bold tabular-nums text-white">
                            {data.length > 0 ? data[data.length - 1].value.toFixed(1) : "0.0"}
                            <span className="text-xs font-normal text-muted-foreground ml-1 uppercase">{unit}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {isActive && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-primary/50 uppercase">Live Stream</span>
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,255,153,0.8)]" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="h-[120px] w-full">
                    <canvas ref={canvasRef} width={400} height={120} className="w-full h-full opacity-80" />
                </div>
            </div>
        </Card>
    )
}
