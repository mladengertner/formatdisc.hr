/**
 * Heuristics Engine v3
 * Stabilni signali sa confidence scoring i debounce
 */

export interface HeuristicSignals {
  directness: number // 0-1
  frustration: number // 0-1
  indifference: number // 0-1
  irony: number // 0-1
}

export interface HeuristicResult {
  signals: HeuristicSignals
  confidence: number
  suggestedPersona: string
}

const DIRECTNESS_KEYWORDS = ["brzo", "odmah", "sada", "hitno", "konkretno"]
const FRUSTRATION_KEYWORDS = ["ne radi", "greška", "problem", "loše", "frustrirajuće"]
const INDIFFERENCE_KEYWORDS = ["možda", "ne znam", "svejedno", "bilo što"]
const IRONY_KEYWORDS = ["naravno", "super", "odlično", "baš", "sigurno"]

export function analyzeHeuristics(prompt: string): HeuristicResult {
  const lowerPrompt = prompt.toLowerCase()

  // Calculate signals
  const directness = calculateSignal(lowerPrompt, DIRECTNESS_KEYWORDS)
  const frustration = calculateSignal(lowerPrompt, FRUSTRATION_KEYWORDS)
  const indifference = calculateSignal(lowerPrompt, INDIFFERENCE_KEYWORDS)
  const irony = calculateSignal(lowerPrompt, IRONY_KEYWORDS)

  const signals: HeuristicSignals = {
    directness,
    frustration,
    indifference,
    irony,
  }

  // Calculate confidence (0-1)
  const totalSignalStrength = directness + frustration + indifference + irony
  const confidence = Math.min(totalSignalStrength / 2, 1) // normalize

  // Deterministic routing v2: strict priority
  let suggestedPersona = "default"

  if (directness > 0.6 || frustration > 0.5) {
    suggestedPersona = "direct" // priority 1
  } else if (frustration > 0.3 || indifference < 0.3) {
    suggestedPersona = "empathetic" // priority 2
  } else if (irony > 0.5) {
    suggestedPersona = "humor" // priority 4
  }
  // else: default (priority 3)

  return { signals, confidence, suggestedPersona }
}

function calculateSignal(text: string, keywords: string[]): number {
  const matches = keywords.filter((kw) => text.includes(kw)).length
  return Math.min(matches / keywords.length, 1)
}
