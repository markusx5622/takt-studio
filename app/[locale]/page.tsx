"use client"

import { useEffect } from "react"
import HeroParticles from "@/components/HeroParticles"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HowItWorks from "@/components/landing/HowItWorks"
import CapabilitiesSection from "@/components/landing/CapabilitiesSection"
import MethodologySection from "@/components/landing/MethodologySection"
import AboutSection from "@/components/landing/AboutSection"
import TechStackSection from "@/components/landing/TechStackSection"
import FaqSection from "@/components/landing/FaqSection"
import RoadmapSection from "@/components/landing/RoadmapSection"
import LandingFooter from "@/components/landing/LandingFooter"

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible")
          }
        });
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll(".reveal")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/50">
      {/* Particle layer — covers entire landing page */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <HeroParticles />
      </div>

      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
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
