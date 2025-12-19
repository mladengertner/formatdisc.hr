# 🎓 FormatDisc.hr - Team Onboarding Guide

Welcome to FormatDisc.hr! This guide will get you productive in **5 minutes**.

---

## ⚡ Day 1 Quick Start (5 minutes)

### 1. Clone & Setup (2 min)
```bash
git clone https://github.com/formatdisc/v0-nvidia-playground-monorepo.git
cd v0-nvidia-playground-monorepo
npm install
```

### 2. Create Local Environment (2 min)
```bash
cp .env.example .env.local
# Ask your team lead for actual API keys
# Fill in: SUPABASE_URL, STRIPE_KEY, OPENAI_KEY, etc.
```

### 3. Start Dev Server (1 min)
```bash
npm run dev
# Open http://localhost:3000 in browser
```

✅ **Done!** You're now running FormatDisc.hr locally.

---

## 📚 Day 1 Learning (30 minutes)

**Pick Your Path:**

### 👨‍💻 I'm a Developer
1. Read [`README.md`](README.md) — Architecture overview (15 min)
2. Read [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — Code patterns (15 min)
3. Bookmark [`QUICK_REFERENCE.md`](QUICK_REFERENCE.md) — Cheat sheet (5 min)

### 🔧 I'm DevOps / Infrastructure
1. Read [`CI_CD_SETUP.md`](CI_CD_SETUP.md) — GitHub Actions setup (20 min)
2. Review [`policy/compliance.rego`](policy/compliance.rego) — OPA rules (10 min)
3. Check [`PIPELINE_DIAGRAM.md`](PIPELINE_DIAGRAM.md) — Mermaid diagrams (10 min)

### 🤖 I'm Working with AI / Copilot
1. Read [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — Full guide (20 min)
2. Review code examples — Section "Common Code Patterns" (10 min)

---

## 🚀 Day 2 - Make Your First Commit

### 1. Create a Feature Branch
```bash
git checkout -b feature/hello-world
```

### 2. Make a Small Change
Edit `app/page.tsx` or create a new component in `components/`

### 3. Commit & Push
```bash
git add .
git commit -m "feat: add hello world component"
git push origin feature/hello-world
```

### 4. Watch CI Pipeline
Go to GitHub → Actions tab → see all 6 stages run automatically:

```
✅ Stage 1: Build (Lint, TypeScript, Tests)
✅ Stage 2: SBOM & License (Dependencies)
✅ Stage 3: Security (Trivy, npm audit)
✅ Stage 4: Compliance (OPA policy)
✅ Stage 5: Performance (Lighthouse CI)
✅ Stage 6: Deploy (if main branch)
```

### 5. Create Pull Request
Push to GitHub and create PR. Wait for all checks to pass (green ✅).

---

## 📖 Essential Knowledge

### The 5-Phase Pipeline (What We Promise Customers)

```
Phase 1: CLIENT INPUT (2h)        → Understand requirements
Phase 2: MVP SIMULATION (12h)      → Test in sandbox
Phase 3: ORCHESTRATION (8h)        → Deploy models & scale
Phase 4: COMPLIANCE GATE (4h)      → Verify GDPR/SOC2
Phase 5: PRODUCTION DEPLOY (24h)   → Zero-downtime live
```

Every code change follows this pattern in CI/CD.

### Key Files You'll Use Daily

| File | Purpose | When |
|------|---------|------|
| `app/` | Next.js 15 code | Every feature |
| `components/` | React components | UI work |
| `lib/` | Utilities & helpers | Shared logic |
| `.github/copilot-instructions.md` | Code patterns | When coding |
| `QUICK_REFERENCE.md` | Commands & cheat sheet | Bookmark! |

### Commands You'll Run

```bash
npm run dev            # Start dev server (localhost:3000)
npm run lint           # Check code style
npm run typecheck      # Find TypeScript errors
npm run test:ci        # Run unit tests
npm run build          # Production build
git push origin main   # Trigger full CI/CD pipeline
```

---

## 🔐 Security & Compliance Quick Rules

✅ **Always Do:**
- Store secrets in `.env.local` (never commit)
- Log important actions to audit trail
- Use parameterized database queries
- Follow code patterns in copilot-instructions.md

❌ **Never Do:**
- Hardcode API keys in code
- Skip audit logging
- Use string interpolation for SQL
- Ignore CI/CD failures

---

## 📞 Getting Help

| Question | Answer |
|----------|--------|
| How do I code a feature? | Read `.github/copilot-instructions.md` § Code Patterns |
| Why did CI fail? | Check GitHub Actions job logs + `QUICK_REFERENCE.md` § Troubleshooting |
| How do I set up GitHub? | Follow `CI_CD_SETUP.md` step-by-step |
| What's the architecture? | See `README.md` § Technical & System Architecture |
| Quick commands? | Bookmark `QUICK_REFERENCE.md` |

---

## 📋 Week 1 Milestones

- [ ] **Day 1**: Clone repo, run locally, read architecture
- [ ] **Day 1**: Read code patterns for your role
- [ ] **Day 2**: Make & push first feature branch
- [ ] **Day 2**: Watch full CI/CD pipeline run
- [ ] **Day 3**: Create & merge first PR
- [ ] **Day 4**: Understand compliance gates in CI/CD
- [ ] **Day 5**: Help another team member onboard

---

## 🎯 What Makes FormatDisc.hr Special

1. **48-Hour SLA** — Every commit is production-ready
2. **Zero-Downtime** — Blue-green deployments, no customer impact
3. **Audit-Ready** — GDPR/SOC2/HIPAA compliant by default
4. **Secure By Design** — Trivy + npm audit on every push
5. **AI-Friendly** — Clear patterns, conventions, examples
6. **Well-Documented** — 8+ guides for every use case

---

## 🎊 Welcome to the Team!

You're now part of an **enterprise-grade AI SaaS platform** with:
- ✅ Automated quality gates
- ✅ Security scanning on every commit
- ✅ Compliance enforcement (GDPR/SOC2/HIPAA)
- ✅ Performance budgets (Web Vitals)
- ✅ Zero-downtime deployments
- ✅ Immutable audit trails

**Your first week goal:** Understand the architecture, make your first commit, watch CI/CD run. 🚀

---

## 🆘 Stuck? Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Check Node.js version: `node -v` (need 18+) |
| `.env.local` error | Copy `.env.example` and ask for actual keys |
| Dev server won't start | Kill port 3000: `lsof -ti:3000 \| xargs kill -9` |
| CI fails on push | Read GitHub Actions logs, follow fixes in `QUICK_REFERENCE.md` |
| Don't understand code | Ask in #dev-help or see `.github/copilot-instructions.md` |

---

**Need anything else?** Ask your team lead or create an issue on GitHub! 💪

---

**Built with ❤️ by FormatDisc.hr Team**  
**Last Updated**: December 2025
