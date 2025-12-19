# Production Readiness Checklist

**Project:** FormatDisc.hr  
**Target GA:** TBD  
**Status:** 🟡 Pre-Production (85% complete)

---

## Critical Blockers (P0)

Must be resolved before production deployment.

### 1. Hash Chaining for Audit Logs
- [ ] Implement `previousHash` and `currentHash` in `AuditEvent`
- [ ] Add cryptographic verification on log read
- [ ] Test with 10k+ events/s throughput
- **Owner:** Backend Lead  
- **Deadline:** Week 1

### 2. Cross-Region Conflict Resolution
- [ ] Define conflict resolution strategy (CRDT vs LWW)
- [ ] Implement vector clocks or Lamport timestamps
- [ ] Test multi-region write scenarios
- **Owner:** SRE  
- **Deadline:** Week 1

---

## High Priority (P1)

Strongly recommended before GA.

### 3. Schema Migration Automation
- [ ] Update Flyway scripts to iterate all tenant schemas
- [ ] Test on >1000 tenants
- [ ] Add CI validation
- **Owner:** Infrastructure  
- **Deadline:** Week 2

### 4. Blue-Green Rollback Load Test
- [ ] Write k6 script for 10k req/min
- [ ] Trigger rollback at peak traffic
- [ ] Measure downtime (<5s target)
- **Owner:** DevOps  
- **Deadline:** Week 2

### 5. OPA Incremental Evaluation
- [ ] Implement differential policy checking in CI
- [ ] Reduce CI time from 120s to <60s
- [ ] Document policy update procedures
- **Owner:** Security  
- **Deadline:** Week 2

---

## Medium Priority (P2)

Can be addressed post-GA with monitoring.

### 6. Automated Chaos Testing
- [ ] Setup monthly GitHub Actions cron
- [ ] Integrate PagerDuty auto-incident
- [ ] Document chaos scenarios
- **Owner:** SRE  
- **Deadline:** Week 3

### 7. Cost Anomaly Alerting
- [ ] Connect FinOps alerts to incident response
- [ ] Define cost spike thresholds
- [ ] Test alert delivery
- **Owner:** FinOps  
- **Deadline:** Week 3

---

## Sign-Off Required

- [ ] CTO
- [ ] Security Lead
- [ ] SRE Lead
- [ ] Compliance Officer

---

**Last Updated:** 2025-01-XX  
**Next Review:** Weekly until GA
