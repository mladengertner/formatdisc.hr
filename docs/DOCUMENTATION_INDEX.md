# FormatDisc.hr Documentation Index

## Quick Navigation

| Document | Purpose | Audience |
|----------|---------|----------|
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Commands & cheatsheet | All developers |
| [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) | Deploy instructions | DevOps |
| [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) | Security overview | Security team |
| [COMPLIANCE_FRAMEWORK.md](./COMPLIANCE_FRAMEWORK.md) | GDPR/SOC2/HIPAA | Compliance |
| [ENVIRONMENT-CONFIG.md](./ENVIRONMENT-CONFIG.md) | Env setup | All developers |

## Getting Started

### For New Developers
1. Read \`.github/copilot-instructions.md\`
2. Setup environment with \`QUICK_REFERENCE.md\`
3. Run \`pnpm install && pnpm dev\`

### For AI Agents
1. Reference \`.github/copilot-instructions.md\` for conventions
2. Follow database patterns in \`scripts/\`
3. Use \`lib/\` utilities for common operations

### For DevOps
1. Review \`.github/workflows/ci-cd.yml\`
2. Configure secrets in GitHub
3. Setup Vercel project connection

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLOUDFLARE                        │
│                   (CDN + WAF)                        │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                     VERCEL                           │
│              (Next.js 16 Runtime)                    │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   App Router │ │ API Routes  │ │  Middleware │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼───────┐ ┌───▼───┐ ┌──────▼──────┐
│   SUPABASE    │ │ STRIPE│ │   UPSTASH   │
│ (DB + Auth)   │ │(Billing)│ │   (Redis)   │
└───────────────┘ └───────┘ └─────────────┘
```

## Learning Path

### Day 1: Basics
- [ ] Clone repository
- [ ] Setup environment
- [ ] Run locally
- [ ] Explore folder structure

### Day 2: Development
- [ ] Create a component
- [ ] Add an API route
- [ ] Test database queries

### Week 1: Integration
- [ ] Understand auth flow
- [ ] Implement Stripe checkout
- [ ] Add audit logging

### Week 2+: Advanced
- [ ] Customize CI/CD
- [ ] Add OPA policies
- [ ] Performance optimization

## Contact

**FORMATDISC, vl. Mladen Gertner**
- Website: www.formatdisc.hr
- Email: info@formatdisc.hr
- Phone: +385 91 542 1014
- GitHub: github.com/mladengertner
- LinkedIn: linkedin.com/in/mladen-gertner
