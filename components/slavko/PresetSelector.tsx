"use client"

import type { PromptPreset } from "@/lib/types/slavko"
import { Button } from "@/components/ui/button"

const PRESETS: PromptPreset[] = [
  {
    id: "support",
    name: "Support Reply",
    description: "Odgovori na korisničku poruku",
    prompt: "Oblikuj profesionalan odgovor na korisničku poruku sa fokusom na rješavanje problema.",
    config: { model: "llama2" },
  },
  {
    id: "compliance",
    name: "Compliance Check",
    description: "Provjera GDPR/SOC2 sukladnosti",
    prompt: "Analizi kontekst za GDPR, SOC2 i regulatorne zahtjeve. Koji rizici postoje?",
    config: { model: "mistral" },
  },
  {
    id: "marketing",
    name: "Marketing Copy",
    description: "Kreiraj marketinški sadržaj",
    prompt: "Kreiraj privlačan marketinški tekst za Enterprise SaaS proizvod u 2-3 rečenice.",
    config: { model: "llama2" },
  },
  {
    id: "technical",
    name: "Technical Explanation",
    description: "Tehničko objašnjenje",
    prompt: "Objasni arhitekturni koncept na način koji je razumljiv za senior engineere.",
    config: { model: "codellama" },
  },
]

interface PresetSelectorProps {
  onSelect: (preset: PromptPreset) => void
}

export function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Scenariji</h3>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onSelect(preset)}
            className="h-auto flex flex-col items-start p-2"
          >
            <span className="font-medium text-xs">{preset.name}</span>
            <span className="text-xs text-muted-foreground">{preset.description}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
