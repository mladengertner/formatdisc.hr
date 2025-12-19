# SlavkoKernel v7 Integration Guide

## Overview

**SlavkoKernel v7** is a multi-agent orchestration backend that coordinates Write, Code, Think, Image, and Eval agents with council governance and cryptographic audit logs.

## Architecture

### Two Layers

1. **SlavkoClient (TS)** - Lightweight HTTP client for simple Ollama calls
2. **SlavkoKernel v7** - Full orchestration system with:
   - FastAPI backend
   - Council orchestrator
   - 5 specialized agents
   - Postgres + Redis
   - Prometheus + Grafana observability

## Setup

### 1. Clone and Run SlavkoKernel v7

```bash
git clone https://github.com/mladengertner/SlavkoKernel-v7.git
cd SlavkoKernel-v7
docker-compose up -d
```

### 2. Configure Environment

Add to `.env.local`:

```env
SLAVKO_BASE_URL=http://localhost:8000
SLAVKO_API_TOKEN=your_jwt_token
```

### 3. Use in Experiment Orchestrator

Add `slavko_pipeline` step to your experiment definition:

```json
{
  "id": "step-council",
  "type": "slavko_pipeline",
  "name": "SlavkoKernel Council Decision",
  "config": {
    "pipelineName": "slavko-demo",
    "authTokenEnvKey": "SLAVKO_API_TOKEN"
  }
}
```

## API Endpoints

### POST `/v1/council/run`

Runs a council orchestration on given pipeline and inputs.

**Request:**
```json
{
  "pipeline": "slavko-demo",
  "inputs": {
    "prompt": "Analyze this data..."
  }
}
```

**Response:**
```json
{
  "output": "Council decision output",
  "summary": "Brief summary",
  "council": {
    "quorum": 3,
    "threshold": 0.66,
    "votes": [
      {
        "agent": "write-agent",
        "vote": "approve",
        "confidence": 0.85
      }
    ],
    "decision": "approved"
  },
  "audit": {
    "run_id": "uuid",
    "pipeline": "slavko-demo",
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

## Visualizer Features

When a `slavko_pipeline` step executes:

- **Council Badge** - Displayed on step node
- **Decision Summary** - Shows quorum, threshold, and final decision
- **Vote Breakdown** - Tooltip displays all agent votes with confidence scores
- **Audit Trail** - Full JSON output available in tooltip

## Benefits

- **Reproducible AI Decisions** - Council governance ensures consistent outcomes
- **Explainable Results** - Every vote and decision is logged
- **Enterprise-Grade Audit** - Cryptographic signatures for compliance
- **Model-Agnostic** - Works with any Ollama model

## Next Steps

- Add custom pipelines in SlavkoKernel v7
- Configure council thresholds per use case
- Integrate audit logs with Supabase `agent_logs` table
- Add Grafana dashboards for SlavkoKernel metrics
