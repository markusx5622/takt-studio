import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import ConsultingBackground from "@/components/ConsultingBackground"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import HeroParticles from "@/components/HeroParticles"
import BrandLogo from "@/components/BrandLogo"

const ISSUES_URL = "https://github.com/markusx5622/takt-studio/issues"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "legal" })
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("legal")

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <HeroParticles />
      </div>
      <ConsultingBackground />

      {/* Glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-[20%] h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-hero-glow z-0" />

      <div className="relative z-10 w-full max-w-4xl space-y-10">
        {/* Top Header Bar: Back Button & Corporate Brand Logo Banner */}
        <div className="flex items-center justify-between border-b border-border/40 pb-6">
          <Button asChild variant="outline" size="sm" className="gap-2 bg-background/60 backdrop-blur-md shadow-xs hover:bg-accent">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 text-primary" />
              <span>{t("back")}</span>
            </Link>
          </Button>
          <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity" title="Takt Studio">
            <BrandLogo variant="compact" className="h-8 sm:h-9 w-auto" priority />
          </Link>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("subtitle")}
          </p>
          <p className="text-xs text-foreground/50">{t("updated")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4">{t("s1Title")}</h2>
            <div className="space-y-4 text-sm text-foreground/70 leading-relaxed">
              <p>{t("s1p1")}</p>
              <p>
                <strong>{t("s1holder")}</strong> Marc Cubero Cantavella<br />
                <strong>{t("s1location")}</strong> Valencia, España<br />
                <strong>{t("s1contact")}</strong>{" "}
                <a
                  href={ISSUES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub Issues
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4">{t("s2Title")}</h2>
            <div className="space-y-4 text-sm text-foreground/70 leading-relaxed">
              <p>{t("s2p1")}</p>
              <p>{t("s2p2")}</p>
              <p>{t("s2p3")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm">
          <h2 className="text-xl font-bold mb-6">{t("s3Title")}</h2>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-foreground/70 leading-relaxed">
            <p>{t("s3p1")}</p>
            <p>{t("s3p2")}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm">
          <h2 className="text-xl font-bold mb-6">{t("s4Title")}</h2>
          <div className="space-y-4 text-sm text-foreground/70 leading-relaxed">
            <p>{t("s4p1")}</p>
            <p>{t("s4p2")}</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4">{t("s5Title")}</h2>
            <p className="text-sm text-foreground/70 leading-relaxed">{t("s5p1")}</p>
          </div>

          <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4">{t("s6Title")}</h2>
            <p className="text-sm text-foreground/70 leading-relaxed">{t("s6p1")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
