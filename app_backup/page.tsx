import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import GovernancePipeline from "@/components/governance-pipeline"
import { PricingSection } from "@/components/pricing-section"
import { SaasOrderSection } from "@/components/saas-order-section"
import { MvpSimulatorSection } from "@/components/mvp-simulator-section"
import { Footer } from "@/components/footer"
import { LanguageToggle } from "@/components/language-toggle"
import { Badge } from "@/components/ui/badge"
import ShellOrchestrator from "@/components/enterprise/ShellOrchestrator"
import { AuditDashboard } from "@/components/audit-dashboard"
import { ADRDashboard } from "@/components/adr-dashboard"

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="fixed top-20 right-4 z-50 no-print">
        <LanguageToggle />
      </div>

      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background focus:outline-none pt-20">
        {/* Entity Introduction Zone: Hero + Capability Proof (unified) */}
        <section id="entity-intro">
          <HeroSection />
        </section>

        {/* Interactive MVP Simulator - the "wow" moment */}
        <section id="simulator">
          <MvpSimulatorSection />
        </section>

        {/* Enterprise Environment - The Shell Orchestrator */}
        <section id="shell" className="py-24 px-4 bg-black/20 border-y border-primary/5">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1">SYSTEM MATURITY</Badge>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                Enterprise <span className="text-primary">Environment</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Direct orchestration via SlavkoKernel v12. Real-time telemetry, immutable audit trails, and autonomous scaling.
              </p>
            </div>
            <ShellOrchestrator />
          </div>
        </section>

        {/* Process & Governance */}
        <section id="process">
          <GovernancePipeline />
        </section>

        {/* Enterprise Compliance & Architecture Proof */}
        <section id="compliance" className="py-24 bg-card/10 border-y border-primary/5">
          <div className="container mx-auto max-w-7xl px-4 space-y-24">
            <div>
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">GOVERNANCE AUDIT</Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Immutable Audit Trail</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Real-time surveillance of deployment integrity and compliance metrics.</p>
              </div>
              <AuditDashboard />
            </div>

            <div>
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">ARCHITECTURE ADRs</Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Design Intelligence</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Track the evolution of our technical decisions and infrastructure blueprints.</p>
              </div>
              <ADRDashboard />
            </div>
          </div>
        </section>

        {/* Portfolio & Social Proof */}
        <section id="projects">
          <ProjectsSection />
        </section>

        {/* Pricing & Conversion */}
        <section id="pricing">
          <PricingSection />
        </section>
        <SaasOrderSection />

        <Footer />
      </main>
    </>
  )
}
