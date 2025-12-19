/**
 * src/server.ts
 *
 * Enterprise Shell v3 – single‑process server
 *
 * • Express handles the API layer (telemetry SSE, fusion broker, score, dashboard).
 * • Next.js serves the React UI (pages, components) on the same HTTP listener.
 * • A singleton `telemetrySimulator` drives the 2 Hz random‑walk and pushes updates via SSE.
 * • Health‑check endpoints are exposed for liveness and readiness.
 * • The server starts the telemetry loop once at launch.
 */

import express, { Request, Response } from "express";
import next from "next";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";

import { telemetrySimulator } from "./services/telemetrySimulator";
import { telemetryHandler } from "./routes/telemetry";
import { fusionHandler } from "./routes/fusion";
import { scoreHandler } from "./routes/score";
import { dashboardHandler } from "./routes/dashboard";
import { devSimulateHandler } from "./routes/_dev";

/* --------------------------------------------------------------
   Load environment variables (e.g. PORT, API keys)
   -------------------------------------------------------------- */
dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);

/* --------------------------------------------------------------
   Initialise Next.js (pages live under ./src)
   -------------------------------------------------------------- */
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

/* --------------------------------------------------------------
   Main async bootstrap – we must await nextApp.prepare()
   -------------------------------------------------------------- */
(async () => {
    try {
        // Wait for Next.js to finish its internal compilation
        await nextApp.prepare();

        const app = express();

        /* --------------------------- middlewares --------------------------- */
        app.use(cors());                                   // allow cross‑origin requests
        app.use(compression());                            // gzip / brotli compression
        app.use(express.json({ limit: "2mb" }));           // JSON body parser
        app.use(express.urlencoded({ extended: false })); // URL‑encoded bodies

        /* -------------------------- health‑checks -------------------------- */
        // Liveness probe – always returns 200 if the process is alive
        app.get("/healthz", (_: Request, res: Response) => res.status(200).send("OK"));

        // Readiness probe – ensures the telemetry simulator is functional
        app.get("/readiness", (_: Request, res: Response) => {
            const ready =
                typeof telemetrySimulator.getSnapshot === "function" &&
                telemetrySimulator.getSnapshot() !== undefined;
            res.status(ready ? 200 : 503).send(ready ? "READY" : "NOT READY");
        });

        /* ------------------------------ API ------------------------------ */
        // Server‑Sent Events stream for live telemetry (2 Hz)
        app.get("/api/telemetry", telemetryHandler);

        // Fusion broker – POST {message, userId?}
        app.post("/api/fusion", fusionHandler);

        // Score summary – KPI aggregates
        app.get("/api/score", scoreHandler);

        // Dashboard – recent telemetry + per‑hour metrics
        app.get("/api/dashboard", dashboardHandler);

        // Dev - Simulator injection
        app.post("/api/_dev/simulate", devSimulateHandler);

        /* --------------------------- Next pages --------------------------- */
        // All other routes fall back to Next.js page handling
        app.all("*", (req, res) => handle(req, res));

        /* ----------------------- start telemetry loop ---------------------- */
        telemetrySimulator.start();

        /* ---------------------------- launch ------------------------------ */
        app.listen(port, () => {
            console.log(
                `🚀 Enterprise Shell v3 listening on http://localhost:${port} (${dev ? "dev" : "prod"})`
            );
            console.log(`   • Health:   http://localhost:${port}/healthz`);
            console.log(`   • Readiness: http://localhost:${port}/readiness`);
            console.log(`   • Telemetry SSE: http://localhost:${port}/api/telemetry`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
})();
