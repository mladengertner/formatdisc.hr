import { NextResponse } from "next/server"
import type { MvpSimulationRequest, MvpSimulationResponse, Phase } from "@/lib/types/mvp-simulator"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MvpSimulationRequest

    const { ideaType, targetAudience, keyFeatures, complianceLevel } = body

    if (!ideaType || !keyFeatures || keyFeatures.length < 20) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const basePhases: Phase[] = [
      {
        id: 1,
        name: "Phase 1",
        label: "Client Input / Klijent Zahtjev",
        status: "success",
        metrics: {
          durationHours: 2,
          successRate: 100,
          notes: "Requirements captured via intake form",
        },
      },
      {
        id: 2,
        name: "Phase 2",
        label: "MVP Simulation / MVP Simulacija",
        status: "success",
        metrics: {
          durationHours: ideaType === "ai_chatbot" ? 10 : ideaType === "mobile_app" ? 12 : 8,
          successRate: 99.7,
          notes: "Zagreb sandbox environment",
        },
      },
      {
        id: 3,
        name: "Phase 3",
        label: "SlavkoKernel Orchestration / Orkestracija",
        status: "success",
        metrics: {
          durationHours: ideaType === "saas_dashboard" ? 10 : 8,
          successRate: 98.2,
          notes: "Autonomous model loading & resource management",
        },
      },
      {
        id: 4,
        name: "Phase 4",
        label: "Compliance Gate",
        status: "success",
        metrics: {
          durationHours: complianceLevel === "finance_grade" ? 10 : complianceLevel === "gdpr_strict" ? 8 : 6,
          successRate: complianceLevel === "finance_grade" ? 97.5 : 98.0,
          notes: `${complianceLevel === "finance_grade" ? "SOC2/HIPAA" : complianceLevel === "gdpr_strict" ? "GDPR strict" : "Standard"} checks passed`,
        },
      },
      {
        id: 5,
        name: "Phase 5",
        label: "Production / Produkcija",
        status: "success",
        metrics: {
          durationHours: 24,
          successRate: 100,
          notes: "Zero-downtime deploy to Vercel/Cloudflare",
        },
      },
    ]

    const totalHours = basePhases.reduce((sum, phase) => sum + phase.metrics.durationHours, 0)

    const response: MvpSimulationResponse = {
      phases: basePhases,
      summary: `Your ${ideaType.replace("_", " ")} MVP will be production-ready in approximately ${totalHours} hours (2 business days) with ${complianceLevel === "finance_grade" ? "SOC2/HIPAA" : complianceLevel === "gdpr_strict" ? "GDPR strict" : "standard"} compliance. Target audience: ${targetAudience || "General"}. All phases fully auditable and documented.`,
      etaHours: totalHours,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] MVP Simulation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
