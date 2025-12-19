import path from "node:path";
import fs from "node:fs";

// Safe import pattern for better-sqlite3 in enviroments that might not support native bindings
let Database: any;
try {
    Database = require("better-sqlite3");
} catch (e) {
    Database = null;
}

import type {
    FusionRequest,
    FusionResponse,
    FusionRouteDecision,
} from "@/types/fusion";
import type { TelemetrySnapshot } from "@/types/telemetry";
import type { ScoreRecord } from "@/types/score";

/* ---------- SQLite init ---------- */
let db: any = null;
let insertStmt: any = null;
let summaryStmt: any = null;

function initDB() {
    if (!Database) {
        console.warn("better-sqlite3 not found, persistent scoring disabled.");
        return;
    }

    try {
        const dataDir = path.resolve(process.cwd(), "data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        db = new Database(path.join(dataDir, "score.db"));
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
        AVG(subDermalLatency) AS avgLatencySub
      FROM scores;
    `);

    } catch (e) {
        console.error("Failed to initialize Score DB:", e);
        db = null;
    }
}

// Initialize on module load
initDB();

/* ---------- Scoring helpers ---------- */
function qualityScore(payload: {
    response: FusionResponse;
    request: FusionRequest;
}): number {
    const lenPenalty = payload.response.content.length < 16 ? 0.4 : payload.response.content.length > 1200 ? 0.7 : 1;
    const latencyPenalty = payload.response.latencyMs > 2500 ? 0.5 : payload.response.latencyMs > 1200 ? 0.7 : 1;
    const density = payload.request.message.length / Math.max(1, payload.response.content.length);
    const densityBoost = density < 0.4 ? 1.05 : density > 2 ? 0.8 : 1;
    return Number((0.9 * lenPenalty * latencyPenalty * densityBoost).toFixed(3));
}

function efficiencyScore(payload: {
    response: FusionResponse;
    kernel: TelemetrySnapshot;
}): number {
    const tokenFactor = Math.max(0.2, 1 - payload.response.meta.tokensApprox / 5000);
    const latencyFactor = Math.max(0.2, 1 - payload.response.latencyMs / 5000);
    const cpuFactor = Math.max(0.2, 1 - payload.kernel.cpuUsage / 150);
    // Logarithmic scaling for tokens
    return Number(Math.min(1, (1 / Math.log2(payload.response.meta.tokensApprox + 4)) * latencyFactor * cpuFactor).toFixed(3));
}

function tensionScore(payload: { kernel: TelemetrySnapshot }): number {
    const cpuT = payload.kernel.cpuUsage / 100;
    const latT = payload.kernel.subDermalLatency / 40;
    const stateBoost = payload.kernel.kernelState === "CRITICAL" ? 0.3 : 0;
    return Number(Math.min(1, cpuT * 0.6 + latT * 0.4 + stateBoost).toFixed(3));
}

/* ---------- Public API ---------- */
export async function recordScore(payload: {
    request: FusionRequest;
    response: FusionResponse;
    kernel: TelemetrySnapshot;
    route: FusionRouteDecision;
}): Promise<void> {
    const qs = qualityScore({ request: payload.request, response: payload.response });
    const es = efficiencyScore({ response: payload.response, kernel: payload.kernel });
    const ts = tensionScore({ kernel: payload.kernel });

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
        qualityScore: qs,
        efficiencyScore: es,
        tensionScore: ts,
    };

    if (insertStmt) {
        try {
            insertStmt.run(rec);
        } catch (e) {
            console.error("DB Insert Failed:", e);
        }
    } else {
        // Fallback/Mock persistence if needed, or just log
        // console.log("[Score Engine] Recorded safely (No DB):", rec.id);
    }
}

export function getScoreSummary() {
    if (summaryStmt) {
        try {
            return summaryStmt.get();
        } catch (e) {
            console.error("DB Select Failed:", e);
            return {};
        }
    }
    return {
        totalInteractions: 0,
        avgQuality: 0,
        avgEfficiency: 0,
        avgTension: 0,
    };
}
