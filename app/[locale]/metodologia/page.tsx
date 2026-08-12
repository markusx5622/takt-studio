import { getTranslations, setRequestLocale } from "next-intl/server"
import "katex/dist/katex.min.css"
import { BlockMath } from "react-katex"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ConsultingBackground from "@/components/ConsultingBackground"
import TaktPlayground, { type PlaygroundLabels } from "@/components/TaktPlayground"
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
  Euro,
  CheckCircle2,
  Sliders,
  Sparkles,
  GitBranch,
  Target,
  Coins,
  ShieldCheck,
  ShieldAlert,
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
  const autoCards = t.raw("autoCards") as { title: string; p: string; formula: string; note: string }[]
  const costItems = t.raw("costItems") as { label: string; formula: string }[]
  const limits = t.raw("limits") as { label: string; text: string }[]
  const noteItems = t.raw("noteItems") as string[]
  const playgroundLabels = t.raw("playground") as PlaygroundLabels

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

        {/* ── Auditoría Grado Automotriz (Ford CAR) ──────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">{t("autoTitle")}</h2>
          </div>
          <Card className="mb-4">
            <CardContent className="space-y-4 pt-6 text-sm leading-relaxed text-foreground/75">
              <p>{t("autoIntro")}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {autoCards.map((kpi, i) => (
              <KpiCard key={i} icon={ShieldCheck} title={kpi.title}>
                <p>{kpi.p}</p>
                <Formula>{kpi.formula}</Formula>
                <p className="text-xs text-muted-foreground">{kpi.note}</p>
              </KpiCard>
            ))}
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
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100/80 p-2 text-blue-700 shadow-2xs">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{t("limitsTitle")}</h2>
                <p className="text-xs text-muted-foreground">{t("limitsSubtitle")}</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex bg-blue-50/50 border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1">
              {t("limitsBadge")}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {limits.map((item, i) => {
              const icons = [Sparkles, Layers, GitBranch, Target, Coins, Clock]
              const colors = [
                "bg-blue-50 text-blue-600 border-blue-200/80",
                "bg-indigo-50 text-indigo-600 border-indigo-200/80",
                "bg-purple-50 text-purple-600 border-purple-200/80",
                "bg-amber-50 text-amber-600 border-amber-200/80",
                "bg-emerald-50 text-emerald-600 border-emerald-200/80",
                "bg-cyan-50 text-cyan-600 border-cyan-200/80",
              ]
              const Icon = icons[i % icons.length]
              const colorClass = colors[i % colors.length]

              return (
                <div
                  key={item.label}
                  className="group relative flex flex-col justify-between rounded-xl border bg-background p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300/80"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`rounded-lg border p-2 shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
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
