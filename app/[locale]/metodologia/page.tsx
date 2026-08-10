import { getTranslations, setRequestLocale } from "next-intl/server"
import "katex/dist/katex.min.css"
import { BlockMath } from "react-katex"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ConsultingBackground from "@/components/ConsultingBackground"
import TaktPlayground from "@/components/TaktPlayground"
import {
  BookOpen,
  Clock,
  Gauge,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
  Timer,
  Zap,
  Euro,
  CheckCircle2,
  Sliders,
} from "lucide-react"

function Formula({ children, className }: { children: React.ReactNode; className?: string }) {
  if (typeof children !== 'string') return null
  return (
    <div className={`my-3 overflow-x-auto rounded-md border bg-muted/40 px-4 py-2 text-foreground/90 ${className ?? ""}`}>
      <BlockMath math={children} />
    </div>
  )
}

function KpiCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-background p-5 transition-shadow hover:shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-foreground/75">{children}</div>
    </div>
  )
}

const KPI_ICONS = [Clock, Timer, Layers, TrendingUp, ArrowRight, Gauge]

export default async function MetodologiaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("metodologia")
  const kpiCards = t.raw("kpiCards") as { title: string; p: string; formula: string; note: string }[]
  const costItems = t.raw("costItems") as { label: string; formula: string }[]
  const limits = t.raw("limits") as { label: string; text: string }[]
  const noteItems = t.raw("noteItems") as string[]
  const playgroundLabels = t.raw("playground") as any

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

      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-8 px-4 pt-2 pb-24 md:pb-12">
        {/* ── Introducción ────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("introTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/75">
            <p>{t("introP1")}</p>
            <p>{t("introP2")}</p>
            <div className="flex items-start gap-2 rounded-md border border-amber-200/60 bg-amber-50/40 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800/80">{t("introWarning")}</p>
            </div>
          </CardContent>
        </Card>

        {/* ── KPIs operativos ─────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">{t("kpisTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {kpiCards.map((kpi, i) => (
              <KpiCard key={i} icon={KPI_ICONS[i]} title={kpi.title}>
                <p>{kpi.p}</p>
                <Formula>{kpi.formula}</Formula>
                <p className="text-xs text-muted-foreground">{kpi.note}</p>
              </KpiCard>
            ))}
          </div>
          <div className="mt-4">
            <TaktPlayground labels={playgroundLabels} />
          </div>
        </section>

        {/* ── Capa económica ──────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Euro className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">{t("econTitle")}</h2>
          </div>
          <Card>
            <CardContent className="space-y-4 pt-6 text-sm leading-relaxed text-foreground/75">
              <p>{t("econIntro")}</p>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("costTitle")}
                </h4>
                <div className="grid gap-2 sm:grid-cols-3">
                  {costItems.map((item) => (
                    <div key={item.label} className="rounded-md border bg-muted/30 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <Formula className="my-1.5 text-xs">{item.formula}</Formula>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("proxyTitle")}
                </h4>
                <p>{t("proxyText")}</p>
                <Formula>{t("proxyFormula")}</Formula>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("impactTitle")}
                </h4>
                <p>{t("impactText")}</p>
                <Formula>{t("impactFormula")}</Formula>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("paybackTitle")}
                </h4>
                <p>{t("paybackText")}</p>
                <Formula>{t("paybackFormula")}</Formula>
              </div>

              <div className="flex items-start gap-2 rounded-md border border-amber-200/60 bg-amber-50/40 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-800/80">{t("econWarning")}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Motor Estocástico Monte Carlo & Sensibilidad ──────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">{t("stochasticTitle")}</h2>
          </div>
          <Card>
            <CardContent className="space-y-4 pt-6 text-sm leading-relaxed text-foreground/75">
              <p>{t("stochasticIntro")}</p>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("mcTitle")}
                </h4>
                <p>{t("mcText")}</p>
                <Formula>{t("mcFormula")}</Formula>
                <p className="text-xs text-muted-foreground">{t("mcPercentiles")}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("sensitivityTitle")}
                </h4>
                <p>{t("sensitivityText")}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Supuestos y limitaciones ────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">{t("limitsTitle")}</h2>
          </div>
          <Card>
            <CardContent className="space-y-3 pt-6">
              {limits.map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2.5">
                  <Badge variant="outline" className="mt-0.5 shrink-0 text-[10px]">
                    {item.label}
                  </Badge>
                  <p className="text-xs leading-relaxed text-foreground/70">{item.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ── Nota de uso profesional ─────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("noteTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-foreground/75">
            <p>{t("noteP1")}</p>
            <p className="mt-3">{t("noteP2")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-foreground/70">
              {noteItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
