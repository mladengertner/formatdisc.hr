

import type {
    FusionRequest,
    FusionResponse,
    FusionRouteDecision,
} from "../types/fusion";
import type { TelemetrySnapshot } from "../types/telemetry";
import type { ScoreRecord } from "../types/score";

/* ---------- SQLite init with Fallback ---------- */
let db: any = null;
let insertStmt: any = null;
let summaryStmt: any = null;
let recentStmt: any = null;
let dashboardMetricsStmt: any = null;

try {
    // Use eval('require') to prevent Webpack from bundling node modules
    const req = eval('require');
    const fs = req("node:fs");
    const path = req("node:path");
    const Database = req("better-sqlite3");
    const DB_DIR = path.join(process.cwd(), "data");
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    const DB_PATH = path.join(DB_DIR, "score.db");

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
        id TEXT PRIMARY KEY,
        createdAt INTEGER,
        userId TEXT,
        requestText TEXT,
        responseText TEXT,
        kernelState TEXT,
        channel TEXT,
        latencyMs INTEGER,
        tokensApprox INTEGER,
        cpuUsage REAL,
        subDermalLatency REAL,
        persona TEXT,
        qualityScore REAL,
        efficiencyScore REAL,
        tensionScore REAL
    );
    `);

    /* ---------- Prepared statements ---------- */
    insertStmt = db.prepare(`
    INSERT INTO scores (
        id, createdAt, userId, requestText, responseText, kernelState,
        channel, latencyMs, tokensApprox, cpuUsage, subDermalLatency,
        persona, qualityScore, efficiencyScore, tensionScore
    ) VALUES (
        @id, @createdAt, @userId, @requestText, @responseText, @kernelState,
        @channel, @latencyMs, @tokensApprox, @cpuUsage, @subDermalLatency,
        @persona, @qualityScore, @efficiencyScore, @tensionScore
    );
    `);

    summaryStmt = db.prepare(`
    SELECT
        COUNT(*) AS totalInteractions,
        AVG(qualityScore) AS avgQuality,
        AVG(efficiencyScore) AS avgEfficiency,
        AVG(tensionScore) AS avgTension,
        AVG(latencyMs) AS avgLatency,
        AVG(cpuUsage) AS avgCpu,
        AVG(subDermalLatency) AS avgSubLatency
    FROM scores;
    `);

    recentStmt = db.prepare(`
    SELECT createdAt, cpuUsage, subDermalLatency
    FROM scores
    ORDER BY createdAt DESC
    LIMIT ?;
    `);

    dashboardMetricsStmt = db.prepare(`
    SELECT
        COUNT(*) AS total,
        AVG(qualityScore) AS avgQuality,
        AVG(efficiencyScore) AS avgEfficiency,
        AVG(tensionScore) AS avgTension,
        AVG(latencyMs) AS avgLatency,
        AVG(cpuUsage) AS avgCpu,
        AVG(subDermalLatency) AS avgSubLatency,
        SUM(CASE WHEN kernelState='CRITICAL' THEN 1 ELSE 0 END) AS criticalCount,
        SUM(CASE WHEN kernelState='WARN' THEN 1 ELSE 0 END) AS warnCount
    FROM scores
    WHERE createdAt > ?
    `);

    console.log("[Score Engine] SQLite initialized successfully.");

} catch (e: any) {
    console.error("[Score Engine] SQLite init failed (probably build missing). Running in IN-MEMORY/NO-OP mode.", e.message);
}

/* ---------- KPI plug‑ins (pure functions) ---------- */
function qualityPlugin({ request, response }: { request: FusionRequest; response: FusionResponse }): number {
    const lenPenalty = response.content.length < 16 ? 0.4 : response.content.length > 1200 ? 0.7 : 1;
    const latencyPenalty = response.latencyMs > 2500 ? 0.5 : response.latencyMs > 1200 ? 0.7 : 1;
    const density = request.message.length / Math.max(1, response.content.length);
    const densityBoost = density < 0.4 ? 1.05 : density > 2 ? 0.8 : 1;
    return Number((0.9 * lenPenalty * latencyPenalty * densityBoost).toFixed(3));
}

function efficiencyPlugin({ response, kernel }: { response: FusionResponse; kernel: TelemetrySnapshot }): number {
    const tokenFactor = Math.max(0.2, 1 - response.meta.tokensApprox / 5000);
    const latencyFactor = Math.max(0.2, 1 - response.latencyMs / 5000);
    const cpuFactor = Math.max(0.2, 1 - kernel.cpuUsage / 150);
    return Number(
        Math.min(1, (1 / Math.log2(response.meta.tokensApprox + 4)) * latencyFactor * cpuFactor * tokenFactor
        ).toFixed(3)
    );
}

function tensionPlugin({ kernel }: { kernel: TelemetrySnapshot }): number {
    const cpuT = kernel.cpuUsage / 100;
    const latT = kernel.subDermalLatency / 40;
    const stateBoost = kernel.kernelState === "CRITICAL" ? 0.3 : 0;
    return Number(Math.min(1, cpuT * 0.6 + latT * 0.4 + stateBoost).toFixed(3));
}

/* ---------- Public API ---------- */
export async function recordScore(payload: {
    request: FusionRequest;
    response: FusionResponse;
    kernel: TelemetrySnapshot;
    route: FusionRouteDecision;
}) {
    const qualityScore = qualityPlugin(payload);
    const efficiencyScore = efficiencyPlugin(payload);
    const tensionScore = tensionPlugin(payload);

    const rec: ScoreRecord = {
        id: `score_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        userId: payload.request.userId,
        requestText: payload.request.message,
        responseText: payload.response.content,
        kernelState: payload.kernel.kernelState,
        channel: payload.route.channel,
        latencyMs: payload.response.latencyMs,
        tokensApprox: payload.response.meta.tokensApprox,
        cpuUsage: payload.kernel.cpuUsage,
        subDermalLatency: payload.kernel.subDermalLatency,
        persona: payload.route.persona,
        qualityScore,
        efficiencyScore,
        tensionScore,
    };

    if (insertStmt) {
        insertStmt.run(rec);
    } else {
        // console.log("[Score Engine] NO-OP record:", rec.id);
    }
}

/* ---------- Summaries for the UI ---------- */
export function getScoreSummary() {
    if (summaryStmt) return summaryStmt.get();
    return { totalInteractions: 0 };
}

/* ---------- Recent data for live charts ---------- */
export function getRecentScores(limit = 120) {
    if (recentStmt) return recentStmt.all(limit).reverse();
    return [];
}

/* ---------- Dashboard aggregates (last hour) ---------- */
export function getDashboardMetrics() {
    if (dashboardMetricsStmt) {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        return dashboardMetricsStmt.get(oneHourAgo);
    }
    return {};
}
