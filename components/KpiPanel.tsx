"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs } from "@/lib/calculations"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, AlertTriangle, TrendingUp, BarChart3, Info, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mini progress bar ─────────────────────────────────────────────────────────

function ProgressBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn("h-full transition-all duration-300", colorClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function KpiPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-5">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="h-3 w-full animate-pulse rounded bg-muted" />
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function KpiPanel() {
  const t = useTranslations("simulator.kpi")
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )

  const kpis = useMemo(
    () => (scenario && scenario.stations.length > 0 ? calculateAllKPIs(scenario) : null),
    [scenario]
  )

  if (!hydrated) return <KpiPanelSkeleton />

  if (!kpis || !scenario) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6">
          <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        </CardContent>
      </Card>
    )
  }

  const bottleneckExceedsTakt = kpis.bottleneckCycleMin > kpis.taktTimeMin

  const saturationRatioPct =
    kpis.throughputPerDay > 0
      ? Math.round((scenario.demandPerDay / kpis.throughputPerDay) * 100)
      : 0

  let saturationStatus: "overload" | "optimal" | "underutilized" = "optimal"
  let saturationColorClass = "bg-emerald-500 dark:bg-emerald-400"
  let saturationLabel = ""

  if (saturationRatioPct > 100) {
    saturationStatus = "overload"
    saturationColorClass = "bg-rose-500 dark:bg-rose-400"
    saturationLabel = t("saturationOverload", { pct: saturationRatioPct })
  } else if (saturationRatioPct >= 75) {
    saturationStatus = "optimal"
    saturationColorClass = "bg-emerald-500 dark:bg-emerald-400"
    saturationLabel = t("saturationOptimal", { pct: saturationRatioPct })
  } else {
    saturationStatus = "underutilized"
    saturationColorClass = "bg-sky-500 dark:bg-sky-400"
    saturationLabel = t("saturationUnderutilized", { pct: saturationRatioPct })
  }

  const effPct = kpis.balancingEfficiency * 100
  const effColorClass =
    effPct >= 85 ? "bg-green-600" : effPct >= 70 ? "bg-amber-500" : "bg-red-600"
  const effLabel =
    effPct >= 85
      ? t("effExcellent")
      : effPct >= 70
        ? t("effGood")
        : t("effBad")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* CARD 1 — Takt Time */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Takt Time
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help" aria-label={t("taktAria")}>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs p-3 text-xs space-y-1.5 shadow-lg border backdrop-blur-md">
                  <p className="font-semibold text-foreground">{t("taktFormulaTitle")}</p>
                  <div className="rounded bg-muted/80 p-1.5 font-mono text-[11px] text-center text-primary font-bold border">
                    {t("taktFormulaEq")}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("taktFormulaCalc", {
                      available: kpis.availableTimeMin.toFixed(0),
                      demand: scenario.demandPerDay,
                      result: kpis.taktTimeMin.toFixed(1),
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{kpis.taktTimeMin.toFixed(1)}</span>
              <span className="ml-1 text-xs text-muted-foreground">{t("minPerUnit")}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("taktSub")}</p>
          </CardContent>
        </Card>

        {/* CARD 2 — Cuello de botella */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <AlertTriangle
                  className={cn(
                    "h-3.5 w-3.5",
                    bottleneckExceedsTakt ? "text-destructive" : "text-amber-500"
                  )}
                />
                {t("bottleneck")}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs p-3 text-xs space-y-1.5 shadow-lg border backdrop-blur-md">
                  <p className="font-semibold text-foreground">{t("bottleneckFormulaTitle")}</p>
                  <div className="rounded bg-muted/80 p-1.5 font-mono text-[11px] text-center text-primary font-bold border">
                    {t("bottleneckFormulaEq")}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("bottleneckFormulaCalc", {
                      name: kpis.bottleneckStationName || "—",
                      result: kpis.bottleneckCycleMin.toFixed(1),
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div
              className="mt-2 truncate text-lg font-bold leading-tight"
              title={kpis.bottleneckStationName}
            >
              {kpis.bottleneckStationName || "—"}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("bottleneckEffective", { value: kpis.bottleneckCycleMin.toFixed(1) })}
            </p>
            <div className="mt-2">
              {bottleneckExceedsTakt ? (
                <Badge variant="destructive" className="text-xs">{t("exceedsTakt")}</Badge>
              ) : (
                <Badge variant="success" className="text-xs">{t("withinTakt")}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CARD 3 — Capacidad de Producción y Saturación */}
        <Card className="transition-all hover:shadow-md">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                {t("capacityTitle")}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs p-3 text-xs space-y-1.5 shadow-lg border backdrop-blur-md">
                  <p className="font-semibold text-foreground">{t("capacityFormulaTitle")}</p>
                  <div className="rounded bg-muted/80 p-1.5 font-mono text-[11px] text-center text-primary font-bold border">
                    {t("capacityFormulaEq")}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("capacityFormulaCalc", {
                      available: kpis.availableTimeMin.toFixed(0),
                      bottleneckTime: kpis.bottleneckCycleMin.toFixed(1),
                      result: kpis.throughputPerDay,
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span
                  className={cn(
                    "text-2xl font-bold tracking-tight",
                    kpis.meetsDemand ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {kpis.throughputPerDay}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">{t("unitsPerDay")}</span>
              </div>

              {/* Badge de estado de saturación */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-2xs",
                  saturationStatus === "overload" && "border-rose-300 bg-rose-100/90 text-rose-800 dark:border-rose-700/60 dark:bg-rose-950/80 dark:text-rose-300",
                  saturationStatus === "optimal" && "border-emerald-300 bg-emerald-100/90 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/80 dark:text-emerald-300",
                  saturationStatus === "underutilized" && "border-sky-300 bg-sky-100/90 text-sky-800 dark:border-sky-700/60 dark:bg-sky-950/80 dark:text-sky-300"
                )}
              >
                <Gauge className="h-3 w-3 shrink-0" />
                <span>{saturationLabel}</span>
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {kpis.meetsDemand
                ? t("meetsDemand", { delta: kpis.demandDelta })
                : t("missesDemand", { delta: Math.abs(kpis.demandDelta) })}
            </p>

            {/* Mini-barra de saturación */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                <span>{t("capacitySaturation")}</span>
                <span className="font-semibold text-foreground">{saturationRatioPct}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={cn("h-full transition-all duration-500 rounded-full", saturationColorClass)}
                  style={{ width: `${Math.min(100, saturationRatioPct)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 4 — Eficiencia de balanceo */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                {t("balancing")}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs p-3 text-xs space-y-1.5 shadow-lg border backdrop-blur-md">
                  <p className="font-semibold text-foreground">{t("efficiencyFormulaTitle")}</p>
                  <div className="rounded bg-muted/80 p-1.5 font-mono text-[11px] text-center text-primary font-bold border">
                    {t("efficiencyFormulaEq")}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("efficiencyFormulaCalc", {
                      totalCycle: kpis.totalCycleMin.toFixed(1),
                      count: scenario.stations.length,
                      bottleneckTime: kpis.bottleneckCycleMin.toFixed(1),
                      result: (kpis.balancingEfficiency * 100).toFixed(0),
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">
                {(kpis.balancingEfficiency * 100).toFixed(0)}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">%</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{effLabel}</p>
            <ProgressBar value={effPct} colorClass={effColorClass} />
          </CardContent>
        </Card>
      </div>

      {/* Secondary stats */}
      <p className="text-xs text-muted-foreground">
        {t("leadTime")}{" "}
        <span className="font-medium text-foreground">
          {kpis.leadTimeMin.toFixed(1)} {t("minPerUnit")}
        </span>
        {" · "}
        {t("totalCycle")}{" "}
        <span className="font-medium text-foreground">
          {kpis.totalCycleMin.toFixed(1)} {t("minUnit")}
        </span>
        {" · "}
        {t("availableTime")}{" "}
        <span className="font-medium text-foreground">
          {kpis.availableTimeMin.toFixed(0)} {t("minPerDay")}
        </span>
      </p>
    </div>
  )
}
