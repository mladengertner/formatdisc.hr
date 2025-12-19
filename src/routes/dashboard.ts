import type { Request, Response } from "express";
import { getDashboardMetrics, getRecentScores } from "../lib/score-engine";

export function dashboardHandler(_req: Request, res: Response) {
    const metrics = getDashboardMetrics();
    const recent = getRecentScores(120); // last ~1 min (2 Hz × 120)
    res.status(200).json({ metrics, recent });
}
