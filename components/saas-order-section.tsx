"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Rocket, Clock, CheckCircle2, Zap, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const TIERS = [
  { value: "starter", label: "Starter - €2,999", labelHr: "Početni - €2,999" },
  { value: "professional", label: "Professional - €7,999", labelHr: "Profesionalni - €7,999" },
  { value: "enterprise", label: "Enterprise - €14,999", labelHr: "Enterprise - €14,999" },
]

interface FormErrors {
  name?: string
  email?: string
  project?: string
  tier?: string
}

export function SaasOrderSection() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    tier: "",
    project: "",
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.tier) {
      newErrors.tier = "Please select a package"
    }

    if (!formData.project.trim() || formData.project.length < 20) {
      newErrors.project = "Please describe your project (minimum 20 characters)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          source: "website",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit order")
      }

      toast({
        title: "Order Received! / Narudžba primljena!",
        description: "We'll contact you within 2 hours to start your project. Kontaktirat ćemo vas u roku od 2 sata.",
      })

      setFormData({ name: "", email: "", company: "", tier: "", project: "" })
      setErrors({})
    } catch (error) {
      toast({
        title: "Error / Greška",
        description: "Failed to submit order. Please try again or contact info@formatdisc.hr",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="saas-order" className="border-b border-border">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header - Bilingual */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              Enterprise SaaS Orders / Enterprise SaaS Narudžbe
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Start Your Project
              <br />
              <span className="text-primary">Get Delivery in 48h</span>
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
              Fill out the form below and we'll start building your enterprise SaaS immediately.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-primary/20 bg-card/50">
              <CardHeader>
                <Clock className="w-8 h-8 text-primary mb-2" aria-hidden="true" />
                <CardTitle>48h Delivery</CardTitle>
                <CardDescription>Guaranteed delivery within 48 hours with full audit trail</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 bg-card/50">
              <CardHeader>
                <CheckCircle2 className="w-8 h-8 text-primary mb-2" aria-hidden="true" />
                <CardTitle>Audit-Proof</CardTitle>
                <CardDescription>Complete logging and reproducible execution flows</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 bg-card/50">
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" aria-hidden="true" />
                <CardTitle>Production-Ready</CardTitle>
                <CardDescription>Deploy immediately with zero configuration needed</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Order Form - Enhanced with validation */}
          <Card className="border-primary/30 bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Launch Your SaaS Now / Pokreni svoj SaaS odmah</CardTitle>
              <CardDescription className="text-base">
                Fill out the form below and we'll contact you within 2 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name / Ime <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Tvrtka</Label>
                    <Input
                      id="company"
                      placeholder="Your company name (optional)"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tier">
                      Package / Paket <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
                      <SelectTrigger
                        id="tier"
                        aria-invalid={!!errors.tier}
                        className={errors.tier ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIERS.map((tier) => (
                          <SelectItem key={tier.value} value={tier.value}>
                            {tier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tier && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.tier}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">
                    Project Description / Opis projekta <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="project"
                    placeholder="Describe your SaaS idea, target audience, key features, and any specific requirements... (minimum 20 characters)"
                    className={`min-h-32 resize-none ${errors.project ? "border-destructive" : ""}`}
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    aria-invalid={!!errors.project}
                    aria-describedby={errors.project ? "project-error" : undefined}
                  />
                  {errors.project ? (
                    <p id="project-error" className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.project}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">{formData.project.length}/20 characters minimum</p>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Order...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      Order Your SaaS Now / Naruči SaaS Odmah
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
