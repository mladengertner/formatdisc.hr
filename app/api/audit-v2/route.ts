import { NextResponse } from "next/server"
import { logAudit } from "@/lib/auditLogger"
import type { AuditReport } from "@/lib/auditModel"

export async function POST(req: Request) {
  const body = await req.json()
  const report: AuditReport = body

  if (!report.clientName || !report.issues || !Array.isArray(report.issues)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await logAudit({
    event: "diagnostic_audit_v2_generated",
    path: "/api/audit-v2",
    method: "POST",
    timestamp: new Date().toISOString(),
    meta: {
      auditId: report.auditId,
      clientName: report.clientName,
      issueCount: report.issues.length,
      totalEstimatedRecoveryPerMonth: report.totalEstimatedRecoveryPerMonth,
      recommendedTierOverall: report.recommendedTierOverall,
    },
  })

  const pdfContent = generateAuditPdfContent(report)

  return new NextResponse(new Uint8Array(pdfContent), {

    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${report.auditId}.pdf"`,
    },
  })
}

function generateAuditPdfContent(report: AuditReport): Buffer {
  const lines: string[] = []

  lines.push("FORMATDISC — 24H DIAGNOSTIC AUDIT")
  lines.push("")
  lines.push(`Client: ${report.clientName}`)
  lines.push(`Audit ID: ${report.auditId}`)
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push("")
  lines.push("EXECUTIVE SUMMARY")
  lines.push(report.summary)
  lines.push("")

  if (report.totalEstimatedRecoveryPerMonth) {
    lines.push(`Estimated monthly recovery: €${report.totalEstimatedRecoveryPerMonth.toLocaleString()}`)
  }
  lines.push(`Recommended tier: ${report.recommendedTierOverall.toUpperCase()}`)
  lines.push("")
  lines.push("ISSUES BREAKDOWN")
  lines.push("-".repeat(50))

  report.issues.forEach((issue, index) => {
    lines.push(`\nIssue ${index + 1}: ${issue.title}`)
    lines.push(`Dimension: ${issue.dimension.toUpperCase()} | Severity: ${issue.severity}/5`)
    lines.push(`Problem: ${issue.problem}`)
    lines.push(`Impact: ${issue.impactNarrative}`)
    if (issue.impactEuroPerMonth) {
      lines.push(`Estimated impact: €${issue.impactEuroPerMonth.toLocaleString()}/month`)
    }
    lines.push(`Recommended tier: ${issue.tierRecommendation.toUpperCase()}`)
    lines.push(`Estimated window: ${issue.estimatedWindowHours}h`)
    lines.push(`Fix plan: ${issue.fixPlan}`)
  })

  return Buffer.from(lines.join("\n"), "utf8")
}
