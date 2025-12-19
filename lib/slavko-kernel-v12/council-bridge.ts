// SlavkoKernel v12 + v7 Council Bridge
// Optional but recommended: route certain personas through v7 council for enhanced AI decision-making

const SLAVKO_BASE_URL = process.env.SLAVKO_BASE_URL || "http://localhost:8000"
const SLAVKO_TOKEN = process.env.SLAVKO_API_TOKEN || ""

interface CouncilRequest {
  pipeline: string
  prompt: string
  persona?: string
}

interface CouncilResult {
  summary?: string
  markdown?: string
  json?: any
}

export async function runSlavkoCouncil(req: CouncilRequest): Promise<CouncilResult> {
  const endpoint = `${SLAVKO_BASE_URL}/v1/council/run`
  const body = {
    pipeline: req.pipeline,
    inputs: {
      prompt: req.prompt,
      persona: req.persona,
    },
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(SLAVKO_TOKEN ? { Authorization: `Bearer ${SLAVKO_TOKEN}` } : {}),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Slavko v7 council error: ${res.status} ${res.statusText}`)
  }

  const text = await res.text()
  let json: any = null
  try {
    json = JSON.parse(text)
  } catch {
    // Non-JSON response, fallback to plain text
  }

  const markdown = json?.markdown ?? json?.output_markdown ?? null
  const summary = json?.summary ?? json?.output ?? text

  return {
    summary,
    markdown,
    json: json ?? { raw: text },
  }
}
