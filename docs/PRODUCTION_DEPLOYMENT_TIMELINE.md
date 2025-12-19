# FORMATDISC.HR - Production Deployment Timeline

**Estimated Total Time:** 2-3 hours  
**Recommended Window:** Low-traffic period (e.g., Sunday 02:00-05:00 CET)

---

## Timeline Breakdown

### T-60min: Pre-Deployment Phase
- [ ] **00:00-00:15** - Team assembly and checklist review
- [ ] **00:15-00:30** - Environment variables verification
- [ ] **00:30-00:45** - Database migration dry-run
- [ ] **00:45-01:00** - Final code review and merge to `main`

### T-0min: Deployment Execution
- [ ] **01:00-01:15** - Push to GitHub, trigger CI/CD
- [ ] **01:15-01:30** - Monitor pipeline stages (lint, test, security, compliance, performance)
- [ ] **01:30-01:45** - Vercel build and deployment
- [ ] **01:45-02:00** - DNS propagation check

### T+15min: Verification Phase
- [ ] **02:00-02:15** - Health checks and smoke tests
- [ ] **02:15-02:30** - Critical user flows (signup, purchase, simulator)
- [ ] **02:30-02:45** - Performance metrics validation
- [ ] **02:45-03:00** - Security scan and audit log verification

### T+60min: Monitoring Phase
- [ ] **03:00-04:00** - Active monitoring of error rates and latency
- [ ] **04:00-05:00** - Final sign-off and team standown

---

## Communication Plan

**Slack Channel:** #formatdisc-deployment  
**Status Updates:** Every 15 minutes  
**Escalation Contact:** Mladen Gertner (+385 XX XXX XXXX)

---

## Success Criteria

- ✅ All checklist items marked "Go"
- ✅ Error rate <0.5%
- ✅ P95 latency <900ms
- ✅ Lighthouse score >90
- ✅ Zero critical security vulnerabilities
- ✅ All team leads signed off
