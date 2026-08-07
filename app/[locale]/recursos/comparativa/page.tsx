import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import ConsultingBackground from "@/components/ConsultingBackground"
import {
  Check,
  X,
  Minus,
  Zap,
  BarChart,
  PiggyBank,
  WifiOff,
  BookOpen,
  ArrowRight,
} from "lucide-react"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "resources.comparison" })
  return {
    title: `${t("title")} | Takt Studio`,
    description: t("subtitle"),
  }
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("resources.comparison")

  const features = [
    {
      id: "learningCurve",
      icon: BookOpen,
      takt: t("features.learningCurve_takt"),
      excel: t("features.learningCurve_excel"),
      des: t("features.learningCurve_des"),
      taktIcon: Check,
      taktColor: "text-emerald-500",
      excelIcon: Minus,
      excelColor: "text-amber-500",
      desIcon: X,
      desColor: "text-rose-500",
    },
    {
      id: "monteCarlo",
      icon: Zap,
      takt: t("features.monteCarlo_takt"),
      excel: t("features.monteCarlo_excel"),
      des: t("features.monteCarlo_des"),
      taktIcon: Check,
      taktColor: "text-emerald-500",
      excelIcon: X,
      excelColor: "text-rose-500",
      desIcon: Check,
      desColor: "text-emerald-500",
    },
    {
      id: "kpis",
      icon: BarChart,
      takt: t("features.kpis_takt"),
      excel: t("features.kpis_excel"),
      des: t("features.kpis_des"),
      taktIcon: Check,
      taktColor: "text-emerald-500",
      excelIcon: Minus,
      excelColor: "text-amber-500",
      desIcon: Check,
      desColor: "text-emerald-500",
    },
    {
      id: "cost",
      icon: PiggyBank,
      takt: t("features.cost_takt"),
      excel: t("features.cost_excel"),
      des: t("features.cost_des"),
      taktIcon: Check,
      taktColor: "text-emerald-500",
      excelIcon: Check,
      excelColor: "text-emerald-500",
      desIcon: X,
      desColor: "text-rose-500",
    },
    {
      id: "offline",
      icon: WifiOff,
      takt: t("features.offline_takt"),
      excel: t("features.offline_excel"),
      des: t("features.offline_des"),
      taktIcon: Check,
      taktColor: "text-emerald-500",
      excelIcon: Check,
      excelColor: "text-emerald-500",
      desIcon: Check,
      desColor: "text-emerald-500",
    }
  ] as const;

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

      {/* ── Tabla Comparativa ────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-8 px-4 pt-2 pb-24 md:pb-12">
        <Card className="overflow-hidden border-border/60 bg-background/95 backdrop-blur-md shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4">
            
            {/* Cabecera Desktop */}
            <div className="hidden md:block bg-muted/20 p-6 border-b border-r border-border/40">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Característica</span>
            </div>
            <div className="relative hidden md:flex bg-primary/[0.03] p-6 border-b border-r border-border/40 flex-col items-center justify-center text-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-primary"></div>
              <span className="text-xl font-extrabold text-primary">{t("taktStudio")}</span>
            </div>
            <div className="hidden md:flex bg-muted/20 p-6 border-b border-r border-border/40 flex-col items-center justify-center text-center">
              <span className="text-lg font-semibold text-foreground/80">{t("excel")}</span>
            </div>
            <div className="hidden md:flex bg-muted/20 p-6 border-b border-border/40 flex-col items-center justify-center text-center">
              <span className="text-lg font-semibold text-foreground/80">{t("des")}</span>
            </div>

            {/* Filas */}
            {features.map((feat) => {
              const Icon = feat.icon
              const TaktIcon = feat.taktIcon
              const ExcelIcon = feat.excelIcon
              const DesIcon = feat.desIcon

              return (
                <div key={feat.id} className="group col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-4 border-b border-border/40 last:border-b-0 transition-colors hover:bg-muted/30">
                  
                  {/* Etiqueta Feature */}
                  <div className="flex items-center gap-4 bg-muted/10 p-5 md:p-6 md:border-r border-border/40 group-hover:bg-transparent transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm border border-border/50 text-foreground/70 group-hover:text-primary transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-foreground/90">{t(`features.${feat.id}`)}</span>
                  </div>

                  {/* Takt Studio */}
                  <div className="flex flex-col gap-2 p-5 md:p-6 bg-primary/[0.02] md:border-r border-border/40 group-hover:bg-primary/[0.06] transition-colors relative">
                    <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-primary">{t("taktStudio")}</span>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${feat.taktColor.replace('text-', 'bg-').replace('500', '100')} ${feat.taktColor}`}>
                         <TaktIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90 leading-snug">{feat.takt}</span>
                    </div>
                  </div>

                  {/* Excel */}
                  <div className="flex flex-col gap-2 p-5 md:p-6 bg-muted/5 md:border-r border-border/40 border-t md:border-t-0 border-border/20 group-hover:bg-transparent transition-colors">
                    <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("excel")}</span>
                    <div className="flex items-start gap-3">
                      <ExcelIcon className={`mt-1 h-4 w-4 shrink-0 ${feat.excelColor}`} />
                      <span className="text-sm font-medium text-foreground/70 leading-snug">{feat.excel}</span>
                    </div>
                  </div>

                  {/* DES */}
                  <div className="flex flex-col gap-2 p-5 md:p-6 bg-muted/5 border-t md:border-t-0 border-border/20 group-hover:bg-transparent transition-colors">
                    <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("des")}</span>
                    <div className="flex items-start gap-3">
                      <DesIcon className={`mt-1 h-4 w-4 shrink-0 ${feat.desColor}`} />
                      <span className="text-sm font-medium text-foreground/70 leading-snug">{feat.des}</span>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30">
            <Link href="/simulador">
              {t("cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
