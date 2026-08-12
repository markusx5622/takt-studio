"use client"

import dynamic from "next/dynamic"
import { Link } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs, calculateEconomicKPIs, normalizeEconomics } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  Copy,
  TrendingUp,
  Clock,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  DollarSign,
  ArrowLeftRight,
  CheckCircle2,
  Info,
  Activity,
  Zap,
} from "lucide-react"
import { runMonteCarlo } from "@/lib/monte-carlo"
import { cn } from "@/lib/utils"
import type { KPIs, Scenario } from "@/types"

// Dynamic imports for browser-only Recharts components
const TaktChart = dynamic(() => import("@/components/TaktChart"), { ssr: false })
const LineDiagram = dynamic(() => import("@/components/LineDiagram"), { ssr: false })
import ConsultingBackground from "@/components/ConsultingBackground"
import ExportComparePdfButton from "@/components/ExportComparePdfButton"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Scenario selector ─────────────────────────────────────────────────────────

function ScenarioSelect({
  label,
  value,
  onChange,
  scenarios,
  colorScheme = "blue",
}: {
  label: string
  value: string
  onChange: (id: string) => void
  scenarios: Scenario[]
  colorScheme?: "blue" | "indigo" | "emerald" | "amber"
}) {
  const colorMap = {
    blue: "text-blue-700 bg-blue-50 border-blue-200 focus:ring-blue-500",
    indigo: "text-indigo-700 bg-indigo-50 border-indigo-200 focus:ring-indigo-500",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200 focus:ring-emerald-500",
    amber: "text-amber-700 bg-amber-50 border-amber-200 focus:ring-amber-500",
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={cn("text-[11px] font-bold uppercase tracking-wider", colorMap[colorScheme].split(" ")[0])}>
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("w-full font-semibold transition-all hover:brightness-95", colorMap[colorScheme])}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {scenarios.map((sc) => (
            <SelectItem key={sc.id} value={sc.id} className="font-medium">
              {sc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ─── Executive Verdict Banner ───────────────────────────────────────────────

function ExecutiveVerdictBanner({
  scenarioA,
  scenarioB,
  kpisA,
  kpisB,
}: {
  scenarioA: Scenario
  scenarioB: Scenario
  kpisA: KPIs
  kpisB: KPIs
}) {
  const t = useTranslations("compare")
  const deltaTP = kpisB.throughputPerDay - kpisA.throughputPerDay
  const deltaLT = Math.abs(kpisB.leadTimeMin - kpisA.leadTimeMin).toFixed(1)
  const pct = kpisA.throughputPerDay > 0 ? Math.round((deltaTP / kpisA.throughputPerDay) * 100) : 0

  if (Math.abs(deltaTP) < 1 && Math.abs(kpisB.leadTimeMin - kpisA.leadTimeMin) < 0.1) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-gradient-to-r from-slate-50 to-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-2 text-slate-500 shadow-sm transition-transform hover:scale-105">
          <Info className="h-6 w-6" />
        </div>
        <div className="flex flex-col justify-center pt-0.5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700/80">{t("verdictTitle")}</h4>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
            {t("verdictEqual")}
          </p>
        </div>
      </div>
    )
  }

  const isBetter = deltaTP > 0 || (deltaTP === 0 && kpisB.leadTimeMin < kpisA.leadTimeMin)

  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-2xl border p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]",
        isBetter
          ? "border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/30 text-emerald-950"
          : "border-rose-200/50 bg-gradient-to-br from-rose-50/80 to-red-50/30 text-rose-950"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
          isBetter
            ? "border-emerald-200 bg-white text-emerald-600"
            : "border-rose-200 bg-white text-rose-600"
        )}
      >
        {isBetter ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
      </div>
      <div className="flex flex-col justify-center pt-0.5">
        <span className="text-xs font-bold uppercase tracking-widest opacity-70">
          {t("verdictTitle")}
        </span>
        <p className="mt-1 text-sm font-medium leading-relaxed">
          {isBetter
            ? t("verdictBetter", { nameA: scenarioA.name, nameB: scenarioB.name, deltaTP, pct: pct > 0 ? `${pct}` : "0", deltaLT })
            : t("verdictWorse", { nameA: scenarioA.name, nameB: scenarioB.name, deltaTP: Math.abs(deltaTP), deltaLT })}
        </p>
      </div>
    </div>
  )
}

// ─── Delta badge ───────────────────────────────────────────────────────────────

function DeltaBadge({
  delta,
  higherIsBetter,
  fmt,
}: {
  delta: number
  higherIsBetter: boolean
  fmt: (v: number) => string
}) {
  const t = useTranslations("compare")
  if (Math.abs(delta) < 0.01) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/50 px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-100">
        <Minus className="h-3 w-3" />
        {t("noChange")}
      </span>
    )
  }

  const isImprovement = higherIsBetter ? delta > 0 : delta < 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm transition-all hover:brightness-95",
        isImprovement
          ? "border-emerald-200 bg-emerald-100/60 text-emerald-800"
          : "border-rose-200 bg-rose-100/60 text-rose-800"
      )}
    >
      {isImprovement ? (
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
      )}
      {delta > 0 ? "+" : ""}
      {fmt(delta)}
    </span>
  )
}

// ─── Mini KPIs ─────────────────────────────────────────────────────────────────

function MiniKpis({ kpis }: { kpis: KPIs }) {
  const t = useTranslations("compare")
  const effPct = kpis.balancingEfficiency * 100
  const bottleneckExceedsTakt = kpis.bottleneckCycleMin > kpis.taktTimeMin

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="group overflow-hidden border-blue-100/50 bg-gradient-to-br from-white to-blue-50/30 transition-all hover:shadow-md hover:border-blue-200">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600/80">
            <Clock className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-blue-600" />
            Takt Time
          </div>
          <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">{kpis.taktTimeMin.toFixed(1)}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{t("minPerUnit")}</p>
        </CardContent>
      </Card>

      <Card className="group overflow-hidden border-indigo-100/50 bg-gradient-to-br from-white to-indigo-50/30 transition-all hover:shadow-md hover:border-indigo-200">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600/80">
            <TrendingUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:text-indigo-600" />
            Throughput
          </div>
          <p
            className={cn(
              "mt-2 text-2xl font-black tracking-tight",
              kpis.meetsDemand ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {kpis.throughputPerDay}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{t("unitsPerDay")}</p>
        </CardContent>
      </Card>

      <Card className="col-span-2 group overflow-hidden border-amber-100/50 bg-gradient-to-br from-white to-amber-50/30 transition-all hover:shadow-md hover:border-amber-200">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600/80">
              <AlertTriangle className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-amber-600" />
              {t("bottleneck")}
            </div>
            <p className="mt-2 text-lg font-bold text-slate-800 line-clamp-1" title={kpis.bottleneckStationName}>
              {kpis.bottleneckStationName || "—"}
            </p>
          </div>
          <div className="flex shrink-0">
            {bottleneckExceedsTakt ? (
              <Badge variant="destructive" className="px-3 py-1 text-xs shadow-sm font-bold uppercase tracking-wider">
                {t("exceedsTakt")}
              </Badge>
            ) : (
              <Badge variant="success" className="px-3 py-1 text-xs shadow-sm font-bold uppercase tracking-wider">
                {t("withinTaktOk")}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3" />
            {t("balancing")}
          </div>
          <p className="mt-1 text-xl font-bold">{effPct.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">%</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Comparison table ──────────────────────────────────────────────────────────

interface TableRow {
  label: string
  a: string
  b: string
  delta: number
  higherIsBetter: boolean
  fmtDelta: (v: number) => string
}

function buildRows(scenarioA: Scenario, scenarioB: Scenario, kpisA: KPIs, kpisB: KPIs, t: (key: string) => string): TableRow[] {
  return [
    {
      label: t("rowTakt"),
      a: kpisA.taktTimeMin.toFixed(2),
      b: kpisB.taktTimeMin.toFixed(2),
      delta: kpisB.taktTimeMin - kpisA.taktTimeMin,
      higherIsBetter: false,
      fmtDelta: (v) => `${Math.abs(v).toFixed(2)} ${t("minUnit")}`,
    },
    {
      label: t("rowThroughput"),
      a: String(kpisA.throughputPerDay),
      b: String(kpisB.throughputPerDay),
      delta: kpisB.throughputPerDay - kpisA.throughputPerDay,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(Math.round(v))} ${t("unitsUds")}`,
    },
    {
      label: t("rowBottleneck"),
      a: kpisA.bottleneckCycleMin.toFixed(2),
      b: kpisB.bottleneckCycleMin.toFixed(2),
      delta: kpisB.bottleneckCycleMin - kpisA.bottleneckCycleMin,
      higherIsBetter: false,
      fmtDelta: (v) => `${Math.abs(v).toFixed(2)} ${t("minUnit")}`,
    },
    {
      label: t("rowLeadTime"),
      a: kpisA.leadTimeMin.toFixed(1),
      b: kpisB.leadTimeMin.toFixed(1),
      delta: kpisB.leadTimeMin - kpisA.leadTimeMin,
      higherIsBetter: false,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} ${t("minUnit")}`,
    },
    {
      label: t("rowBalancing"),
      a: `${(kpisA.balancingEfficiency * 100).toFixed(1)}%`,
      b: `${(kpisB.balancingEfficiency * 100).toFixed(1)}%`,
      delta: (kpisB.balancingEfficiency - kpisA.balancingEfficiency) * 100,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} ${t("ppUnit")}`,
    },
    {
      label: "OEE Requerido",
      a: `${(kpisA.requiredOEE * 100).toFixed(1)}%`,
      b: `${(kpisB.requiredOEE * 100).toFixed(1)}%`,
      delta: (kpisB.requiredOEE - kpisA.requiredOEE) * 100,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} ${t("ppUnit")}`,
    },
    {
      label: "Asignación de Línea",
      a: `${(scenarioA.allocationPercent ?? 100).toFixed(1)}%`,
      b: `${(scenarioB.allocationPercent ?? 100).toFixed(1)}%`,
      delta: (scenarioB.allocationPercent ?? 100) - (scenarioA.allocationPercent ?? 100),
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} ${t("ppUnit")}`,
    },
    {
      label: t("rowTotalCycle"),
      a: kpisA.totalCycleMin.toFixed(1),
      b: kpisB.totalCycleMin.toFixed(1),
      delta: kpisB.totalCycleMin - kpisA.totalCycleMin,
      higherIsBetter: false,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} ${t("minUnit")}`,
    },
  ]
}

function ComparisonTable({
  scenarioA,
  scenarioB,
  kpisA,
  kpisB,
}: {
  scenarioA: Scenario
  scenarioB: Scenario
  kpisA: KPIs
  kpisB: KPIs
}) {
  const t = useTranslations("compare")
  const rows = buildRows(scenarioA, scenarioB, kpisA, kpisB, t)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-100/80 p-2 text-blue-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{t("secKpiTitle")}</CardTitle>
            <CardDescription className="text-xs">{t("tableTitleOperational")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  {t("colMetric")}
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded border border-blue-200/80 bg-blue-50/80 px-2 py-0.5 font-bold text-blue-700 shadow-2xs">
                    A · {scenarioA.name}
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded border border-indigo-200/80 bg-indigo-50/80 px-2 py-0.5 font-bold text-indigo-700 shadow-2xs">
                    B · {scenarioB.name}
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  {t("colDelta")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn("border-b last:border-0", i % 2 === 0 ? "bg-background" : "bg-muted/20")}
                >
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.label}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{row.a}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{row.b}</td>
                  <td className="px-4 py-2.5 text-right">
                    <DeltaBadge
                      delta={row.delta}
                      higherIsBetter={row.higherIsBetter}
                      fmt={row.fmtDelta}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CompararPage() {
  const t = useTranslations("compare")
  const tControls = useTranslations("simulator.controls")
  const hydrated = useHydrated()
  const scenarios = useTaktStore((state) => state.scenarios)
  const compareAId = useTaktStore((state) => state.compareScenarioAId)
  const compareBId = useTaktStore((state) => state.compareScenarioBId)
  const setCompareA = useTaktStore((state) => state.setCompareA)
  const setCompareB = useTaktStore((state) => state.setCompareB)

  if (!hydrated) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
        <ConsultingBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-2 pb-24 md:pb-8">
          <div className="page-header-rule pb-4 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitleShort")}</p>
          </div>
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (scenarios.length < 2) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
        <ConsultingBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-2 pb-24 md:pb-8">
          <div className="page-header-rule pb-4 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitleShort")}</p>
          </div>
          <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              {t("emptyText")}
            </p>
            <Button asChild>
              <Link href="/simulador">{t("goToSimulator")}</Link>
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  const scenarioA = scenarios.find((s) => s.id === compareAId) ?? scenarios[0]
  const scenarioB = scenarios.find((s) => s.id === compareBId) ?? scenarios[1]
  const sameScenario = scenarioA.id === scenarioB.id

  const kpisA = calculateAllKPIs(scenarioA)
  const kpisB = calculateAllKPIs(scenarioB)

  function handleSwapAB() {
    setCompareA(scenarioB.id)
    setCompareB(scenarioA.id)
  }

  function handleDuplicateAtoB() {
    const store = useTaktStore.getState()
    const original = store.scenarios.find((s) => s.id === compareAId)
    if (!original) return
    store.duplicateScenario(compareAId, `${original.name} ${tControls("copySuffix")}`)
    const newId = useTaktStore.getState().activeScenarioId
    useTaktStore.getState().setCompareB(newId)
  }

  function handleStressTest() {
    const store = useTaktStore.getState()
    if (!scenarioA) return
    const newName = `${scenarioA.name} ${t("stressTestSuffix")}`
    const newDemand = Math.ceil(scenarioA.demandPerDay * 1.2)
    store.createScenarioVariant(
      scenarioA.id,
      newName,
      undefined,
      { demandPerDay: newDemand }
    )
  }


  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <ConsultingBackground />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 pt-2 pb-24 md:pb-8">
        <div className="page-header-rule pb-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("subtitleFull")}
            </p>
          </div>
          <ExportComparePdfButton scenarioAId={scenarioA.id} scenarioBId={scenarioB.id} />
        </div>

        {/* Selectors */}
        <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="pt-6 pb-6 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="flex-1 rounded-xl border border-blue-100/50 bg-blue-50/20 p-3 shadow-inner">
              <ScenarioSelect
                label={t("scenarioA")}
                value={scenarioA.id}
                onChange={setCompareA}
                scenarios={scenarios}
                colorScheme="blue"
              />
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:pb-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapAB}
                className="h-10 w-10 rounded-full border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:text-slate-700 hover:shadow-md"
                title={t("swapScenarios")}
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleDuplicateAtoB}
                className="h-10 rounded-full border-slate-200 bg-white px-4 text-sm font-medium text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:text-slate-700 hover:shadow-md"
                title={t("duplicateAtoB")}
              >
                <Copy className="mr-2 h-4 w-4" />
                A → B
              </Button>
              <Button
                variant="outline"
                onClick={handleStressTest}
                className="h-10 rounded-full border-rose-200 bg-rose-50/50 px-4 text-sm font-medium text-rose-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-100 hover:shadow-md group"
                title={t("stressTestTooltip")}
              >
                <Zap className="mr-2 h-4 w-4 text-rose-500 transition-transform group-hover:scale-110 group-hover:text-rose-600" />
                {t("stressTest")}
              </Button>
            </div>

            <div className="flex-1 rounded-xl border border-indigo-100/50 bg-indigo-50/20 p-3 shadow-inner">
              <ScenarioSelect
                label={t("scenarioB")}
                value={scenarioB.id}
                onChange={setCompareB}
                scenarios={scenarios}
                colorScheme="indigo"
              />
            </div>
          </div>

          {sameScenario && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {t("sameScenarioWarning")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banner de Veredicto Ejecutivo */}
      <ExecutiveVerdictBanner
        scenarioA={scenarioA}
        scenarioB={scenarioB}
        kpisA={kpisA}
        kpisB={kpisB}
      />

      {/* Mini KPIs + charts side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
              A
            </span>
            <span className="truncate text-sm font-bold text-blue-950" title={scenarioA.name}>
              {scenarioA.name}
            </span>
          </div>
          <MiniKpis kpis={kpisA} />
          <TaktChart scenarioId={scenarioA.id} height={320} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
              B
            </span>
            <span className="truncate text-sm font-bold text-indigo-950" title={scenarioB.name}>
              {scenarioB.name}
            </span>
          </div>
          <MiniKpis kpis={kpisB} />
          <TaktChart scenarioId={scenarioB.id} height={320} />
        </div>
      </div>

      {/* Line diagrams */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LineDiagram scenarioId={scenarioA.id} />
        <LineDiagram scenarioId={scenarioB.id} />
      </div>

      {/* Comparison table */}
      <ComparisonTable
        scenarioA={scenarioA}
        scenarioB={scenarioB}
        kpisA={kpisA}
        kpisB={kpisB}
      />

      {/* Economic Comparison table */}
      <EconComparisonTable
        scenarioA={scenarioA}
        scenarioB={scenarioB}
        kpisA={kpisA}
        kpisB={kpisB}
      />

      {/* Monte Carlo Risk Comparison table */}
      <MonteCarloComparisonTable
        scenarioA={scenarioA}
        scenarioB={scenarioB}
      />
      </div>
    </div>
  )
}

// ─── Economic comparison table ──────────────────────────────────────────────────

function formatMoney(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function buildEconRows(
  scenarioA: Scenario,
  scenarioB: Scenario,
  kpisA: KPIs,
  kpisB: KPIs,
  locale: string,
  t: (key: string) => string
): TableRow[] {
  const econKpisA = calculateEconomicKPIs(scenarioA, kpisA)
  const econKpisB = calculateEconomicKPIs(scenarioB, kpisB)
  const econA = normalizeEconomics(scenarioA.economics)
  const econB = normalizeEconomics(scenarioB.economics)

  const monthA = econKpisA.profitProxyPerDay * econA.workingDaysPerMonth
  const monthB = econKpisB.profitProxyPerDay * econB.workingDaysPerMonth

  return [
    {
      label: t("rowTotalOpCost"),
      a: formatMoney(econKpisA.totalOperatingCostPerDay, locale),
      b: formatMoney(econKpisB.totalOperatingCostPerDay, locale),
      delta: econKpisB.totalOperatingCostPerDay - econKpisA.totalOperatingCostPerDay,
      higherIsBetter: false,
      fmtDelta: (v) => `${formatMoney(Math.abs(v), locale)} ${t("euroPerDay")}`,
    },
    {
      label: t("rowLaborCost"),
      a: formatMoney(econKpisA.laborCostPerDay, locale),
      b: formatMoney(econKpisB.laborCostPerDay, locale),
      delta: econKpisB.laborCostPerDay - econKpisA.laborCostPerDay,
      higherIsBetter: false,
      fmtDelta: (v) => `${formatMoney(Math.abs(v), locale)} ${t("euroPerDay")}`,
    },
    {
      label: t("rowReworkCost"),
      a: formatMoney(econKpisA.reworkCostPerDay, locale),
      b: formatMoney(econKpisB.reworkCostPerDay, locale),
      delta: econKpisB.reworkCostPerDay - econKpisA.reworkCostPerDay,
      higherIsBetter: false,
      fmtDelta: (v) => `${formatMoney(Math.abs(v), locale)} ${t("euroPerDay")}`,
    },
    {
      label: t("rowShiftCost"),
      a: formatMoney(econKpisA.shiftCostPerDay, locale),
      b: formatMoney(econKpisB.shiftCostPerDay, locale),
      delta: econKpisB.shiftCostPerDay - econKpisA.shiftCostPerDay,
      higherIsBetter: false,
      fmtDelta: (v) => `${formatMoney(Math.abs(v), locale)} ${t("euroPerDay")}`,
    },
    {
      label: t("rowContribution"),
      a: formatMoney(econKpisA.fulfilledContributionPerDay, locale),
      b: formatMoney(econKpisB.fulfilledContributionPerDay, locale),
      delta: econKpisB.fulfilledContributionPerDay - econKpisA.fulfilledContributionPerDay,
      higherIsBetter: true,
      fmtDelta: (v) => `${formatMoney(Math.abs(v), locale)} ${t("euroPerDay")}`,
    },
    {
      label: t("rowOpportunityGap"),
      a: formatMoney(econKpisA.opportunityGapValuePerDay, locale),
      b: formatMoney(econKpisB.opportunityGapValuePerDay, locale),
      delta: econKpisB.opportunityGapValuePerDay - econKpisA.opportunityGapValuePerDay,
      higherIsBetter: false,
      fmtDelta: (v) => `${formatMoney(Math.abs(v), locale)} ${t("euroPerDay")}`,
    },
    {
      label: t("rowProfitProxyDay"),
      a: formatMoney(econKpisA.profitProxyPerDay, locale),
      b: formatMoney(econKpisB.profitProxyPerDay, locale),
      delta: econKpisB.profitProxyPerDay - econKpisA.profitProxyPerDay,
      higherIsBetter: true,
      fmtDelta: (v) => `${formatMoney(Math.abs(v), locale)} ${t("euroPerDay")}`,
    },
    {
      label: t("rowProfitProxyMonth"),
      a: formatMoney(monthA, locale),
      b: formatMoney(monthB, locale),
      delta: monthB - monthA,
      higherIsBetter: true,
      fmtDelta: (v) => `${formatMoney(Math.abs(v), locale)} ${t("euroPerMonth")}`,
    },
  ]
}

function EconComparisonTable({
  scenarioA,
  scenarioB,
  kpisA,
  kpisB,
}: {
  scenarioA: Scenario
  scenarioB: Scenario
  kpisA: KPIs
  kpisB: KPIs
}) {
  const t = useTranslations("compare")
  const locale = useLocale()
  const rows = buildEconRows(scenarioA, scenarioB, kpisA, kpisB, locale, t)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-100/80 p-2 text-emerald-700">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{t("secEconTitle")}</CardTitle>
            <CardDescription className="text-xs">
              {t("econDisclaimer")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  {t("colMetric")}
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded border border-blue-200/80 bg-blue-50/80 px-2 py-0.5 font-bold text-blue-700 shadow-2xs">
                    A · {scenarioA.name}
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded border border-indigo-200/80 bg-indigo-50/80 px-2 py-0.5 font-bold text-indigo-700 shadow-2xs">
                    B · {scenarioB.name}
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  {t("colDelta")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn("border-b last:border-0", i % 2 === 0 ? "bg-background" : "bg-muted/20")}
                >
                  <td className="px-4 py-2.5 text-xs font-medium text-foreground/80">{row.label}</td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">{row.a}</td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">{row.b}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <DeltaBadge
                      delta={row.delta}
                      higherIsBetter={row.higherIsBetter}
                      fmt={row.fmtDelta}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Monte Carlo comparison table ───────────────────────────────────────────────

function buildMonteCarloRows(
  scenarioA: Scenario,
  scenarioB: Scenario,
  t: (key: string) => string
): TableRow[] {
  const optionsA = scenarioA.monteCarloOptions ?? {}
  const optionsB = scenarioB.monteCarloOptions ?? {}

  const resultA = runMonteCarlo(scenarioA, { runs: 2000, cv: optionsA.cv ?? 0.1, seed: optionsA.seed ?? 42 })
  const resultB = runMonteCarlo(scenarioB, { runs: 2000, cv: optionsB.cv ?? 0.1, seed: optionsB.seed ?? 42 })

  const probA = resultA.probabilityMeetDemand * 100
  const probB = resultB.probabilityMeetDemand * 100

  return [
    {
      label: t("rowProbMeet"),
      a: `${probA.toFixed(1)}%`,
      b: `${probB.toFixed(1)}%`,
      delta: probB - probA,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} ${t("ppUnit")}`,
    },
    {
      label: t("rowP5"),
      a: `${resultA.throughput.p5.toFixed(0)} ${t("unitsUds")}`,
      b: `${resultB.throughput.p5.toFixed(0)} ${t("unitsUds")}`,
      delta: resultB.throughput.p5 - resultA.throughput.p5,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(Math.round(v))} ${t("unitsUds")}`,
    },
    {
      label: t("rowP50"),
      a: `${resultA.throughput.median.toFixed(0)} ${t("unitsUds")}`,
      b: `${resultB.throughput.median.toFixed(0)} ${t("unitsUds")}`,
      delta: resultB.throughput.median - resultA.throughput.median,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(Math.round(v))} ${t("unitsUds")}`,
    },
    {
      label: t("rowP95"),
      a: `${resultA.throughput.p95.toFixed(0)} ${t("unitsUds")}`,
      b: `${resultB.throughput.p95.toFixed(0)} ${t("unitsUds")}`,
      delta: resultB.throughput.p95 - resultA.throughput.p95,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(Math.round(v))} ${t("unitsUds")}`,
    },
    {
      label: t("rowMean"),
      a: `${resultA.throughput.mean.toFixed(1)} ${t("unitsUds")}`,
      b: `${resultB.throughput.mean.toFixed(1)} ${t("unitsUds")}`,
      delta: resultB.throughput.mean - resultA.throughput.mean,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} ${t("unitsUds")}`,
    },
  ]
}

function MonteCarloComparisonTable({
  scenarioA,
  scenarioB,
}: {
  scenarioA: Scenario
  scenarioB: Scenario
}) {
  const t = useTranslations("compare")
  const rows = buildMonteCarloRows(scenarioA, scenarioB, t)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-purple-100/80 p-2 text-purple-700">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{t("secMcTitle")}</CardTitle>
            <CardDescription className="text-xs">
              {t("mcDisclaimer")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  {t("colMetric")}
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded border border-blue-200/80 bg-blue-50/80 px-2 py-0.5 font-bold text-blue-700 shadow-2xs">
                    A · {scenarioA.name}
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded border border-indigo-200/80 bg-indigo-50/80 px-2 py-0.5 font-bold text-indigo-700 shadow-2xs">
                    B · {scenarioB.name}
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  {t("colDelta")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn("border-b last:border-0", i % 2 === 0 ? "bg-background" : "bg-muted/20")}
                >
                  <td className="px-4 py-2.5 text-xs font-medium text-foreground/80">{row.label}</td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">{row.a}</td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">{row.b}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <DeltaBadge
                      delta={row.delta}
                      higherIsBetter={row.higherIsBetter}
                      fmt={row.fmtDelta}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
