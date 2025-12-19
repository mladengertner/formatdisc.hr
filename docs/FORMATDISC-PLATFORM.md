# FORMATDISC Platform — Operational Architecture

FORMATDISC is not a "website". It is a **governance-locked, audit-ready SaaS operations platform** designed for master-consultant work.

## 1. High-level Overview

**Purpose:** Turn every engagement into a deterministic, auditable, and reproducible system — from first diagnostic audit to deployed SaaS.

**Core Pillars:**
- Internationalization (EN/HR) with SSR language detection
- Founder's Edition slot engine with real-time counters
- Pricing engine with ×3 escalation after 100 builds
- Stripe payments (checkout + webhook) with governance hooks
- JWT-based route protection with AES-256-GCM encryption
- Audit logging with ledger viewer and diagnostic audits
- Governance pipeline (0–48h) expressed in UI, CLI, and artifacts

## 2. Architecture Layers

### 2.1 Presentation Layer (Next.js 15 + Tailwind)

**Landing Page:** `/`
- Hero (identity + value prop)
- Problem (why companies fail)
- 3-Layer Model (symptoms → root cause → architecture)
- 24h Diagnostic Audit
- Case Studies
- Pricing (Founder's Edition)
- FAQ
- Contact

**Dashboard (Founder Console):** `/founder`
- Slots state
- Pricing & escalation status
- Ledger events
- Diagnostic audits

### 2.2 Slot Engine & Pricing

**Slot Engine** (`lib/slotLedger.ts`):
- Uses Redis for `slots:used` counter and `slots:ledger` events
- Total slots: 100
- `remaining = total - used`
- `escalationTriggered = used >= total`

**Pricing Engine** (`lib/pricingEngine.ts`):
- Base prices: starter €999, pro €3,999, enterprise €7,999, premium €14,999
- Escalated: base ×3
- Active price depends on `escalationTriggered`

### 2.3 Payments (Stripe)

- Checkout: `/api/stripe/checkout` - validates tier and slot availability
- Webhook: `/api/stripe/webhook` - claims slot and logs audit event on `checkout.session.completed`

### 2.4 Security & Auth

- Environment validation via `validateEnv()`
- JWT auth with `lib/jwt.ts`
- Middleware guards `/dashboard`, `/admin`, `/audit`, `/founder`
- AES-256-GCM encryption for sensitive payloads

### 2.5 Audit Logging & Ledger

- Audit logger writes events to Redis (`audit:events`)
- Ledger viewer UI consumes `/api/ledger`
- Audit v2 provides typed model with dimension, severity, impact, and tier recommendations

## 3. Governance Pipeline (0–48h)

**Phases:**
- 0–6h: System mapping, observation, hidden pain extraction
- 6–12h: 3-layer architecture mapping
- 12–24h: Governance & audit schema design
- 24–36h: Implementation under governance rules
- 36–42h: Deterministic deployment & verification
- 42–48h: Observability + compliance artifacts

## 4. Operational Guarantees

When fully configured:
- Every payment → recorded in Stripe, slot ledger, and audit log
- Every slot → visible in landing, dashboard, CLI
- Every diagnostic audit → generates artifact and ledger event
- Every protected route → gated by JWT middleware
- Every environment misconfiguration → caught before runtime

This platform proves: you think in systems, design with governance, execute with traceability.
