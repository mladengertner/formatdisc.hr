import { type NextRequest, NextResponse } from "next/server"

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 100

type RateLimitStore = Map<string, { count: number; resetAt: number }>

const store: RateLimitStore = new Map()

function getClientId(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"
  return ip
}

function cleanupStore() {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (value.resetAt < now) {
      store.delete(key)
    }
  }
}

export function rateLimit(req: NextRequest): NextResponse | null {
  cleanupStore()

  const clientId = getClientId(req)
  const now = Date.now()
  const record = store.get(clientId)

  if (!record || record.resetAt < now) {
    store.set(clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return null
  }

  if (record.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many requests from this IP" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((record.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(record.resetAt / 1000)),
        },
      },
    )
  }

  record.count++
  return null
}
