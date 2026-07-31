import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import ConsultingBackground from "@/components/ConsultingBackground"
import { Lock, Eye, ArrowLeft, ShieldCheck, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import HeroParticles from "@/components/HeroParticles"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "privacidad" })
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

const CARD_ICONS = [Eye, Lock, ShieldCheck]

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("privacidad")
  const cards = t.raw("cards") as { title: string; text: string }[]

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
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = CARD_ICONS[i]
            return (
              <div key={i} className="rounded-2xl border bg-background/60 p-6 backdrop-blur-xl shadow-sm text-center">
                <Icon className="h-6 w-6 text-primary mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-sm">{card.title}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  {card.text}
                </p>
              </div>
            )
          })}
        </div>

        <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            {t("treatmentTitle")}
          </h2>
          <div className="space-y-6 text-sm text-foreground/70 leading-relaxed">
            <section>
              <h3 className="font-bold text-foreground mb-2">{t("sec1Title")}</h3>
              <p>{t("sec1Text")}</p>
            </section>
            <section>
              <h3 className="font-bold text-foreground mb-2">{t("sec2Title")}</h3>
              <p>{t("sec2Text")}</p>
            </section>
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
