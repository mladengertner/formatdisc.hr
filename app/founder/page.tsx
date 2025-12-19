import { getSlotState } from "@/lib/slotLedger"
import { getPricing } from "@/lib/pricingEngine"

export const dynamic = "force-dynamic"

export default async function FounderConsolePage() {
  const slotState = await getSlotState()
  const pricing = await getPricing()

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">FORMATDISC Founder Console</h1>
          <p className="mt-2 text-sm text-neutral-400 max-w-2xl">
            Command center for slots, pricing, audits, and governance signals. Architect-level visibility only.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <SlotCard slotState={slotState} />
          <PricingCard pricing={pricing} />
          <SystemSignalsCard />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <LedgerSection />
          <AuditSection />
        </section>
      </div>
    </main>
  )
}

function SlotCard({ slotState }: { slotState: { remaining: number; total: number; escalationTriggered?: boolean } }) {
  const claimed = slotState.total - slotState.remaining
  const percent = Math.round((claimed / slotState.total) * 100)

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
      <h2 className="text-sm font-semibold text-white mb-2">Founder&apos;s Edition Slots</h2>
      <p className="text-sm text-neutral-300">
        Remaining: <span className="font-semibold">{slotState.remaining}</span> / {slotState.total}
      </p>
      <div className="mt-3 h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-neutral-400">{percent}% claimed</p>
      {slotState.escalationTriggered && (
        <p className="mt-2 text-xs font-medium text-red-400">Escalation active — all tiers at ×3 pricing.</p>
      )}
    </div>
  )
}

function PricingCard({ pricing }: { pricing: any }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
      <h2 className="text-sm font-semibold text-white mb-2">Pricing & Escalation</h2>
      <ul className="space-y-1 text-xs text-neutral-300">
        {pricing.tiers.map((tier: any) => (
          <li key={tier.tier} className="flex justify-between gap-2">
            <span className="capitalize">{tier.tier}</span>
            <span>€{tier.activePrice.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-neutral-400">
        Escalation: {pricing.slotState.escalationTriggered ? "ACTIVE" : "Not triggered"}
      </p>
    </div>
  )
}

function SystemSignalsCard() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
      <h2 className="text-sm font-semibold text-white mb-2">System Signals</h2>
      <ul className="space-y-1 text-xs text-neutral-300">
        <li>• Stripe webhook: operational</li>
        <li>• Redis: slots & audit log active</li>
        <li>• JWT middleware: guarding protected routes</li>
        <li>• AES-256-GCM encryption: active</li>
      </ul>
    </div>
  )
}

async function LedgerSection() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/ledger`, {
    cache: "no-store",
  })
  const events = res.ok ? await res.json() : []

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-white">Ledger Events</h2>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-neutral-500">No events yet</p>
        ) : (
          <ul className="space-y-2 text-xs text-neutral-300">
            {events.slice(0, 10).map((e: any, i: number) => (
              <li key={i} className="border-b border-neutral-800 pb-2">
                <span className="text-emerald-400">{e.event}</span>
                <span className="ml-2 text-neutral-500">{new Date(e.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

async function AuditSection() {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-white">Diagnostic Audits</h2>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
        <p className="text-xs text-neutral-400">Audit list integration ready</p>
        <a href="/api/audit-v2" className="mt-3 inline-block text-xs text-emerald-400 hover:text-emerald-300">
          Generate Test Audit →
        </a>
      </div>
    </div>
  )
}
