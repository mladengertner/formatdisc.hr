"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

interface LanguageToggleProps {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const [lang, setLang] = useState<"en" | "hr">("en")

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "hr" : "en"
    setLang(newLang)
    document.documentElement.lang = newLang
  }

  return (
    <nav aria-label="Language selector" className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        aria-label={lang === "en" ? "Switch to Croatian" : "Switch to English"}
        className="gap-2"
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium">{lang === "en" ? "HR" : "EN"}</span>
      </Button>
    </nav>
  )
}
