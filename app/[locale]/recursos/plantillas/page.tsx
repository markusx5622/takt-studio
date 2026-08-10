import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ConsultingBackground from "@/components/ConsultingBackground"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import BrandLogo from "@/components/BrandLogo"
import {
  Factory,
  Layers,
  GitCommit,
  Car,
  Cpu,
  Package,
  Droplet,
  Settings,
  Clock,
  ArrowLeft,
} from "lucide-react"
import { INDUSTRY_PRESETS_DATA, IndustrySectorKey } from "@/lib/presets"

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

const SECTOR_ICONS: Record<IndustrySectorKey, React.ComponentType<{ className?: string }>> = {
  monobath: Layers,
  automotive: Car,
  electronics: Cpu,
  logistics: Package,
  ceramics: Factory,
  food_pharma: Droplet,
  machinery: Settings,
}

const SECTOR_COLORS: Record<IndustrySectorKey, string> = {
  monobath: "bg-blue-100/50 text-blue-600",
  automotive: "bg-indigo-100/50 text-indigo-600",
  electronics: "bg-emerald-100/50 text-emerald-600",
  logistics: "bg-amber-100/50 text-amber-600",
  ceramics: "bg-orange-100/50 text-orange-600",
  food_pharma: "bg-rose-100/50 text-rose-600",
  machinery: "bg-slate-200/50 text-slate-700",
}

export default async function TemplatesGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("resources.templates")
  const isEn = locale === "en"

  const sectors = Object.entries(INDUSTRY_PRESETS_DATA) as [IndustrySectorKey, typeof INDUSTRY_PRESETS_DATA[IndustrySectorKey]][]

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/50">
      <ConsultingBackground />
      
      {/* ── Encabezado ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-8 pt-4 text-center md:pt-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-6 text-left">
            <Button asChild variant="outline" size="sm" className="gap-2 bg-background/60 backdrop-blur-md shadow-xs hover:bg-accent">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 text-primary" />
                <span>{t("back")}</span>
              </Link>
            </Button>
            <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity" title="Takt Studio">
              <BrandLogo variant="horizontalLight" className="h-10 sm:h-11 w-auto" priority />
            </Link>
          </div>
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-8 px-4 pt-2 pb-24 md:pb-12">
        {sectors.map(([key, data]) => {
          const Icon = SECTOR_ICONS[key] || Factory
          const colorClass = SECTOR_COLORS[key] || "bg-slate-100/50 text-slate-600"
          const totalStations = data.stations.length

          return (
            <Card key={key} className="overflow-hidden border-border/60 bg-background/95 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-border">
              
              {/* Header */}
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b border-border/40 bg-muted/30 pb-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                    {isEn ? data.nameEn : data.nameEs}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 pt-6">
                {/* Description */}
                <p className="text-sm leading-relaxed text-foreground/80">
                  {t(`descriptions.${key}`)}
                </p>

                {/* KPI Bar */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="flex flex-col rounded-md border bg-muted/20 p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("metrics.demand")}</span>
                    <span className="mt-1 text-lg font-bold text-foreground/90">{data.demandPerDay} <span className="text-xs font-normal text-muted-foreground">/ día</span></span>
                  </div>
                  <div className="flex flex-col rounded-md border bg-muted/20 p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("metrics.shiftHours")}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-lg font-bold text-foreground/90">
                      <Clock className="h-4 w-4 text-primary/70" /> {data.shiftHours}h
                    </span>
                  </div>
                  <div className="flex flex-col rounded-md border bg-muted/20 p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("metrics.shifts")}</span>
                    <span className="mt-1 text-lg font-bold text-foreground/90">{data.shiftsPerDay}</span>
                  </div>
                  <div className="flex flex-col rounded-md border bg-muted/20 p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("metrics.stations")}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-lg font-bold text-foreground/90">
                      <GitCommit className="h-4 w-4 text-primary/70" /> {totalStations}
                    </span>
                  </div>
                </div>

                {/* Stations List */}
                <div className="rounded-lg border border-border/50">
                  <div className="grid grid-cols-12 gap-4 border-b bg-muted/30 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                    <div className="col-span-6 sm:col-span-5">{t("metrics.station")}</div>
                    <div className="col-span-2 hidden text-right sm:block">{t("metrics.cycleTime")}</div>
                    <div className="col-span-2 text-right">{t("metrics.operators")}</div>
                    <div className="col-span-2 text-right">{t("metrics.failureRate")}</div>
                  </div>
                  <div className="divide-y divide-border/50">
                    {data.stations.map((st, idx) => (
                      <div key={idx} className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/10">
                        <div className="col-span-6 font-medium text-foreground/80 sm:col-span-5">
                          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">{idx + 1}</span>
                          {isEn ? st.nameEn : st.nameEs}
                        </div>
                        <div className="col-span-2 hidden text-right font-mono text-foreground/70 sm:block">
                          {st.cycleTimeMin}m
                        </div>
                        <div className="col-span-2 text-right">
                          <Badge variant="secondary" className="font-mono">{st.operators}</Badge>
                        </div>
                        <div className="col-span-2 text-right font-mono text-foreground/70">
                          {(st.failureRate * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
