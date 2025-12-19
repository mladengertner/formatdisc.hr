#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const distPath = path.join(__dirname, "../dist/cli/slavko.js");
const tsPath = path.join(__dirname, "../src/cli/slavko.ts");

// Prefer compiled JS if available (production), else valid TS setup or error
if (fs.existsSync(distPath)) {
    require(distPath);
} else {
    // Fallback: try running with tsx/ts-node if provided, or assume 'npm run build' is needed
    console.log("⚠️  Compiled CLI not found at dist/cli/slavko.js");
    console.log("👉  Running 'npm run build' to compile source...");

    // Spawn build
    const child = spawn("npm", ["run", "build"], { stdio: "inherit", shell: true });
    child.on("close", (code) => {
        if (code === 0) {
            console.log("✅  Build complete. Rerunning CLI...");
            try {
                require(distPath);
            } catch (e) {
                console.error("Still cannot find CLI after build:", e);
            }
        } else {
            console.error("Build failed.");
            process.exit(code);
        }
    });
}
