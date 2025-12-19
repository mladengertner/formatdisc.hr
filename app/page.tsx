import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import GovernancePipeline from "@/components/governance-pipeline"
import { PricingSection } from "@/components/pricing-section"
import { SaasOrderSection } from "@/components/saas-order-section"
import { MvpSimulatorSection } from "@/components/mvp-simulator-section"
import { Footer } from "@/components/footer"
import { LanguageToggle } from "@/components/language-toggle"
import { KernelMetricsCard } from "@/components/kernel-metrics-card"

export default function HomePage() {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 no-print">
        <LanguageToggle />
      </div>

      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background focus:outline-none">
        {/* Entity Introduction Zone: Hero + Capability Proof (unified) */}
        <HeroSection />

        {/* Interactive MVP Simulator - the "wow" moment */}
        <MvpSimulatorSection />

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Live AI <span className="text-primary">Performance</span>
              </h2>
              <p className="text-muted-foreground">Real-time metrics from SlavkoKernel v12 production system</p>
            </div>
            <KernelMetricsCard />
          </div>
        </section>

        {/* Process & Governance */}
        <GovernancePipeline />

        {/* Portfolio & Social Proof */}
        <ProjectsSection />

        {/* Pricing & Conversion */}
        <PricingSection />
        <SaasOrderSection />

        <Footer />
      </main>
    </>
  )
}
