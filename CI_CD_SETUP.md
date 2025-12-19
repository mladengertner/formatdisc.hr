# GitHub Actions Setup Guide

This guide walks through setting up the CI/CD pipeline for FormatDisc.hr.

## Step 1: Add GitHub Secrets

Navigate to **Settings → Secrets and variables → Actions** and add the following secrets:

### Deployment Secrets (Required for Vercel)

| Secret | Value | Source |
|--------|-------|--------|
| `VERCEL_TOKEN` | Your Vercel API token | [Vercel Settings](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Vercel Dashboard |
| `VERCEL_PROJECT_ID` | Your project ID on Vercel | Vercel Dashboard |

### Security & Compliance Secrets

| Secret | Value | Source |
|--------|-------|--------|
| `FOSSA_API_KEY` | FOSSA license scanning API key | [FOSSA Dashboard](https://app.fossa.com/) |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI token | [Lighthouse CI](https://github.com/apps/lighthouse-ci) |

### API Keys & Credentials (Production Only)

These should only be added when deploying to production:

| Secret | Value | Example |
|--------|-------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` (never `sk_test_`) |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `SUPABASE_SERVICE_ROLE` | Service role key | From Supabase project settings |

## Step 2: Configure Workflow Environments

Create two GitHub Environments:

### 1. `staging` (optional preview deployments)
```
Settings → Environments → New environment → Staging
```
- **Deployment branches**: Allow deployments from refs matching `release/*`

### 2. `production` (main branch only)
```
Settings → Environments → New environment → Production
```
- **Required reviewers**: Add team members who must approve production deployments
- **Deployment branches**: Allow deployments from `main` only
- **Environment secrets**: Add production API keys (optional, more secure)

## Step 3: Create Lighthouse CI Configuration

Create `lighthouserc.json` in repo root:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "performance": ["warn", { "minScore": 0.8 }],
        "accessibility": ["error", { "minScore": 0.9 }],
        "best-practices": ["error", { "minScore": 0.9 }],
        "seo": ["warn", { "minScore": 0.8 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

## Step 4: Create Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # Check for npm updates weekly
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "03:00"
    auto-merge: true
    reviewers:
      - "formatdisc"
    labels:
      - "dependencies"

  # Check for GitHub Actions updates weekly
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "04:00"
```

## Step 5: Configure Branch Protection Rules

Go to **Settings → Branches → Add rule**:

### Main Branch Protection

- **Branch name pattern**: `main`
- **Require a pull request before merging**: ✅
  - **Require approvals**: 1 reviewer
  - **Dismiss stale reviews**: ✅
- **Require status checks to pass before merging**: ✅
  - Required checks:
    - `build` (Lint & Build)
    - `sbom` (SBOM & License)
    - `security` (Security Scan)
    - `compliance` (OPA Compliance)
    - `performance` (Lighthouse CI)
- **Require branches to be up to date**: ✅
- **Require deployments to succeed**: ✅

## Step 6: Set Build Numbers & Caching

The workflow uses GitHub's built-in caching for Node modules. To manually clear cache:

```
Settings → Actions → General → Caching
```

Click "Clear all caches" if you need to force a fresh dependency install.

## Step 7: Monitor Workflow Runs

### View Workflow Status
- Go to **Actions** tab
- Click on the workflow run to see detailed logs

### Debugging Failed Checks

**Build fails?**
- Check "Lint & Build" job logs
- Run `npm run lint && npm run typecheck` locally

**Tests fail?**
- Check "Unit tests" step
- Run `npm run test:ci` locally

**SBOM fails?**
- Ensure `package-lock.json` is committed
- FOSSA API key is valid

**Lighthouse fails?**
- Check performance budget in `lighthouserc.json`
- Run locally: `npm run build && npm run lighthouse`

**Compliance fails?**
- Check OPA policy in `policy/compliance.rego`
- Verify GDPR compliance routes exist

## Step 8: Local Testing Before Push

Before pushing, run the full CI pipeline locally:

```bash
# Install dependencies
npm ci

# Run all checks
npm run lint
npm run typecheck
npm run test:ci
npm run build
npm run lighthouse  # if configured

# Check environment variables
cat .env.local | grep -E "STRIPE|OPENAI|SUPABASE"
```

## Step 9: First Deployment

Once CI is passing:

1. Push to `main` (or merge a PR)
2. Go to **Actions** tab
3. Watch the workflow run through all 6 stages
4. Click "Deploy to Vercel" job to see deployment status
5. Check Vercel dashboard for deployment URL

## Troubleshooting

### Workflow doesn't trigger?
- Check `.github/workflows/ci.yml` syntax (use GitHub's YAML validator)
- Verify branch is in `on.push.branches` or `on.pull_request.branches`
- Check if branch protection is misconfigured

### GitHub Actions quota exceeded?
- Go to **Settings → Billing**
- Check your organization's action minutes
- Optimize workflow to reduce runs (e.g., skip some jobs on minor branches)

### Vercel deployment fails?
- Check `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` are correct
- Run `npm run build` locally to ensure it succeeds
- Check Vercel project settings match workflow

### FOSSA or Trivy scan hangs?
- Increase timeout in workflow (add `timeout-minutes: 30`)
- Check API key is valid and has quota

## Next Steps

✅ **Short term:**
- Push a test branch and verify workflow passes
- Merge first PR to main and watch production deployment

✅ **Medium term:**
- Set up Slack notifications for workflow failures (use GitHub Slack app)
- Configure automatic deployments for `release/*` branches
- Add custom metrics dashboard (Grafana)

✅ **Long term:**
- Implement blue-green deployments with automatic rollback
- Add feature flags (Unleash, LaunchDarkly)
- Set up multi-region deployment orchestration

---

**Questions?** See `.github/workflows/ci.yml` for full workflow definition.
