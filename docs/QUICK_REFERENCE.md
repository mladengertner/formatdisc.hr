# FormatDisc.hr Quick Reference

## Common Commands

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Run development | `pnpm dev` |
| Build production | `pnpm build` |
| Run linter | `pnpm lint` |
| Type check | `pnpm tsc --noEmit` |
| Run tests | `pnpm test` |

## Environment Variables

### Required for Development
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

### Optional
```bash
NEXT_PUBLIC_APP_URL=https://www.formatdisc.hr
OLLAMA_API_URL=http://localhost:11434
AUDIT_SECRET=
```

## Database Migrations

Run in order:
1. `scripts/001_schema.sql` - Core tables
2. `scripts/002_rls_policies.sql` - RLS security policies
3. `scripts/003_profile_trigger.sql` - Auto profile creation
4. `scripts/004_agents_schema.sql` - AI agents
5. `scripts/005_enterprise_functions.sql` - Enterprise features
6. `scripts/006_orders_table.sql` - Orders and billing

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/experiments/[id]` | GET | Load experiment definition |
| `/api/experiments/[id]/run` | POST | Execute experiment pipeline |
| `/api/agents/execute` | POST | Execute AI agent |
| `/api/slavko/execute` | POST | Run SlavkoKernel simulator |
| `/api/slavko/health` | GET | Check SlavkoKernel status |
| `/api/stripe/create-checkout-session` | POST | Create Stripe checkout |
| `/api/stripe/webhook` | POST | Stripe webhook handler |

## Experiment Orchestrator Quick Start

### Load and Run Experiment

```tsx
// Navigate to /experiments/[id]
// 1. Select scenario preset (Happy Path, High Risk, GDPR)
// 2. Adjust risk score slider
// 3. Click "Run Simulation"
// 4. Watch pipeline execute in real-time
```

### Step Types

| Type | Purpose |
|------|---------|
| `input` | Capture initial data |
| `transform` | Map fields, apply filters |
| `ai_decision` | Make AI-driven decisions |
| `compliance_check` | Validate GDPR/SOC2 |
| `metrics` | Aggregate final metrics |
| `webhook` | Send to external API |
| `data_mapping` | Map nested object paths |

### Adding Custom Step Handler

```tsx
// In lib/experiment-runner.ts
const stepHandlers: Record<string, StepHandler> = {
  // ... existing
  custom_step: async (step, ctx) => {
    return { result: 'success' }
  }
}
```

## SlavkoKernel Simulator

### Navigate to Simulator

```
/app/slavko/simulator
```

### Features

- **4 Scenario Presets** – Automate, Manual, Real-time, Stress-test
- **Prompt Editor** – Write custom SlavkoKernel prompts
- **Config Panel** – Select model, temperature, max tokens
- **Execution Timeline** – Watch 4-step pipeline with live status
- **Run History** – Inspect past executions

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Tenant or user not found" | Add `auth.uid()::uuid` cast in RLS policies |
| "Multiple GoTrueClient instances" | Check Supabase client singleton in `lib/supabase/client.ts` |
| Stripe webhook fails | Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard |
| Auth not working | Test with `curl -H "Authorization: Bearer $TOKEN" /api/auth/session` |
| Build fails | Run `pnpm tsc --noEmit` to check TypeScript errors |
| Experiment run hangs | Check network in browser DevTools, ensure API accessible |
| SlavkoKernel returns 500 | Verify Ollama running on `OLLAMA_API_URL` |

## Deployment Checklist

- [ ] All env vars configured in Vercel (use `.env.example` as reference)
- [ ] SQL migrations run in Supabase (run `scripts/000_MASTER_MIGRATION.sql` if fresh start)
- [ ] Stripe webhook endpoint configured at `https://www.formatdisc.hr/api/stripe/webhook`
- [ ] Domain DNS configured with CNAME to Vercel
- [ ] SSL certificate active (auto with Vercel)
- [ ] GitHub Actions secrets set (VERCEL_TOKEN, ORG_ID, PROJECT_ID)
- [ ] Performance: Lighthouse CI score > 90

## Key Files

| File | Purpose |
|------|---------|
| `lib/experiment-runner.ts` | Dynamic step orchestrator |
| `lib/slavko-kernel.ts` | SlavkoKernel Ollama client |
| `lib/stripe.ts` | Stripe client & helpers |
| `lib/supabase/` | Supabase clients (client/server/admin) |
| `.github/workflows/ci-cd.yml` | 6-stage CI/CD pipeline |
| `policy/compliance.rego` | OPA compliance checks |

## Security Best Practices

✅ **Always do:**
- Use `createServerClient` in route handlers
- Cast `auth.uid()::uuid` in RLS policies
- Validate input with Zod schemas
- Log all sensitive operations
- Use environment variables for secrets

❌ **Never do:**
- Hardcode API keys or secrets
- Use `localStorage` for auth tokens
- Skip RLS policies on tables
- Log PII or payment data
- Trust client input without validation

## Support

- **Email**: info@formatdisc.hr
- **Phone**: +385 91 542 1014
- **GitHub**: github.com/mladengertner
- **Docs**: `/docs` directory in repo
