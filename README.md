# Enterprise Shell v3

A production‑grade, real‑time full‑stack platform built with:

- **Next.js 14** + **React** (Tailwind UI, ARIA, high‑contrast animations)
- **Express** (API layer, Server‑Sent Events)
- **SQLite** (audit‑proof score store; optional on Windows)
- **CLI** (`slavko`) for health checks, status, simulation and Docker helpers
- **Docker** multi‑stage build
- **GitHub Actions** CI pipeline

## Prerequisites

- **Node ≥ 20** (LTS)
- **npm ≥ 9**
- (Optional) `better-sqlite3` native binary – required only for persistence.
  - On Linux/macOS: `npm i` works out‑of‑the‑box.
  - On Windows: either install the pre‑built binary  
    `npm i better-sqlite3@9.0.0 --platform=win32 --arch=x64`  
    or run with `--ignore-scripts` (the app will operate in‑memory).

## Development

```bash
# 1️⃣ Clone & install
git clone <repo‑url>
cd enterprise-shell
npm ci               # --ignore-scripts if you hit native‑module errors

# 2️⃣ Run the dev server (hot‑reload)
npm run dev
# → http://localhost:3000
```

## Production (Docker)

```bash
docker build -t enterprise-shell .
docker run -d -p 3000:3000 enterprise-shell
```

## CLI usage

The CLI is compiled to `bin/slavko-shell.js` and exposed via the `slavko` binary.

```bash
# Show available commands
npx slavko --help

# Health‑check the running server
npx slavko doctor

# Print the latest telemetry snapshot
npx slavko status

# Simulate a custom telemetry state (dev only)
npx slavko simulate --cpu 85 --latency 22 --state WARN

# Show aggregated KPI summary
npx slavko metrics

# Build and push a Docker image (local)
npx slavko deploy --tag myorg/enterprise-shell:latest
```

## Testing

```bash
npm test
```

## License

MIT – feel free to fork, extend, and ship your own version of the Enterprise Shell! 🚀
