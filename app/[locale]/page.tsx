import { setRequestLocale } from "next-intl/server"
import HeroParticles from "@/components/HeroParticles"
import HeroSection from "@/components/landing/HeroSection"
import MetricsSection from "@/components/landing/MetricsSection"
import SectorsSection from "@/components/landing/SectorsSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HowItWorks from "@/components/landing/HowItWorks"
import RoiCalculatorSection from "@/components/landing/RoiCalculatorSection"
import CapabilitiesSection from "@/components/landing/CapabilitiesSection"
import MethodologySection from "@/components/landing/MethodologySection"
import AboutSection from "@/components/landing/AboutSection"
import TechStackSection from "@/components/landing/TechStackSection"
import FaqSection from "@/components/landing/FaqSection"
import RoadmapSection from "@/components/landing/RoadmapSection"
import LandingFooter from "@/components/landing/LandingFooter"
import LandingRevealObserver from "@/components/landing/LandingRevealObserver"

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/50">
      <LandingRevealObserver />
      <div className="pointer-events-none fixed inset-0 z-0">
        <HeroParticles />
      </div>

      <HeroSection />
      <MetricsSection />
      <SectorsSection />
      <FeaturesSection />
      <HowItWorks />
      <RoiCalculatorSection />
      <CapabilitiesSection />
      <MethodologySection />
      <AboutSection />
      <TechStackSection />
      <FaqSection />
      <RoadmapSection />
      <LandingFooter />
    </div>
  )
}
