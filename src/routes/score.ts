import type { Request, Response } from "express";
import { getScoreSummary } from "../lib/score-engine";

export function scoreHandler(_req: Request, res: Response) {
    const summary = getScoreSummary();
    res.status(200).json(summary);
}
