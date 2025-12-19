# CI/CD Pipeline Setup Guide

## Overview

FormatDisc.hr uses a **6-stage automated CI/CD pipeline** on GitHub Actions that enforces quality, security, and compliance before every deployment.

### Pipeline Stages

1. **Lint & Format** – ESLint, TypeScript type-checking
2. **Unit & Integration Tests** – Jest/Vitest coverage reporting
3. **Security Scan** – Trivy, npm audit, SBOM generation
4. **OPA Compliance** – GDPR/SOC2/HIPAA policy enforcement
5. **Performance Audit** – Lighthouse CI with budgets
6. **Deploy to Production** – Zero-downtime Vercel deployment

---

## GitHub Secrets Configuration

Add these secrets to your repository:

**Settings → Secrets and variables → Actions**

### Required Secrets

- `VERCEL_TOKEN` – Vercel API token (get from https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` – Your Vercel organization ID
- `VERCEL_PROJECT_ID` – Your Vercel project ID

### Optional Secrets (Enable Extra Features)

- `CODECOV_TOKEN` – For code coverage reporting
- `LHCI_GITHUB_APP_TOKEN` – For Lighthouse CI comments on PRs
- `FOSSA_API_KEY` – For license compliance scanning

---

## Local Testing

### Test the Pipeline Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Run linting
pnpm lint

# 3. Type-check
pnpm type-check

# 4. Run tests (if configured)
pnpm test

# 5. Build
pnpm build
```

### Trigger Pipeline with Git

```bash
# Create test branch
git checkout -b test/ci-pipeline

# Add and commit changes
git add .
git commit -m "test: trigger CI pipeline"

# Push to GitHub
git push origin test/ci-pipeline

# Watch in GitHub Actions
# Navigate to: https://github.com/mladengertner/formatdisc.hr/actions
```

---

## Understanding Pipeline Failures

### Stage 1: Lint & Format

**Common Error:** `ESLint error in file.tsx`

**Solution:**
```bash
pnpm lint --fix
git add .
git commit -m "fix: eslint violations"
git push
```

### Stage 3: Security Scan

**Common Error:** `High severity vulnerability detected`

**Solution:**
```bash
npm audit fix
# or update specific package
npm update package-name
git add package-lock.json
git push
```

### Stage 5: Performance Audit

**Common Error:** `Lighthouse score below budget (threshold: 90)`

**Solution:**
1. Check Lighthouse report in Actions workflow
2. Optimize images, lazy-load components, reduce JS
3. Run local Lighthouse audit:
```bash
npm run lighthouse
```

---

## Deployment Workflow

### Standard Merge to Main

```
PR Created
    ↓
Stage 1-5: Automated Tests & Checks
    ↓
Review Approved
    ↓
Merge to Main
    ↓
Stage 6: Deploy to Vercel Production
    ↓
Production Live ✅
```

### Manual Deployment

```bash
# Deploy to production manually
vercel --prod

# Or via GitHub UI
# 1. Go to Actions
# 2. Select latest workflow run
# 3. Click "Re-run all jobs"
```

---

## Best Practices

1. **Keep Main Branch Green** – Never merge failing branches
2. **Review SBOM** – Check security artifacts in Actions
3. **Monitor Lighthouse** – Track performance over time
4. **Run Tests Locally** – Before pushing to avoid pipeline delays
5. **Update Dependencies Monthly** – Use `npm update` or Dependabot

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Pipeline hangs on "Installing dependencies" | Lock file stale | Delete `pnpm-lock.yaml`, re-run |
| Trivy scan fails | Outdated vulnerable package | `npm audit fix` and commit |
| Lighthouse score drops | New images/CSS | Optimize assets, lazy-load routes |
| Deploy fails silently | Missing env vars | Check Vercel project settings |

---

## See Also

- [Copilot Instructions](../.github/copilot-instructions.md)
- [OPA Compliance Policies](../policy/compliance.rego)
- [GitHub Actions Workflow](../.github/workflows/ci-cd.yml)
