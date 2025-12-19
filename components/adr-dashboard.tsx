"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"

interface ADR {
  id: string
  title: string
  riskLevel: "HIGH" | "MEDIUM" | "LOW"
  owner: string
  completion: number
  blocker: string | null
  status: "complete" | "in-progress" | "blocked"
}

const adrs: ADR[] = [
  {
    id: "ADR-001",
    title: "Audit Logging Strategy",
    riskLevel: "HIGH",
    owner: "Backend Lead",
    completion: 85,
    blocker: "Hash chaining not implemented",
    status: "blocked",
  },
  {
    id: "ADR-002",
    title: "Multi-Tenant Architecture",
    riskLevel: "MEDIUM",
    owner: "Infrastructure",
    completion: 90,
    blocker: "Schema migration automation incomplete",
    status: "in-progress",
  },
  {
    id: "ADR-003",
    title: "Blue-Green Deployment",
    riskLevel: "MEDIUM",
    owner: "DevOps",
    completion: 80,
    blocker: "Rollback load test pending",
    status: "in-progress",
  },
  {
    id: "ADR-004",
    title: "OPA Policy Enforcement",
    riskLevel: "MEDIUM",
    owner: "Security",
    completion: 75,
    blocker: "Incremental CI evaluation missing",
    status: "in-progress",
  },
  {
    id: "ADR-005",
    title: "SLA & Multi-Region",
    riskLevel: "HIGH",
    owner: "SRE",
    completion: 70,
    blocker: "Cross-region conflict resolution undefined",
    status: "blocked",
  },
  {
    id: "ADR-006",
    title: "FinOps Cost Management",
    riskLevel: "LOW",
    owner: "Finance/DevOps",
    completion: 95,
    blocker: null,
    status: "complete",
  },
  {
    id: "ADR-007",
    title: "Incident Response",
    riskLevel: "HIGH",
    owner: "Security/SRE",
    completion: 80,
    blocker: "Chaos testing schedule not automated",
    status: "in-progress",
  },
]

export function ADRDashboard() {
  const totalCompletion = Math.round(adrs.reduce((sum, adr) => sum + adr.completion, 0) / adrs.length)
  const blockedCount = adrs.filter((adr) => adr.status === "blocked").length
  const completeCount = adrs.filter((adr) => adr.status === "complete").length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletion}%</div>
            <Progress value={totalCompletion} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold">
                {completeCount} / {adrs.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blockers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div className="text-2xl font-bold">{blockedCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk ADRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div className="text-2xl font-bold">{adrs.filter((a) => a.riskLevel === "HIGH").length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADR List */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture Decision Records</CardTitle>
          <CardDescription>Production readiness status for all ADRs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adrs.map((adr) => (
              <div key={adr.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-medium">{adr.id}</span>
                    <span className="font-semibold">{adr.title}</span>
                    {adr.riskLevel === "HIGH" && <Badge variant="destructive">High Risk</Badge>}
                    {adr.riskLevel === "MEDIUM" && <Badge variant="secondary">Medium Risk</Badge>}
                    {adr.riskLevel === "LOW" && <Badge variant="outline">Low Risk</Badge>}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Owner: {adr.owner}</span>
                    {adr.blocker && (
                      <span className="flex items-center text-red-600">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {adr.blocker}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{adr.completion}%</div>
                    <Progress value={adr.completion} className="w-24" />
                  </div>
                  {adr.status === "complete" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {adr.status === "in-progress" && <Clock className="h-5 w-5 text-blue-500" />}
                  {adr.status === "blocked" && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
