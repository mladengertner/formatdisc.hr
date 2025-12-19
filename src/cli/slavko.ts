#!/usr/bin/env node
import { program } from "commander";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

// Helper for spawning commands
const run = (cmd: string, args: string[]) => {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(cmd, args, { stdio: "inherit", shell: true });
        child.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${cmd} exited with code ${code}`));
        });
    });
};

program
    .name("slavko")
    .description("Enterprise Shell v3 CLI")
    .version("3.0.0");

program
    .command("doctor")
    .description("Check environment health")
    .action(() => {
        console.log("🏥 Running Doctor...");
        const checks = [
            { name: "package.json", pass: fs.existsSync("package.json") },
            { name: "src/server.ts", pass: fs.existsSync("src/server.ts") },
            { name: "tailwind.config.ts", pass: fs.existsSync("tailwind.config.ts") },
        ];
        checks.forEach((c) => {
            console.log(`${c.pass ? "✅" : "❌"} ${c.name}`);
        });
        if (checks.every((c) => c.pass)) console.log("✨ All systems operational.");
        else process.exit(1);
    });

program
    .command("deploy")
    .description("Build and containerize")
    .action(async () => {
        console.log("🚀 Starting deployment sequence...");
        try {
            console.log("1. Linting...");
            await run("npm", ["run", "lint"]);
            console.log("2. Type Checking...");
            await run("npm", ["run", "type-check"]);
            console.log("3. Building Next.js...");
            await run("npm", ["run", "build"]);
            console.log("4. Building Docker Image...");
            await run("docker", ["build", "-t", "formatdisc-hr:latest", "."]);
            console.log("🌟 Deployment ready: formatdisc-hr:latest");
        } catch (e: any) {
            console.error("💥 Deployment failed:", e.message);
            process.exit(1);
        }
    });

program
    .command("status")
    .description("Show local status (stub)")
    .action(() => {
        console.log("Local system status: NORMAL (Simulation)");
    });

program.parse();
