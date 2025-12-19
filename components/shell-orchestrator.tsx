"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ShellChart } from "@/components/shell-chart"
import { Activity, Cpu, Zap, Database, Shield, Globe, Terminal, Layers } from "lucide-react"

interface TelemetryData {
    kernel: {
        version: string
        status: string
        uptime: string
        activeNodes: number
    }
    performance: {
        cpu: number
        memory: number
        latency: number
        throughput: number
    }
    governance: {
        opaStatus: string
        auditRate: number
        policyCompliance: number
    }
}

export function ShellOrchestrator() {
    const [data, setData] = useState<TelemetryData | null>(null)
    const [isLive, setIsLive] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/telemetry")
                const json = await res.json()
                setData(json)
            } catch (e) {
                console.error("Shell Telemetry Error:", e)
            }
        }

        fetchData()
        const interval = isLive ? setInterval(fetchData, 3000) : null
        return () => { if (interval) clearInterval(interval) }
    }, [isLive])

    if (!data) return (
        <div className="flex items-center justify-center p-24">
            <div className="flex flex-col items-center gap-4">
                <Terminal className="w-12 h-12 text-primary animate-pulse" />
                <p className="text-sm font-mono text-primary/50 animate-pulse tracking-widest uppercase">Initializing Shell Context...</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-8">
            {/* Header with Global Status */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-primary/5 border border-primary/20 rounded-3xl backdrop-blur-2xl">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(0,255,153,0.2)]">
                        <Layers className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-white tracking-tight">FormatDisc <span className="text-primary">Shell v12</span></h3>
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">ENTERPRISE-GRADE</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">Kernel Orchestration Kernel: <span className="text-primary/70">{data.kernel.version}</span> | Mode: <span className="text-primary/70 uppercase">High Reliability</span></p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">System Uptime</div>
                        <div className="text-lg font-bold text-white tabular-nums">{data.kernel.uptime}</div>
                    </div>
                    <div className="h-10 w-px bg-primary/20" />
                    <div className="text-right">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Active Clusters</div>
                        <div className="text-lg font-bold text-white tabular-nums">{data.kernel.activeNodes} Nodes</div>
                    </div>
                </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ShellChart title="Compute Overhead" color="rgb(0, 255, 153)" isActive={isLive} maxValue={100} unit="%" />
                <ShellChart title="Memory Allocation" color="rgb(34, 211, 238)" isActive={isLive} maxValue={100} unit="%" />
                <ShellChart title="Ingress Pipeline" color="rgb(168, 85, 247)" isActive={isLive} maxValue={2000} unit="req/s" />
                <ShellChart title="Edge Latency" color="rgb(249, 115, 22)" isActive={isLive} maxValue={50} unit="ms" />
            </div>

            {/* Governance & Real-time Metrics */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Governance Proof Card */}
                <Card className="bg-black/40 border-primary/20 backdrop-blur-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4">
                        <Shield className="w-12 h-12 text-primary/10" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            Governance Protocol
                        </CardTitle>
                        <CardDescription>ADR-004 Enforcement & OPA Compliance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono uppercase">
                                <span className="text-muted-foreground">Compliance Score</span>
                                <span className="text-primary">{data.governance.policyCompliance}%</span>
                            </div>
                            <Progress value={data.governance.policyCompliance} className="h-1.5 bg-primary/10" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                            <div className="space-y-1">
                                <div className="text-[10px] text-muted-foreground uppercase">OPA Status</div>
                                <div className="text-sm font-bold text-primary uppercase">{data.governance.opaStatus}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] text-muted-foreground uppercase">Audit Rate</div>
                                <div className="text-sm font-bold text-white">{data.governance.auditRate}% Stream</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Activity Card */}
                <Card className="lg:col-span-2 bg-black/40 border-primary/20 backdrop-blur-3xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                Global Orchestration Events
                            </CardTitle>
                            <CardDescription>Real-time system state transitions and kernel calls</CardDescription>
                        </div>
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className="text-[10px] font-mono border border-primary/20 px-2 py-1 rounded hover:bg-primary/10 transition-colors uppercase"
                        >
                            {isLive ? "Pause Feed" : "Stream Live"}
                        </button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-primary/5 border border-primary/10 group hover:border-primary/30 transition-all">
                                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,255,153,0.5)]" />
                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                        <div className="text-[10px] font-mono text-muted-foreground">T-{i * 120}MS</div>
                                        <div className="text-xs font-bold text-white uppercase tracking-wider">KERNEL_CALL::{i === 0 ? "OIDC_VERIFY" : i === 1 ? "SCHEMA_LOCK" : "METRICS_FLUSH"}</div>
                                        <div className="text-[10px] font-mono text-primary/70">NODE_{742 + i}</div>
                                        <div className="text-right flex justify-end">
                                            <Badge variant="outline" className="text-[9px] border-primary/20 h-5">SUCCESS</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-2 text-center">
                                <p className="text-[10px] font-mono text-muted-foreground uppercase animate-pulse">Waiting for next orchestration cycle...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
