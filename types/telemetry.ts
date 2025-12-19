
export interface ChartPoint {
  /** Epoch ms – used as the X‑axis. */
  ts: number;
  /** CPU % (0‑100). */
  cpu: number;
  /** Memory GB. */
  mem: number;
}

export interface TelemetrySnapshot {
  /** CPU usage as a percentage (0‑100). */
  cpuUsage: number;
  /** Memory usage in gigabytes. */
  memoryUsage: number;
  /** Synaptic throughput (operations per second). */
  synapticThroughput: number;
  /** Sub‑dermal latency in milliseconds. */
  subDermalLatency: number;
  /** Cumulative lines analysed. */
  linesAnalyzed: number;
  /** Kernel state – mirrors SlavkoKernel v7 terminology. */
  kernelState: "INITIALIZING" | "STABLE" | "LOADED" | "CRITICAL";
  /** Rolling history for the chart (last ~30 s). */
  chartHistory: ChartPoint[];
}
