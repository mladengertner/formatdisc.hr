# FORMATDISC Deployment Guide

## Prerequisites

- Node.js 18+
- Redis instance (Upstash or local)
- Supabase or Neon database
- Stripe account with webhook endpoint configured
- Environment variables configured

## Environment Setup

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
# Database
POSTGRES_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Redis (Upstash)
KV_URL="redis://..."
KV_REST_API_TOKEN="..."
KV_REST_API_URL="https://..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Security
JWT_SECRET="..." # Generate with: openssl rand -base64 32
ENCRYPTION_KEY="..." # Generate with: openssl rand -hex 32

# App
NEXT_PUBLIC_BASE_URL="https://formatdisc.hr"
```

## Database Setup

Run SQL migration scripts in order:

```bash
# Run against your Supabase/Neon database
psql $POSTGRES_URL -f scripts/001_schema.sql
psql $POSTGRES_URL -f scripts/002_rls_policies.sql
psql $POSTGRES_URL -f scripts/003_profile_trigger.sql
```

## Build & Deploy

### Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t formatdisc-platform .
docker run -p 3000:3000 --env-file .env.local formatdisc-platform
```

### Vercel Deployment

```bash
vercel --prod
```

Ensure all environment variables are set in Vercel dashboard.

## Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://formatdisc.hr/api/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Post-Deployment Checklist

- [ ] Landing page loads with slot counter
- [ ] Language toggle (EN/HR) works
- [ ] Stripe checkout creates session successfully
- [ ] Webhook receives and processes payment events
- [ ] Slot counter decrements after successful payment
- [ ] Founder console shows real-time data
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Audit logging captures all events
- [ ] All environment variables validated on startup

## Monitoring

Check these endpoints for health:
- `/api/slots` - Slot state
- `/api/ledger` - Recent audit events
- `/founder` - Founder console (requires auth)

Monitor Stripe webhook deliveries in Stripe Dashboard.
