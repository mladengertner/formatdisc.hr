"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Shield, Bell } from "lucide-react"

interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
}

type LoadState = "loading" | "ready" | "error"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [state, setState] = useState<LoadState>("loading")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user", { credentials: "include" })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      if (!data?.user?.id || !data?.user?.email) {
        throw new Error("Invalid user payload")
      }

      setProfile({
        id: data.user.id,
        full_name: data.profile?.full_name ?? data.user.email.split("@")[0],
        email: data.user.email,
        avatar_url: data.profile?.avatar_url ?? null,
      })

      setState("ready")
    } catch (err) {
      console.error("[Settings] Failed to load profile", err)
      setState("error")
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setMessage(null)

    try {
      // TODO: replace with real API call
      await new Promise((r) => setTimeout(r, 600))
      setMessage("Profile updated successfully.")
    } catch (err) {
      console.error("[Settings] Save failed", err)
      setMessage("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen" aria-busy="true">
        Loading settings…
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen text-center">
        <div>
          <h1 className="text-xl font-semibold mb-2">Unable to load settings</h1>
          <p className="text-muted-foreground mb-4">Please refresh the page or try again later.</p>
          <Button onClick={fetchProfile}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {/* PROFILE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" aria-hidden="true" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4" aria-busy={saving}>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={profile?.full_name ?? ""}
                  onChange={(e) => setProfile((p) => (p ? { ...p, full_name: e.target.value } : p))}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={profile?.email ?? ""} disabled />
                <p className="text-sm text-muted-foreground">Email cannot be changed</p>
              </div>

              {message && <p className="text-sm text-muted-foreground">{message}</p>}

              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* SECURITY */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" aria-hidden="true" />
              Security
            </CardTitle>
            <CardDescription>Authentication and account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Password</div>
                <div className="text-sm text-muted-foreground">Change your password</div>
              </div>
              <Button variant="outline" disabled>
                Coming soon
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-factor authentication</div>
                <div className="text-sm text-muted-foreground">Extra account protection</div>
              </div>
              <Button variant="outline" disabled>
                Coming soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICATIONS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" aria-hidden="true" />
              Notifications
            </CardTitle>
            <CardDescription>Notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Notification controls will be available in a future release.
            </div>
          </CardContent>
        </Card>

        {/* DANGER */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>
              Delete account (disabled)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
