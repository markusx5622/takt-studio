import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import ConsultingBackground from "@/components/ConsultingBackground"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import HeroParticles from "@/components/HeroParticles"

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
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <HeroParticles />
      </div>
      <ConsultingBackground />

      {/* Glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-[20%] h-[500px] w-[800px] -translate-x-1/2 bg-hero-glow z-0" />

      <div className="relative z-10 w-full max-w-4xl space-y-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4">{t("s1Title")}</h2>
            <div className="space-y-4 text-sm text-foreground/70 leading-relaxed">
              <p>{t("s1p1")}</p>
              <p>
                <strong>{t("s1holder")}</strong> Marc Cubero Cantavella<br />
                <strong>{t("s1location")}</strong> Valencia, España<br />
                <strong>{t("s1contact")}</strong> marccuberoc@gmail.com
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4">{t("s2Title")}</h2>
            <div className="space-y-4 text-sm text-foreground/70 leading-relaxed">
              <p>{t("s2p1")}</p>
              <p>{t("s2p2")}</p>
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

        <div className="flex justify-center pt-8">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
