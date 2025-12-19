# FORMATDISC.HR - Production Deployment Checklist

**Project:** FORMATDISC.HR - Enterprise SaaS Platform  
**Deployment Target:** www.formatdisc.hr  
**Version:** v1.0.0  
**Date:** _________  
**Deployment Lead:** Mladen Gertner  

---

## Pre-Deployment Verification

### 1. Environment & Secrets ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| Vercel project connected to GitHub | ☐ Go / ☐ No-Go | _________ | Project: `formatdisc-hr` |
| All production env vars set in Vercel | ☐ Go / ☐ No-Go | _________ | See `.env.example` |
| Supabase production keys verified | ☐ Go / ☐ No-Go | _________ | SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY |
| Stripe live keys configured | ☐ Go / ☐ No-Go | _________ | STRIPE_SECRET_KEY, PUBLISHABLE_KEY |
| NEXT_PUBLIC_APP_URL = https://www.formatdisc.hr | ☐ Go / ☐ No-Go | _________ | Critical for callbacks |
| Ollama API endpoint accessible | ☐ Go / ☐ No-Go | _________ | For SlavkoKernel v12 |

**Sign-off:** _________ (Lead Engineer)

---

### 2. Database Setup ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| Supabase SQL Editor accessible | ☐ Go / ☐ No-Go | _________ | Dashboard access verified |
| `scripts/000_MASTER_MIGRATION.sql` executed | ☐ Go / ☐ No-Go | _________ | Creates all tables |
| RLS policies active on all tables | ☐ Go / ☐ No-Go | _________ | Check via Supabase UI |
| Test user signup/login flow works | ☐ Go / ☐ No-Go | _________ | Auth.users table populated |
| `agent_logs` table receiving data | ☐ Go / ☐ No-Go | _________ | Test via /api/agents/execute |

**Sign-off:** _________ (Database Admin)

---

### 3. CI/CD Pipeline ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| GitHub Actions workflow file present | ☐ Go / ☐ No-Go | _________ | `.github/workflows/ci-cd.yml` |
| All 6 stages defined (lint, test, security, compliance, perf, deploy) | ☐ Go / ☐ No-Go | _________ | Review workflow YAML |
| Trivy security scan enabled | ☐ Go / ☐ No-Go | _________ | Container image scanning |
| OPA policy engine configured | ☐ Go / ☐ No-Go | _________ | `policy/compliance.rego` |
| Lighthouse CI budget set | ☐ Go / ☐ No-Go | _________ | `lighthouserc.json` |
| Test branch push successful | ☐ Go / ☐ No-Go | _________ | Push `test/ci-pipeline` branch |

**Sign-off:** _________ (DevOps Engineer)

---

### 4. Application Health ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| Build succeeds locally (`npm run build`) | ☐ Go / ☐ No-Go | _________ | No TypeScript errors |
| All unit tests pass (`npm test`) | ☐ Go / ☐ No-Go | _________ | SlavkoKernel v12 tests |
| `/api/health` endpoint returns 200 | ☐ Go / ☐ No-Go | _________ | After first deploy |
| `/api/kernel/metrics` returns live data | ☐ Go / ☐ No-Go | _________ | SlavkoKernel health check |
| Hero section loads with correct branding | ☐ Go / ☐ No-Go | _________ | FormatDisc logo, colors |
| MVP Simulator functional | ☐ Go / ☐ No-Go | _________ | Test scenario execution |
| Footer social links open correct profiles | ☐ Go / ☐ No-Go | _________ | LinkedIn, GitHub, Facebook, X |

**Sign-off:** _________ (QA Engineer)

---

### 5. Stripe Integration ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| Stripe webhook endpoint configured | ☐ Go / ☐ No-Go | _________ | `https://www.formatdisc.hr/api/stripe/webhook` |
| Webhook secret set in Vercel | ☐ Go / ☐ No-Go | _________ | STRIPE_WEBHOOK_SECRET |
| Test checkout session created | ☐ Go / ☐ No-Go | _________ | Via /api/stripe/create-checkout-session |
| Webhook events logged in `stripe_events` table | ☐ Go / ☐ No-Go | _________ | Supabase dashboard check |
| Customer records created in `stripe_customers` | ☐ Go / ☐ No-Go | _________ | After test purchase |

**Sign-off:** _________ (Payment Integration Lead)

---

### 6. Performance & Monitoring ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| Lighthouse score >90 (Performance, Accessibility, SEO) | ☐ Go / ☐ No-Go | _________ | Run `lighthouse https://www.formatdisc.hr` |
| Core Web Vitals pass | ☐ Go / ☐ No-Go | _________ | LCP <2.5s, FID <100ms, CLS <0.1 |
| SlavkoKernel P95 latency <900ms | ☐ Go / ☐ No-Go | _________ | Check `/api/kernel/metrics` |
| Error rate <0.5% | ☐ Go / ☐ No-Go | _________ | Monitor Vercel Analytics |
| Uptime monitoring configured | ☐ Go / ☐ No-Go | _________ | Optional: UptimeRobot or Pingdom |

**Sign-off:** _________ (Performance Engineer)

---

### 7. Security & Compliance ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| HTTPS enforced (no HTTP redirects) | ☐ Go / ☐ No-Go | _________ | Test with curl -I |
| CSP headers configured | ☐ Go / ☐ No-Go | _________ | Check `next.config.mjs` |
| No API keys in client-side code | ☐ Go / ☐ No-Go | _________ | Review bundle with DevTools |
| GDPR cookie consent functional | ☐ Go / ☐ No-Go | _________ | If applicable |
| Audit logs capturing all critical events | ☐ Go / ☐ No-Go | _________ | Test signup, purchase, agent execution |
| SBOM generated and stored | ☐ Go / ☐ No-Go | _________ | Run `npm audit` and save output |

**Sign-off:** _________ (Security Officer)

---

### 8. Domain & DNS ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| DNS A/CNAME records point to Vercel | ☐ Go / ☐ No-Go | _________ | Cloudflare DNS settings |
| SSL certificate provisioned | ☐ Go / ☐ No-Go | _________ | Vercel auto-provisions |
| www.formatdisc.hr resolves correctly | ☐ Go / ☐ No-Go | _________ | Test with `dig www.formatdisc.hr` |
| formatdisc.hr redirects to www | ☐ Go / ☐ No-Go | _________ | Optional but recommended |

**Sign-off:** _________ (DNS Administrator)

---

## Deployment Execution

### 9. Production Deploy ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| Final commit pushed to `main` branch | ☐ Go / ☐ No-Go | _________ | Git SHA: _________ |
| Vercel deployment started | ☐ Go / ☐ No-Go | _________ | Deployment URL: _________ |
| All CI/CD stages passed | ☐ Go / ☐ No-Go | _________ | Check GitHub Actions tab |
| Production build completed | ☐ Go / ☐ No-Go | _________ | Vercel dashboard shows "Ready" |
| Health check endpoint returns 200 | ☐ Go / ☐ No-Go | _________ | `curl https://www.formatdisc.hr/api/health` |
| Homepage loads without errors | ☐ Go / ☐ No-Go | _________ | Open in incognito browser |

**Sign-off:** _________ (Deployment Lead)

---

### 10. Post-Deployment Verification ✓

| Item | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| All navigation links functional | ☐ Go / ☐ No-Go | _________ | Hero, Pricing, Projects, Contact |
| Forms submit successfully | ☐ Go / ☐ No-Go | _________ | Contact form, order form |
| User signup/login flow works | ☐ Go / ☐ No-Go | _________ | Create test account |
| SlavkoKernel execution successful | ☐ Go / ☐ No-Go | _________ | Test via simulator |
| Metrics dashboard shows live data | ☐ Go / ☐ No-Go | _________ | KernelMetricsCard on homepage |
| No console errors in browser DevTools | ☐ Go / ☐ No-Go | _________ | Check Network and Console tabs |
| Mobile responsive design verified | ☐ Go / ☐ No-Go | _________ | Test on iPhone/Android |

**Sign-off:** _________ (QA Engineer)

---

## Rollback Plan

**Trigger Criteria:** 
- Critical error rate >5%
- Homepage not loading
- Payment processing failure
- Security breach detected

**Rollback Steps:**
1. Revert to previous deployment in Vercel dashboard
2. Notify team via Slack/email
3. Investigate root cause
4. Create hotfix branch
5. Re-deploy after fix verification

**Rollback Lead:** _________

---

## Final Sign-Off

| Role | Name | Signature | Date/Time |
|------|------|-----------|-----------|
| Deployment Lead | Mladen Gertner | _________ | _________ |
| Database Admin | _________ | _________ | _________ |
| DevOps Engineer | _________ | _________ | _________ |
| QA Engineer | _________ | _________ | _________ |
| Security Officer | _________ | _________ | _________ |

---

## Notes & Observations

```
[Space for deployment notes, issues encountered, and resolutions]





```

---

**Deployment Status:** ☐ SUCCESS / ☐ PARTIAL / ☐ FAILED

**Production URL:** https://www.formatdisc.hr

**Go-Live Time:** _________
