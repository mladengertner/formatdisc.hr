# FormatDisc.hr - AI Copilot Instructions

## Project Overview
FormatDisc.hr is an enterprise SaaS platform for MVP simulation and rapid prototyping.
- **Owner**: FORMATDISC, vl. Mladen Gertner
- **OIB**: 18915075854
- **Domain**: www.formatdisc.hr

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe (Live mode)
- **Cache**: Upstash Redis
- **Deployment**: Vercel + Cloudflare

## Code Conventions

### File Naming
- Components: `kebab-case.tsx` (e.g., `hero-section.tsx`)
- Utilities: `camelCase.ts` (e.g., `getSession.ts`)
- Constants: `SCREAMING_SNAKE_CASE`

### Component Structure
```tsx
// 1. Imports (external, internal, types)
// 2. Types/Interfaces
// 3. Constants
// 4. Component
// 5. Export
```

### Database Queries
- Always use parameterized queries
- Include RLS policies with \`auth.uid()::uuid\` cast
- Use \`SECURITY DEFINER SET search_path = public, auth\` for functions

### API Routes
- Validate all inputs with Zod
- Use \`getEnvOrThrow()\` for required env vars
- Include audit logging for sensitive operations
- Return consistent error responses

### Authentication
- Use Supabase Auth exclusively
- Server components: \`createServerClient\`
- Client components: \`createBrowserClient\`
- Always check session before protected operations

### Stripe Integration
- Use \`getOrCreateStripeCustomer()\` for customer mapping
- Log all webhook events to \`stripe_events\` table
- Implement idempotency checks

## Important Files
- \`lib/env.ts\` - Environment validation
- \`lib/stripe.ts\` - Stripe client
- \`lib/supabase/\` - Supabase clients (client, server, admin)
- \`lib/auth/\` - Authentication helpers

## Brand Colors
- Primary Green: \`#76B900\` / \`oklch(0.7 0.2 110)\`
- Background: \`#0a0a0a\` (dark mode)
- Foreground: \`#fafafa\`

## Do NOT
- Hardcode secrets or API keys
- Use \`localStorage\` for sensitive data
- Skip RLS policies
- Ignore TypeScript errors
- Use \`any\` type without justification

## Always
- Add ARIA labels for accessibility
- Use semantic HTML elements
- Include loading and error states
- Write bilingual content (EN/HR)
- Log audit events for compliance
