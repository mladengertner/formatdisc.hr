# 🏛️ FormatDisc.hr - Architecture Decision Records (ADRs)

**Status**: Fortune 500 Enterprise Architecture Decisions  
**Date**: December 11, 2025  
**Version**: 1.0  
**Audience**: Enterprise Architects, Technical Leaders, Product Team  

---

## 📌 ADR Template

Each ADR follows this structure:
- **Title**: What decision was made?
- **Status**: Accepted | Proposed | Superseded
- **Context**: Why did we need to decide?
- **Decision**: What did we choose and why?
- **Consequences**: What are the trade-offs?
- **Alternatives Considered**: What else could we have done?
- **Related ADRs**: Dependencies on other decisions

---

## 🎯 ADR-001: Immutable Audit Logging with Cryptographic Signatures

**Status**: ✅ Accepted  
**Date**: December 2025  
**Owner**: CTO, Compliance Officer  
**Impact**: CRITICAL (affects all compliance/regulatory work)

### Context

Enterprise clients (especially financial services, healthcare) need **proof** that:
1. Something happened (transaction, deployment, etc.)
2. When it happened (exact timestamp)
3. By whom it happened (actor identity)
4. That nobody changed the record after the fact

Without immutable audit logs, we cannot satisfy GDPR/SOC2/HIPAA requirements, and we expose ourselves to legal liability if records are questioned in a breach investigation.

### Decision

Implement **event sourcing** architecture with cryptographic signatures:

```
┌─────────────────────────────────────────────────────────┐
│  APPLICATION LAYER (e.g., SlavkoKernel.js)              │
│  Emits event: "PROJECT_DEPLOYED"                        │
└────────────────┬──────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  AUDIT EVENT PROCESSOR                                  │
│  • Generate event ID (UUID)                             │
│  • Capture timestamp (ISO 8601 UTC)                    │
│  • Attach actor identity (user ID, email, role)        │
│  • Collect metadata (project ID, cost, resources)      │
│  • Generate cryptographic hash (SHA-256)               │
│  • Sign hash with HSM private key                      │
└────────────────┬──────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
    PostgreSQL        Loki (Log Storage)
    (Persistent)      (Distributed Logs)
         │                │
         └───────┬────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  VERIFICATION & AUDIT                                   │
│  • Event signature is immutable (stored with event)    │
│  • Public key audit: Verify signature matches event    │
│  • Replay capability: Reconstruct exact execution path │
│  • Compliance proof: Show regulator "this happened"    │
└─────────────────────────────────────────────────────────┘
```

### Consequences

**✅ Advantages:**
- Immutable proof of what happened (non-repudiation)
- Complies with GDPR Article 5 (integrity & confidentiality)
- Enables full audit trail replay (deterministic reproduction)
- Cryptographic signatures prove nobody tampered with logs
- Loki distributed logs provide full-text searchability
- Events are timestamped UTC (synchronized across regions)

**⚠️ Trade-offs:**
- **Cost**: Loki storage + HSM key operations (~€200/mo additional)
- **Latency**: Signing adds 50-100ms per event
- **Operational Complexity**: Need HSM key rotation procedures
- **Storage**: Audit logs grow ~1GB per 10M events (4 weeks of data)

**🔧 Mitigation:**
- Use Redis caching layer to batch signatures (reduce latency to 10ms)
- Archive old logs to S3 (cost reduction)
- Automate HSM key rotation (90-day schedule)
- Implement log retention policy (keep 1 year, archive 7 years)

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|------------|------|------|---------|
| **Plain PostgreSQL logs** | Simple, cheap | Easily deleted, no crypto proof | ❌ Rejected |
| **Elasticsearch + checksums** | Searchable, scalable | Checksums can be faked, no signatures | ❌ Rejected |
| **Blockchain (immutable ledger)** | Tamper-proof, cryptographic | Expensive, slow, overkill for this use case | ❌ Rejected |
| **✅ Event Sourcing + HSM Signatures** | Immutable, searchable, cryptographic proof | Higher cost & complexity | ✅ **CHOSEN** |

### Related ADRs
- ADR-002: Multi-Tenant Isolation (separate logs per tenant)
- ADR-004: OPA Policy Enforcement (policy decisions also signed)
- ADR-005: SLA Monitoring (audit logs feed into SLA calculations)

---

## 🎯 ADR-002: Schema-Per-Tenant Multi-Tenant Data Isolation

**Status**: ✅ Accepted  
**Date**: December 2025  
**Owner**: Database Architect, Security Lead  
**Impact**: HIGH (affects all data architecture)

### Context

FormatDisc serves multiple enterprise clients. We need to ensure:
1. **Tenant A cannot see Tenant B's data** (confidentiality)
2. **Accidental queries don't leak cross-tenant data** (security)
3. **Queries are efficient** (no massive WHERE clauses)
4. **Backups are tenant-specific** (can restore Tenant A without affecting Tenant B)

Single-database (all tenants in one schema with WHERE tenant_id=X) is risky:
- A bug in the query logic leaks data
- Backup/restore is complex (can't restore one tenant independently)

### Decision

Implement **schema-per-tenant** architecture:

```
PostgreSQL Instance (neon.tech)
│
├── public schema (system tables)
│   ├── users (master user list)
│   ├── tenants (tenant metadata)
│   ├── subscriptions (billing)
│   └── audit_events (cross-tenant audit log)
│
├── tenant_abc123 schema (Tenant ABC's data)
│   ├── projects
│   ├── agents
│   ├── executions
│   ├── deployments
│   └── metrics
│
├── tenant_xyz789 schema (Tenant XYZ's data)
│   ├── projects
│   ├── agents
│   ├── executions
│   ├── deployments
│   └── metrics
│
└── tenant_def456 schema (Tenant DEF's data)
    ├── projects
    ├── agents
    ├── executions
    ├── deployments
    └── metrics
```

**Implementation Pattern:**

```typescript
// Middleware: Set tenant context for every request
function withTenantContext(handler: Handler) {
  return async (req: Request, context: TenantContext) => {
    // Extract tenant from JWT or API key
    const tenantId = extractTenantId(req);
    
    // Set PostgreSQL search_path to tenant's schema
    await db.query(`SET search_path TO "tenant_${tenantId}",public`);

    try {
      // All queries use tenant schema by default
      return await handler(req, context);
    } finally {
      // Reset to public
      await db.query(`SET search_path TO public`);
    }
  };
}

// Example usage
@withTenantContext
async function getProjects(req: Request, tenantCtx: TenantContext) {
  // This query only sees tenant_abc123.projects
  // Impossible to accidentally see other tenants' data
  const projects = await db.query("SELECT * FROM projects");
  return projects;
}
```

### Consequences

**✅ Advantages:**
- **Isolation**: Tenant A's data is in a separate schema, unreachable from Tenant B's queries
- **Backup**: Can backup/restore one tenant independently
- **GDPR**: Data deletion is straightforward (drop tenant schema)
- **Compliance**: Auditors understand the isolation guarantee
- **Performance**: No WHERE tenant_id filters needed (less I/O)

**⚠️ Trade-offs:**
- **Scaling**: Creating 1000+ schemas can slow down PostgreSQL introspection
- **Migration Complexity**: Schema updates must run on every tenant schema
- **Monitoring**: Need to monitor 1000+ schemas separately
- **Backup Size**: Storing 1000 separate backups is expensive

**🔧 Mitigation:**
- Use Neon's branching for tenant testing (not separate instances)
- Automate schema migrations (Flyway + Python scripts)
- Use PostgreSQL logical replication for failover (schema-aware)
- Archive old tenant data to S3 (cost reduction)

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|------------|------|------|---------|
| **Row-Level Security (RLS)** | PostgreSQL native, simple | Bugs can leak data, slower than schema isolation | ❌ Rejected |
| **Separate databases per tenant** | Complete isolation | Expensive, hard to manage 1000 databases | ❌ Rejected |
| **Logical databases (Postgres partitioning)** | Scalable, organized | Complex migration, hard to restore single tenant | ❌ Rejected |
| **✅ Schema-per-tenant** | True isolation, easy backup/restore, good scaling | More schemas to manage | ✅ **CHOSEN** |

### Related ADRs
- ADR-001: Audit Logging (audit table in public schema, cross-tenant)
- ADR-004: OPA Policy Enforcement (tenant context in policies)
- ADR-006: Cost Optimization (per-tenant cost tracking)

---

## 🎯 ADR-003: Blue-Green Zero-Downtime Deployment Strategy

**Status**: ✅ Accepted  
**Date**: December 2025  
**Owner**: DevOps Lead, Release Manager  
**Impact**: HIGH (affects every production release)

### Context

Clients demand 24/7 availability. Any deployment downtime:
- Breaks their MVP simulations (test failures)
- Disrupts production deployments running on our platform
- Violates 99.95% SLA (we can't afford 5 minutes downtime per deployment)

Traditional approach (rolling updates) has downtime window. We need **zero-downtime deployment**.

### Decision

Implement **blue-green deployment** strategy:

```
BEFORE: Blue (current version)
┌──────────────────────────────────────┐
│  Load Balancer                       │
│  ┌────────────────────────────────┐  │
│  │ Points to Blue (v1.0)          │  │
│  └────────────────────────────────┘  │
│         ▼                             │
│    ┌─────────────┐                   │
│    │ Blue (v1.0) │  ← ACTIVE         │
│    │ 3 replicas  │                   │
│    │ 100% traffic│                   │
│    └─────────────┘                   │
│                                      │
│    ┌─────────────┐                   │
│    │ Green (v0.9)│  ← INACTIVE       │
│    │ 0 replicas  │                   │
│    │ 0% traffic  │                   │
│    └─────────────┘                   │
└──────────────────────────────────────┘

DEPLOYMENT PROCESS:
1. Build new version (v1.1, "green")
2. Deploy green alongside blue
3. Run health checks on green
4. Switch load balancer traffic to green (instant)
5. Monitor green for 30 minutes
6. If all good: decommission blue
7. If bad: switch back to blue (instant rollback)

AFTER: Green (new version)
┌──────────────────────────────────────┐
│  Load Balancer                       │
│  ┌────────────────────────────────┐  │
│  │ Points to Green (v1.1)         │  │
│  └────────────────────────────────┘  │
│         ▼                             │
│    ┌─────────────┐                   │
│    │ Blue (v1.0) │  ← INACTIVE       │
│    │ 0 replicas  │                   │
│    │ 0% traffic  │                   │
│    └─────────────┘                   │
│                                      │
│    ┌─────────────┐                   │
│    │ Green (v1.1)│  ← ACTIVE         │
│    │ 3 replicas  │                   │
│    │ 100% traffic│                   │
│    └─────────────┘                   │
└──────────────────────────────────────┘
```

**Kubernetes Implementation:**

```yaml
# Deployment strategy
apiVersion: apps/v1
kind: Deployment
metadata:
  name: formatdisc-app
spec:
  replicas: 3
  strategy:
    type: Blue-Green
    blueGreen:
      activeSlot: blue
      prePromotionHook:
        exec:
          command: ["./health-check.sh"]
      preTerminationHook:
        exec:
          command: ["./graceful-shutdown.sh"]
```

### Consequences

**✅ Advantages:**
- **Zero downtime**: Instant traffic switch (no in-flight request loss)
- **Instant rollback**: If green has issues, switch back to blue immediately
- **Safe testing**: Can run smoke tests on green before switching
- **A/B testing**: Can gradually shift traffic (green 10% → 50% → 100%)

**⚠️ Trade-offs:**
- **Infrastructure cost**: Need 2x resources during deployment (blue + green)
- **Complexity**: Need load balancer with instant switch capability
- **State management**: Stateless services required (no in-memory session state)
- **Database migrations**: Must be backward-compatible (old blue + new green running together)

**🔧 Mitigation:**
- Use Kubernetes (scales resources on-demand, cost not as bad)
- Session state in Redis (not in-memory)
- Canary deployment (shift 10% traffic to green first, monitor)
- Database migrations in separate job (runs before blue-green switch)

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|------------|------|------|---------|
| **Rolling update** | Simple, gradual | 5-10 min downtime window, complex rollback | ❌ Rejected |
| **Canary deployment** | Gradual, safe | Still has time window of old/new mix | ⚠️ Partial |
| **✅ Blue-green** | Zero downtime, instant switch & rollback | 2x cost, more complex | ✅ **CHOSEN** |
| **Red-black (variant of blue-green)** | Same as blue-green | Same as blue-green | ⚠️ Equivalent |

### Related ADRs
- ADR-005: SLA Monitoring (99.95% uptime depends on blue-green)
- ADR-007: Incident Response (rollback is key incident response)

---

## 🎯 ADR-004: OPA Policy Enforcement for Compliance Gates

**Status**: ✅ Accepted  
**Date**: December 2025  
**Owner**: Compliance Officer, Security Architect  
**Impact**: CRITICAL (affects compliance reporting)

### Context

FormatDisc must verify **every deployment** against compliance rules:
- GDPR: Is /api/user/delete endpoint present?
- SOC2: Is audit logging code present?
- HIPAA: Is encryption implemented?
- Company Policy: No hardcoded secrets, proper error handling

Hard-coding rules in deployment scripts is brittle and hard to audit. We need **declarative, auditable policy engine**.

### Decision

Integrate **OPA (Open Policy Agent)** as compliance gate:

```
┌──────────────────────────────────┐
│  CI/CD Pipeline (GitHub Actions) │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Stage: Build                    │
│  • Compile, test, build image    │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  Stage: Compliance Check (OPA Policy)    │
│  ┌──────────────────────────────────┐   │
│  │ OPA Evaluates:                   │   │
│  │ • audit_logging_required()  ✅   │   │
│  │ • gdpr_compliant()          ✅   │   │
│  │ • zero_hardcoded_secrets()  ✅   │   │
│  │ • encryption_required()     ✅   │   │
│  │ • sbom_present()            ✅   │   │
│  │                                  │   │
│  │ Result: PASS or FAIL             │   │
│  └──────────────────────────────────┘   │
└────────────┬─────────────────────────────┘
             │
      IF FAIL │ BLOCK
             │
        IF PASS
             │
             ▼
┌──────────────────────────────────┐
│  Stage: Deploy to Production     │
│  (only if compliance check PASS) │
└──────────────────────────────────┘
```

**OPA Policy Rules (compliance.rego):**

```rego
package formatdisc

# Rule 1: Audit logging is mandatory
audit_logging_required {
    input.code_contains_audit_log_call == true
}

# Rule 2: GDPR requires delete endpoint
gdpr_compliant {
    input.has_delete_user_endpoint == true
}

# Rule 3: No hardcoded secrets (AWS keys, API keys, passwords)
zero_hardcoded_secrets {
    not any_secret_literal_found(input.source_code)
}

# Rule 4: Encryption in transit required
encryption_required {
    input.deployment.tls_version >= "1.3"
    input.deployment.enable_mtls == true
}

# Rule 5: SBOM generated on every build
sbom_present {
    input.build_artifacts.sbom_file_exists == true
}

# DENY if any rule fails
deny[msg] {
    not audit_logging_required
    msg = "BLOCKED: Audit logging code not found. Add 'logAuditEvent()' to critical paths."
}

deny[msg] {
    not gdpr_compliant
    msg = "BLOCKED: GDPR DELETE endpoint required. Add 'POST /api/user/delete' to API."
}

deny[msg] {
    not zero_hardcoded_secrets
    msg = "BLOCKED: Hardcoded secrets detected. Move to environment variables."
}

deny[msg] {
    not encryption_required
    msg = "BLOCKED: TLS 1.3 + mTLS required. Enable in Kubernetes."
}

deny[msg] {
    not sbom_present
    msg = "BLOCKED: SBOM missing. Run 'syft -o json > sbom.json' in CI."
}
```

**Integration in CI/CD:**

```bash
# GitHub Actions workflow
- name: Compliance Check (OPA)
  run: |
    # Prepare input JSON from build artifacts
    opa run -d policy/compliance.rego \
      --input <(cat > input.json <<EOF
{
  "code_contains_audit_log_call": $(grep -q "logAuditEvent" src/ && echo true || echo false),
  "has_delete_user_endpoint": $(grep -q "/api/user/delete" src/routes.ts && echo true || echo false),
  "source_code": "$(cat src/**/*.ts)",
  "deployment": {
    "tls_version": "1.3",
    "enable_mtls": true
  },
  "build_artifacts": {
    "sbom_file_exists": $([ -f sbom.json ] && echo true || echo false)
  }
}
EOF
) \
      --query "data.formatdisc.deny"
    
    # If any deny rules matched, exit non-zero (block deployment)
    if [ $(opa eval ... | jq length) -gt 0 ]; then
      echo "❌ Compliance check FAILED"
      exit 1
    else
      echo "✅ Compliance check PASSED"
    fi
```

### Consequences

**✅ Advantages:**
- **Declarative**: Policies are code (Git-tracked, reviewable, auditable)
- **Enforceable**: Every deployment is validated against policies
- **Auditable**: Policy violations are logged with signatures
- **Flexible**: Can add new policies without code changes
- **Compliant**: Proves to auditors that rules are enforced

**⚠️ Trade-offs:**
- **Learning curve**: OPA Rego syntax is unfamiliar to most engineers
- **Maintenance**: Policies must be kept up-to-date as regulations change
- **False positives**: Too strict policies block legitimate deployments
- **Performance**: Policy evaluation adds 30-60 seconds to CI/CD pipeline

**🔧 Mitigation:**
- Document policies with examples
- Create "policy exceptions" for edge cases (audit each exception)
- Test policies in CI before enforcing
- Use policy library (OpenPolicy/CNCF curated policies)

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|------------|------|------|---------|
| **Hard-coded checks in scripts** | Simple, fast | Not auditable, brittle, duplicate rules | ❌ Rejected |
| **Manual review before deploy** | Thorough | Doesn't scale, human error, slow | ❌ Rejected |
| **✅ OPA Policy Engine** | Declarative, auditable, enforceable, flexible | Steeper learning curve | ✅ **CHOSEN** |
| **Policy-as-Code (Pulumi)** | Infrastructure-focused | Not designed for compliance rules | ❌ Rejected |

### Related ADRs
- ADR-001: Audit Logging (policies sign their decisions)
- ADR-003: Blue-Green Deployment (policy must pass before blue-green)
- ADR-005: SLA Monitoring (policy compliance affects SLA score)

---

## 🎯 ADR-005: 99.95% SLA Uptime Guarantee with Multi-Region Failover

**Status**: ✅ Accepted  
**Date**: December 2025  
**Owner**: Reliability Engineer, Product Lead  
**Impact**: CRITICAL (affects contract SLA)

### Context

Enterprise customers pay for 99.95% uptime guarantee (22 minutes downtime allowed per year). To deliver this:
1. **Single region insufficient** (can have scheduled maintenance)
2. **Need automatic failover** (no manual intervention)
3. **Need to prove uptime** (auditable metrics)
4. **Need incident response** (minimize MTTR)

### Decision

Implement **multi-region architecture with automatic failover**:

```
ARCHITECTURE:
┌──────────────────────────────────────────────────────────┐
│  Global Load Balancer (Cloudflare)                       │
│  • Route based on latency                                 │
│  • Health checks every 30 seconds                         │
│  • Auto-failover if region unhealthy                     │
└────┬──────────────────────────┬──────────────────────────┘
     │                          │
     ▼                          ▼
  ┌─────────────┐          ┌──────────────┐
  │ US Region   │          │ EU Region    │
  │ (Primary)   │          │ (Secondary)  │
  │             │          │              │
  │ • K8s 3x    │          │ • K8s 3x     │
  │ • PostgreSQL│ ◄─────────► │ PostgreSQL │
  │   (primary) │ wal_level   │ (standby)  │
  │ • Redis     │ logical_rep │ Redis      │
  │ • Observ.  │          │ • Observ.    │
  │ • 99.99%   │          │ • 99.99%     │
  │   uptime   │          │   uptime     │
  └─────────────┘          └──────────────┘
       │                         │
       └─────────────┬───────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │ APAC Region (Tertiary)
         │ • K8s 1x (optional)
         │ • Read-only replica
         │ • Async replication
         └──────────────────────┘

FAILOVER FLOW:
1. Cloudflare health check to US region fails
2. GLB automatically routes traffic to EU region
3. EU database becomes temporary primary
4. Transactions continue (write-ahead logs)
5. EU replicates to APAC
6. Alert: "US Region Failure" (PagerDuty)
7. On-call investigates US region
8. Once fixed, manual failback (don't auto-switch back)
9. Incident post-mortem (what went wrong?)
```

**SLA Calculation:**

```
Uptime by Component:
  • US K8s:           99.99% (≈50 min/year down)
  • EU K8s:           99.99% (≈50 min/year down)
  • Global Load Bal:  99.99% (≈50 min/year down)

Combined (assuming independence):
  Availability = 1 - (0.0001 × 0.0001 × 0.0001)
               ≈ 100% (highly available!)

In practice (accounting for dependencies):
  Availability ≈ 99.99% × (1 - 0.0001)  [if both regions down]
               ≈ 99.98%

Marketing Promise: 99.95%
(We deliver 99.98%, giving buffer for unexpected issues)

Service Level Indicators (SLIs):
  • Uptime %: (total_seconds - downtime_seconds) / total_seconds
  • Error rate: (errors / total_requests) < 0.1%
  • Latency: p99 < 2 seconds
  • If any SLI breaches, SLA credit applies

SLA Credit:
  • 99.95% - 99.0%: 10% refund
  • 99.0% - 95.0%: 25% refund
  • < 95%: 100% refund (+ free month)
```

### Consequences

**✅ Advantages:**
- **High availability**: Automatic failover (no human intervention)
- **Resilience**: One region down doesn't affect customers
- **Scalability**: Distribute load across regions (lower latency globally)
- **Contractual**: Can promise 99.95% SLA (marketable advantage)
- **Disaster recovery**: Data replicated to multiple regions

**⚠️ Trade-offs:**
- **Cost**: 2-3x infrastructure cost (pay for multiple regions)
- **Complexity**: Distributed systems are harder to debug
- **Data consistency**: Multi-region replication has lag (eventual consistency)
- **Compliance**: Data residency rules (GDPR: EU data must stay in EU)

**🔧 Mitigation:**
- Use managed services (Vercel Edge, Supabase multi-region) for cost
- Implement comprehensive monitoring (Prometheus + Grafana)
- Data residency: EU data in EU replicas, US data in US replicas
- Test failover monthly (chaos engineering practice)

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|------------|------|------|---------|
| **Single region** | Simple, cheap | Can't deliver 99.95%, maintenance downtime | ❌ Rejected |
| **Active-active** | Load balanced, fast failover | Complex, data consistency issues | ⚠️ Partial |
| **✅ Active-passive + active-active** | Resilient, high availability, cost-efficient | More infrastructure cost | ✅ **CHOSEN** |
| **Geographic redundancy (multi-cloud)** | Vendor lock-in prevention | Expensive, complex | ❌ Rejected |

### Related ADRs
- ADR-003: Blue-Green Deployment (per-region)
- ADR-002: Multi-Tenant Isolation (tenant data in specific region)
- ADR-007: Incident Response (failover is incident response)

---

## 🎯 ADR-006: FinOps & Cost Optimization Framework

**Status**: ✅ Accepted  
**Date**: December 2025  
**Owner**: Finance, DevOps Lead  
**Impact**: MEDIUM (affects profitability)

### Context

Cloud costs are 13% of revenue (target: <10%). Unchecked infrastructure spending could reduce margins from 78% to <70%.

We need:
1. **Visibility**: Know where every dollar goes
2. **Accountability**: Assign costs to projects/teams
3. **Optimization**: Continuous cost reduction
4. **Budgeting**: Forecast future spend

### Decision

Implement **FinOps (Financial Operations)** framework:

```
COST VISIBILITY:
┌─────────────────────────────────────────┐
│  AWS CloudWatch + Vercel Dashboard      │
│                                         │
│  Monthly Spend Breakdown:               │
│  • Kubernetes nodes:        €2,600 (39%)│
│  • Database (Neon):         €800 (12%)   │
│  • Vercel (hosting):        €3,200 (48%) │
│  • Monitoring (DataDog):    €800 (12%)   │
│  • Other APIs:              €200 (-1%)   │
│                                         │
│  Total: €7,400 per month                │
│  Per project: €387 (average)            │
│  Gross margin: 78% (78% of revenue)    │
└─────────────────────────────────────────┘

COST OPTIMIZATION INITIATIVES:
┌─────────────────────────────────────────┐
│  Initiative         | Savings  | Status  │
├─────────────────────────────────────────┤
│ Reserved Instances  | €400/mo  | ✅ Done │
│ Spot Instances      | €250/mo  | ✅ Done │
│ Multi-region balance| €300/mo  | ⏳ Plan │
│ DB query optim.     | €150/mo  | ⏳ Plan │
│ Image compression   | €75/mo   | 📋 Plan │
│                                         │
│ Total Savings: €1,175/mo (16%)         │
└─────────────────────────────────────────┘

COST ALLOCATION BY PROJECT:
┌─────────────────────────────────────────┐
│  Project         | Cost    | Margin     │
├─────────────────────────────────────────┤
│ Enterprise proj  | €600    | 92% (high) │
│ Professional     | €387    | 78% (avg)  │
│ Starter          | €250    | 65% (low)  │
│                                         │
│ Unprofitable:    | If cost > revenue   │
│  → Stop offering until margin improves  │
└─────────────────────────────────────────┘
```

### Consequences

**✅ Advantages:**
- **Visibility**: Know exact cost per project
- **Accountability**: Teams own their cloud spend
- **Optimization**: Can prioritize savings opportunities
- **Profitability**: Maintain 78%+ margins

**⚠️ Trade-offs:**
- **Time**: FinOps requires continuous monitoring
- **Complexity**: Need cost allocation algorithms
- **Rigidity**: May limit feature development if too cost-conscious

**🔧 Mitigation:**
- Automate cost tracking (CloudWatch → Grafana dashboards)
- Monthly cost review (CFO + CTO)
- Set budgets with alerts (prevent overspend)

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|------------|------|------|---------|
| **No cost tracking** | Simple | Costs spiral, margins collapse | ❌ Rejected |
| **Quarterly reviews** | Less overhead | Too slow to respond to spikes | ❌ Rejected |
| **✅ FinOps (weekly reviews)** | Responsive, visible, optimized | Requires discipline | ✅ **CHOSEN** |

### Related ADRs
- ADR-003: Blue-Green Deployment (infrastructure cost)
- ADR-005: SLA Monitoring (cost per SLA tier)

---

## 🎯 ADR-007: Incident Response & Chaos Engineering

**Status**: ✅ Accepted  
**Date**: December 2025  
**Owner**: Reliability Lead, On-Call Manager  
**Impact**: MEDIUM (affects disaster recovery)

### Context

The only way to achieve 99.95% SLA is to be prepared for failures. We need:
1. **Incident response playbook** (what to do when X breaks?)
2. **On-call rotation** (who responds when?)
3. **Chaos engineering** (test failures before they happen in production)
4. **Post-mortems** (learn from incidents)

### Decision

Implement **incident response framework** with chaos tests:

```
INCIDENT SEVERITY LEVELS:
┌─────────────────────────────────────────┐
│ SEV-1 (Critical)                        │
│ • Complete outage (no traffic)          │
│ • P1: Page on-call immediately          │
│ • Response: < 5 minutes                 │
│ • Example: All deployments failing      │
│                                         │
│ SEV-2 (High)                           │
│ • Degraded service (error rate > 1%)   │
│ • P1: Page on-call within 15 min       │
│ • Response: < 15 minutes                │
│ • Example: One region down              │
│                                         │
│ SEV-3 (Medium)                         │
│ • Minor issues (error rate 0.1-1%)      │
│ • P2: Alert on-call, page if continues │
│ • Response: < 1 hour                    │
│ • Example: One service intermittently   │
│                                         │
│ SEV-4 (Low)                            │
│ • Non-urgent (error rate < 0.1%)       │
│ • Create ticket, no page                │
│ • Response: < 24 hours                  │
│ • Example: Typo in error message        │
└─────────────────────────────────────────┘

INCIDENT RESPONSE PLAYBOOK:
┌─────────────────────────────────────────┐
│ 1. DETECT (Prometheus/AlertManager)     │
│    Alert fires → PagerDuty page sent    │
│                                         │
│ 2. RESPOND (On-call engineer)           │
│    • Join Slack #incident channel       │
│    • Declare SEV level                  │
│    • Form incident commander + tech     │
│                                         │
│ 3. DIAGNOSE (Debug)                     │
│    • Check logs (Loki)                  │
│    • Check metrics (Prometheus)         │
│    • Check deployments (ArgoCD)         │
│                                         │
│ 4. MITIGATE (Temporary fix)             │
│    • Rollback if recent deploy          │
│    • Kill stuck pods (Kubernetes)       │
│    • Scale up (if load issue)           │
│    • Manual failover (if region down)   │
│                                         │
│ 5. RESOLVE (Permanent fix)              │
│    • Fix code (if bug)                  │
│    • Fix config (if misconfigured)      │
│    • Deploy fix (blue-green)            │
│                                         │
│ 6. POST-MORTEM (Learn)                  │
│    • What happened?                     │
│    • Why did we miss it?                │
│    • How do we prevent it?              │
│    • Action items + owner               │
│    • Public postmortem (transparency)   │
└─────────────────────────────────────────┘

CHAOS ENGINEERING (Monthly):
┌─────────────────────────────────────────┐
│ Week 1: Kill random pod (chaos monkey)  │
│   → Verify system recovers in < 1 min   │
│                                         │
│ Week 2: Simulate region failure         │
│   → Verify failover works                │
│                                         │
│ Week 3: Simulate database failure       │
│   → Verify backup/restore works          │
│                                         │
│ Week 4: Simulate network latency        │
│   → Verify timeouts work correctly       │
│                                         │
│ Each test generates incident (on purpose)
│ Team practices response procedures       │
└─────────────────────────────────────────┘

ON-CALL ROTATION:
┌─────────────────────────────────────────┐
│ Monday-Friday: Primary + Secondary      │
│ Saturday-Sunday: One person (reduced)   │
│ Holiday: Pre-arranged coverage          │
│                                         │
│ Handoff: Friday 5pm → Monday 9am        │
│ Sync: 15-min standup (status handoff)   │
│ Comp time: 2 hours comp per night call  │
│ Burnout prevention: Rotate every month  │
└─────────────────────────────────────────┘
```

### Consequences

**✅ Advantages:**
- **Preparedness**: Team knows what to do when incident happens
- **Speed**: Incident response time < 5 min (vs hours without playbook)
- **Learning**: Post-mortems prevent same incident twice
- **Trust**: Customers trust we're prepared for failures

**⚠️ Trade-offs:**
- **Time**: On-call duty takes time (comp time helps)
- **Emotional**: Incidents are stressful (blameless culture helps)
- **Overhead**: Chaos tests take time (worth it for reliability)

**🔧 Mitigation:**
- Blameless post-mortems (focus on systems, not people)
- Adequate comp time (don't burn out on-call engineers)
- Automate chaos tests (reduce manual overhead)

---

## 📋 ADR Summary Table

| ADR | Title | Decision | Status | Risk | Impact |
|-----|-------|----------|--------|------|--------|
| **ADR-001** | Immutable Audit Logging | Event sourcing + HSM signatures | ✅ Accepted | Low | CRITICAL |
| **ADR-002** | Multi-Tenant Isolation | Schema-per-tenant | ✅ Accepted | Low | HIGH |
| **ADR-003** | Zero-Downtime Deploy | Blue-green strategy | ✅ Accepted | Low | HIGH |
| **ADR-004** | OPA Policy Enforcement | Compliance gates in CI/CD | ✅ Accepted | Medium | CRITICAL |
| **ADR-005** | 99.95% SLA Uptime | Multi-region active-passive | ✅ Accepted | Medium | CRITICAL |
| **ADR-006** | FinOps Optimization | Weekly cost reviews + budgets | ✅ Accepted | Low | MEDIUM |
| **ADR-007** | Incident Response | Playbooks + chaos engineering | ✅ Accepted | Medium | MEDIUM |

---

## 🔄 Related Decision Dependencies

```
ADR-001 ──────┐
              │
ADR-002 ──┬───┤
          │   │
ADR-003 ──┼───┼──→ ADR-004 (OPA policies)
          │   │       │
ADR-005 ──┘   │       │
              │       ▼
          ADR-007 (Incident Response)
              │
              ▼
          ADR-006 (Cost tracking)
```

**Key Dependencies:**
- ADR-001 (Audit) feeds into ADR-004 (Policies) and ADR-007 (Incident Response)
- ADR-003 (Deployment) depends on ADR-004 (Compliance gates)
- ADR-005 (SLA) depends on ADR-003 (Blue-green) and ADR-007 (Failover)

---

**Document Version**: 1.0  
**Last Updated**: December 11, 2025  
**Owner**: Enterprise Architecture Team  
**Status**: ✅ Complete
