import { useTranslations } from "next-intl"
import InterfaceMockup from "@/components/landing/InterfaceMockup"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

export default function HeroSection() {
  const t = useTranslations("landing.hero")
  const badges = t.raw("badges") as string[]

  return (
<section className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-24 text-center md:pt-32">
    {/* Ambient glow behind content */}
    <div className="pointer-events-none absolute inset-0 bg-hero-ambient" />
    {/* Focus glow around title area */}
    <div className="pointer-events-none absolute left-1/2 top-[20%] h-[500px] w-[800px] -translate-x-1/2 bg-hero-glow" />
    {/* Eyebrow */}
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm shadow-sm transition-colors hover:border-primary">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse-soft" />
      </span>
      {t("eyebrow")}
    </div>

    {/* Title */}
    <h1 className="max-w-5xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
      {t("titleA")}
      <span className="block shimmer-text">{t("titleB")}</span>
    </h1>

    {/* Subtitle */}
    <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-foreground/70 sm:text-xl">
      {t("subtitleA")}{" "}
      <em className="italic font-medium text-foreground/80 whitespace-nowrap">what-if</em>.{" "}
      {t("subtitleB")}
    </p>

    {/* CTAs */}
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
      <Button
        asChild
        size="lg"
        className="w-full sm:w-auto gap-2 px-6 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 animate-cta-pulse"
      >
        <Link href="/simulador">
          {t("ctaPrimary")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="w-full sm:w-auto gap-2 px-6 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background hover:border-primary hover:text-primary hover:shadow-md"
      >
        <Link href="/comparar">{t("ctaSecondary")}</Link>
      </Button>
    </div>

    {/* Metadata strip (Micro-Badges) */}
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-xs">
      {badges.map((badge, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3.5 py-1.5 text-foreground/80 shadow-2xs backdrop-blur-md transition-colors hover:border-emerald-500/40 hover:bg-background/90"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span className="font-medium">{badge}</span>
        </span>
      ))}
    </div>

    {/* UI Mockup */}
    <div className="reveal animate-fade-up relative mt-16 w-full px-0 sm:px-4" style={{ animationDelay: '500ms' }}>
      {/* Subtle glow behind mockup */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-3xl" />
      <InterfaceMockup />
    </div>
  </section>
  )
}
