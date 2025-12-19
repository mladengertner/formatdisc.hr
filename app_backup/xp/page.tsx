"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Award } from "lucide-react"

interface XPData {
  xp: number
  level: number
  badges: string[]
  recent_events: any[]
}

export default function XPPage() {
  const [xpData, setXpData] = useState<XPData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchXP()
  }, [])

  async function fetchXP() {
    try {
      const response = await fetch("/api/xp/user")
      const data = await response.json()
      setXpData(data)
    } catch (error) {
      console.error("[v0] Failed to fetch XP:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading XP data...</div>
      </div>
    )
  }

  const nextLevelXP = (xpData?.level || 1) * 1000
  const progress = ((xpData?.xp || 0) / nextLevelXP) * 100

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Experience & Achievements</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">Level {xpData?.level || 1}</div>
              <div className="text-muted-foreground">{xpData?.xp || 0} XP</div>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground">{nextLevelXP - (xpData?.xp || 0)} XP until next level</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {xpData?.badges && xpData.badges.length > 0 ? (
                xpData.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary">
                    <Star className="mr-1 h-3 w-3" />
                    {badge}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No badges earned yet. Keep executing agents!</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {xpData?.recent_events && xpData.recent_events.length > 0 ? (
              xpData.recent_events.map((event, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <div className="font-medium">{event.event_type}</div>
                    <div className="text-sm text-muted-foreground">{new Date(event.created_at).toLocaleString()}</div>
                  </div>
                  <Badge variant="outline">+{event.xp_amount} XP</Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
