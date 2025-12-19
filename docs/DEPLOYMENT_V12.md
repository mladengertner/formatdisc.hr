# SlavkoKernel™ v12 Deployment Guide

## Pre-Deployment Checklist

### 1. Lock Manifest Checksum

Generate and verify manifest checksum:

```bash
npx tsx scripts/manifest-checksum.ts
```

Verify output:
```
SHA-256: [64-character hash]
Contract Lock: ENABLED
✓ Checksum written to docs/MANIFEST_V12_CHECKSUM.txt
```

Commit checksum file:
```bash
git add docs/MANIFEST_V12_CHECKSUM.txt
git commit -m "Lock SlavkoKernel v12 manifest"
```

---

### 2. Run Test Suite

```bash
npm test __tests__/slavko-kernel-v12.test.ts
```

Expected: **All tests passing** (20+ assertions)

---

### 3. Synthetic Load Test

Use `k6` or `Artillery` to run 1k req/min:

```bash
# k6 example
k6 run --vus 50 --duration 60s tests/load/kernel-v12.js
```

Target metrics:
- **P95 latency:** <900ms
- **Error rate:** <0.5%
- **Success rate:** >99.5%

---

### 4. Environment Variables

Add to Vercel/Cloudflare:

```bash
# Required
OLLAMA_API_URL=http://your-ollama-server:11434
OLLAMA_MODEL=llama3.2

# Optional (for council bridge)
SLAVKO_BASE_URL=http://your-slavko-v7:8000
SLAVKO_API_TOKEN=your_jwt_token

# App config
NEXT_PUBLIC_APP_URL=https://www.formatdisc.hr
```

---

### 5. Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Vercel will auto-deploy
# Or manually trigger:
vercel --prod
```

---

### 6. Deploy to Cloudflare (Alternative)

```bash
# Build
npm run build

# Deploy
wrangler pages deploy .vercel/output/static
```

---

### 7. Verify Production

Test production endpoint:

```bash
curl -X POST https://www.formatdisc.hr/api/kernel/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test deployment","persona":"direct"}'
```

Expected response:
```json
{
  "text": "...",
  "route": "direct",
  "metrics": {
    "latencyMs": 450,
    "errorRate": 0,
    "throughput": 1
  },
  "fallbackUsed": false
}
```

---

### 8. Monitor Metrics

Check `/api/kernel/metrics` endpoint:

```bash
curl https://www.formatdisc.hr/api/kernel/metrics
```

Expected:
```json
{
  "route": "direct",
  "p95LatencyMs": 780,
  "errorRate": 0.002,
  "throughput": 15.3,
  "health": "online"
}
```

---

## Post-Deployment

### Enable Monitoring

1. **Prometheus** - Scrape `/api/kernel/metrics`
2. **Grafana** - Dashboard for latency, error rate, route distribution
3. **Alerts** - P95 latency >900ms or error rate >0.5%

### Rollback Plan

If issues detected:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in Vercel UI
vercel rollback
```

---

## GA Release Criteria

- ✅ Manifest checksum locked
- ⏳ Synthetic load test passed (1k req/min)
- ⏳ Fallback copy reviewed (brand-safe)
- ⏳ Production metrics monitored for 48h
- ⏳ Zero critical incidents

**Status:** Release Candidate (RC) → GA after 48h monitoring

---

## Support

- **Issues:** GitHub Issues
- **Email:** support@formatdisc.hr
- **Docs:** `/docs/SLAVKOKERNEL_V12.md`
