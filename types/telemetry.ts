export interface ChartPoint {
    timestamp: number
    cpu: number
    memory: number
    value?: number // legacy support if needed
    label?: string // legacy support if needed
}

export interface TelemetrySnapshot {
    cpuUsage: number
    memoryUsage: number
    synapticThroughput: number
    subDermalLatency: number
    kernelState: "STABLE" | "DEGRADED" | "CRITICAL" | string
    linesAnalyzed: number
    chartHistory: ChartPoint[]
}
