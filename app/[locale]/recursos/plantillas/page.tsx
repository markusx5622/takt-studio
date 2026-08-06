import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ConsultingBackground from "@/components/ConsultingBackground"
import {
  Factory,
  Layers,
  AlertTriangle,
  GitCommit,
} from "lucide-react"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "resources.templates" })
  return {
    title: `${t("title")} | Takt Studio`,
    description: t("subtitle"),
  }
}

export default async function TemplatesGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("resources.templates")

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/50">
      <ConsultingBackground />
      
      {/* ── Encabezado ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-8 pt-4 text-center md:pt-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-6 px-4 pt-2 pb-24 md:pb-12">
        
        {/* ── Plantilla por Defecto ────────────────────────────────────────────── */}
        <Card className="overflow-hidden border-border/50 bg-background/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-border">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100/50 text-blue-600">
              <GitCommit className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{t("default.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 text-sm leading-relaxed text-foreground/80">
            <p>{t("default.desc")}</p>
          </CardContent>
        </Card>

        {/* ── Proceso Monobaño ─────────────────────────────────────────────────── */}
        <Card className="overflow-hidden border-border/50 bg-background/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-border">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100/50 text-emerald-600">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{t("monobath.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 text-sm leading-relaxed text-foreground/80">
            <p>{t("monobath.desc")}</p>
          </CardContent>
        </Card>

        {/* ── Alta Tasa de Reproceso ────────────────────────────────────────────── */}
        <Card className="overflow-hidden border-border/50 bg-background/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-border">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100/50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{t("highRework.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 text-sm leading-relaxed text-foreground/80">
            <p>{t("highRework.desc")}</p>
          </CardContent>
        </Card>

        {/* ── Estación Única ──────────────────────────────────────────────────── */}
        <Card className="overflow-hidden border-border/50 bg-background/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-border">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100/50 text-amber-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{t("single.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 text-sm leading-relaxed text-foreground/80">
            <p>{t("single.desc")}</p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
