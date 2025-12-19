import { kv } from "@vercel/kv"

const SLOTS_TOTAL = 100
const SLOTS_USED_KEY = "slots:used"
const SLOTS_LEDGER_KEY = "slots:ledger"

export type SlotState = {
  total: number
  remaining: number
  used: number
  escalationTriggered: boolean
  lastClaimedAt?: string
}

export async function getSlotState(): Promise<SlotState> {
  try {
    const used = (await kv.get<number>(SLOTS_USED_KEY)) ?? 0
    const remaining = Math.max(0, SLOTS_TOTAL - used)
    const escalationTriggered = used >= SLOTS_TOTAL

    const ledger = await kv.lrange(SLOTS_LEDGER_KEY, 0, 0)
    const lastClaimedAt = ledger[0] ? (ledger[0] as any).timestamp : undefined

    return {
      total: SLOTS_TOTAL,
      remaining,
      used,
      escalationTriggered,
      lastClaimedAt,
    }
  } catch (error) {
    console.error("[slotLedger] getSlotState error:", error)
    return {
      total: SLOTS_TOTAL,
      remaining: SLOTS_TOTAL,
      used: 0,
      escalationTriggered: false,
    }
  }
}

export async function claimSlot(metadata: { email?: string; tier?: string }): Promise<boolean> {
  try {
    const state = await getSlotState()
    if (state.remaining <= 0) {
      return false
    }

    await kv.incr(SLOTS_USED_KEY)

    const event = {
      event: "slot_claimed",
      timestamp: new Date().toISOString(),
      metadata,
    }
    await kv.lpush(SLOTS_LEDGER_KEY, event)

    return true
  } catch (error) {
    console.error("[slotLedger] claimSlot error:", error)
    return false
  }
}

export async function retrySlotClaim(
  metadata: { email?: string; tier?: string; sessionId?: string },
  maxRetries = 3,
): Promise<boolean> {
  let attempt = 0
  while (attempt < maxRetries) {
    try {
      const claimed = await claimSlot(metadata)
      if (claimed) {
        console.log(`[slotLedger] Slot claimed successfully on attempt ${attempt + 1}`)
        return true
      }
      // Slot unavailable, don't retry
      return false
    } catch (error) {
      attempt++
      console.error(`[slotLedger] Retry attempt ${attempt}/${maxRetries} failed:`, error)
      if (attempt < maxRetries) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)))
      }
    }
  }
  return false
}
