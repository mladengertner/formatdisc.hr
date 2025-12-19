export interface ScoreRecord {
    id: string
    createdAt: number
    userId?: string
    requestText: string
    responseText: string
    kernelState: string
    channel: string
    latencyMs: number
    tokensApprox: number
    cpuUsage: number
    subDermalLatency: number
    persona: string
    qualityScore: number
    efficiencyScore: number
    tensionScore: number
}
