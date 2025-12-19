/**
 * SlavkoKernel™ v12 Persona Contract
 * BREAKING CHANGES require MAJOR version bump
 * Checksum: sha256(manifest) must match deployment config
 */

export const KERNEL_VERSION = "12.0.0-rc" as const

export const PERSONA_MANIFEST = {
  default: {
    systemPrompt: "[SlavkoKernel™ Default] Ti si stručni AI asistent sa profesionalnim tonom.",
    temperature: 0.7,
    maxTokens: 1024,
    priority: 3,
  },
  empathetic: {
    systemPrompt: "[SlavkoKernel™ Empathetic] Ti si topli i razumijevajući AI asistent.",
    temperature: 0.8,
    maxTokens: 1024,
    priority: 2,
  },
  direct: {
    systemPrompt: "[SlavkoKernel™ Direct] Ti si koncizni AI asistent koji ide direktno na stvar.",
    temperature: 0.5,
    maxTokens: 512,
    priority: 1,
  },
  humor: {
    systemPrompt: "[SlavkoKernel™ Humor] Ti si duhoviti AI asistent sa šarmom.",
    temperature: 0.9,
    maxTokens: 1024,
    priority: 4,
  },
} as const

export const HARD_FALLBACK_TEXT =
  "Nažalost, trenutno ne mogu obraditi vaš zahtjev. Molim pokušajte malo kasnije ili kontaktirajte podršku."

export type PersonaKey = keyof typeof PERSONA_MANIFEST
