# FORMATDISC Deployment Checklist

## Pre-Deployment

### 1. Environment Variables (Vercel Dashboard)

**Required - Supabase:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**Required - Stripe (LIVE):**
- [ ] `STRIPE_SECRET_KEY` = sk_live_51Rqoqx...
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_live_51Rqoqx...
- [ ] `STRIPE_WEBHOOK_SECRET` (from Stripe Dashboard)

**Required - Stripe Price IDs:**
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE`

**Required - App:**
- [ ] `NEXT_PUBLIC_APP_URL` = https://www.formatdisc.hr

**Optional - Redis:**
- [ ] `KV_REST_API_URL`
- [ ] `KV_REST_API_TOKEN`

---

## Deployment Steps

### Step 1: GitHub Push

```bash
# Initialize git if needed
git init

# Add remote
git remote add origin https://github.com/mladengertner/formatdisc.hr.git

# Add all files
git add .

# Commit
git commit -m "Initial production deployment - FORMATDISC v1.0.0"

# Push
git push -u origin main
```

### Step 2: Vercel Deployment

1. Go to https://vercel.com/new
2. Import `mladengertner/formatdisc.hr` repository
3. Configure project:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: `next build`
   - Output Directory: `.next`
4. Add all environment variables from checklist above
5. Deploy

### Step 3: Supabase SQL Migrations

Run scripts in order in Supabase SQL Editor:

```
1. scripts/001_schema.sql
2. scripts/002_rls_policies.sql
3. scripts/002_stripe_tables.sql
4. scripts/003_profile_trigger.sql
5. scripts/004_agents_schema.sql
6. scripts/005_enterprise_functions.sql
7. scripts/006_orders_table.sql
```

### Step 4: Stripe Webhook Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://www.formatdisc.hr/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook secret to Vercel env vars

### Step 5: Custom Domain (Vercel)

1. Go to Vercel Project > Settings > Domains
2. Add `formatdisc.hr` and `www.formatdisc.hr`
3. Configure DNS in your domain registrar:
   - A record: `76.76.19.61`
   - CNAME: `cname.vercel-dns.com`

### Step 6: Cloudflare (Optional CDN)

1. Add site to Cloudflare
2. Update nameservers at domain registrar
3. Enable:
   - SSL: Full (strict)
   - Always Use HTTPS
   - Auto Minify
   - Brotli compression

---

## Post-Deployment Verification

- [ ] Homepage loads: https://www.formatdisc.hr
- [ ] SSL certificate active (green lock)
- [ ] Stripe checkout works (test with test card 4242...)
- [ ] Auth signup/login works
- [ ] Contact form submits
- [ ] All social links work (LinkedIn, GitHub, etc.)
- [ ] Mobile responsive
- [ ] Lighthouse score > 90

---

## Rollback Plan

```bash
# Vercel automatic rollback
vercel rollback

# Or redeploy previous commit
git revert HEAD
git push origin main
```

---

## Support

- Email: info@formatdisc.hr
- Phone: +385 91 542 1014
- GitHub Issues: https://github.com/mladengertner/formatdisc.hr/issues
