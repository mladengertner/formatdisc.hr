import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Zap, Activity, Target, Award } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: agents } = await supabase.from("agents").select("id, name, status").eq("user_id", data.user.id).limit(5)

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", data.user.id)
    .eq("status", "active")
    .single()

  const currentXP = profile?.total_xp || 0
  const currentLevel = profile?.level || 1
  const nextLevelXP = currentLevel * 1000
  const xpProgress = (currentXP / nextLevelXP) * 100

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {profile?.full_name || data.user.email?.split("@")[0]}
            </h1>
            <p className="text-muted-foreground">Your FORMATDISC™ enterprise dashboard</p>
          </div>
          <form action={handleSignOut}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">XP Level</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {currentLevel}</div>
              <Progress value={xpProgress} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {currentXP} / {nextLevelXP} XP
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{subscription?.plan || "Free"}</div>
              <p className="text-xs text-muted-foreground">Current plan</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">AI orchestrators</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SLA Uptime</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.97%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/agents/create" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Zap className="mr-2 h-4 w-4" />
                  Launch New Agent
                </Button>
              </Link>
              <Link href="/metrics" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  View Metrics
                </Button>
              </Link>
              <Link href="/billing" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Manage Billing
                </Button>
              </Link>
              <Link href="/xp" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Award className="mr-2 h-4 w-4" />
                  View XP & Badges
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Active Agents</CardTitle>
            </CardHeader>
            <CardContent>
              {agents && agents.length > 0 ? (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <Link key={agent.id} href={`/agents/${agent.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              agent.status === "running" ? "bg-green-500" : "bg-blue-500"
                            }`}
                          />
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground capitalize">{agent.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No agents created yet. Launch your first AI agent to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
