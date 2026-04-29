"use client"

import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs } from "@/lib/calculations"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, AlertTriangle, TrendingUp, BarChart3, Info } from "lucide-react"
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
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )

  if (!hydrated) return <KpiPanelSkeleton />

  if (!scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center p-6">
          <p className="text-center text-sm text-muted-foreground">
            Añade estaciones para ver los KPIs
          </p>
        </CardContent>
      </Card>
    )
  }

  const kpis = calculateAllKPIs(scenario)

  const bottleneckExceedsTakt = kpis.bottleneckCycleMin > kpis.taktTimeMin

  const throughputPct =
    scenario.demandPerDay > 0
      ? (kpis.throughputPerDay / scenario.demandPerDay) * 100
      : 0
  const throughputColorClass = kpis.meetsDemand ? "bg-green-600" : "bg-red-600"

  const effPct = kpis.balancingEfficiency * 100
  const effColorClass =
    effPct >= 85 ? "bg-green-600" : effPct >= 70 ? "bg-amber-500" : "bg-red-600"
  const effLabel =
    effPct >= 85
      ? "Excelente balanceo"
      : effPct >= 70
        ? "Buen balanceo, margen de mejora"
        : "Línea desbalanceada — redistribuir cargas"

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
                  <span className="cursor-help">
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>
                    Tiempo disponible ({kpis.availableTimeMin.toFixed(0)} min) ÷{" "}
                    Demanda ({scenario.demandPerDay} uds)
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{kpis.taktTimeMin.toFixed(1)}</span>
              <span className="ml-1 text-xs text-muted-foreground">min/ud</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Ritmo necesario de producción</p>
          </CardContent>
        </Card>

        {/* CARD 2 — Cuello de botella */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <AlertTriangle
                className={cn(
                  "h-3.5 w-3.5",
                  bottleneckExceedsTakt ? "text-destructive" : "text-amber-500"
                )}
              />
              Cuello de botella
            </div>
            <div
              className="mt-2 truncate text-lg font-bold leading-tight"
              title={kpis.bottleneckStationName}
            >
              {kpis.bottleneckStationName || "—"}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {kpis.bottleneckCycleMin.toFixed(1)} min/ud efectivos
            </p>
            <div className="mt-2">
              {bottleneckExceedsTakt ? (
                <Badge variant="destructive" className="text-xs">Excede Takt</Badge>
              ) : (
                <Badge variant="success" className="text-xs">Dentro de Takt</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CARD 3 — Throughput */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Throughput
            </div>
            <div className="mt-2">
              <span
                className={cn(
                  "text-2xl font-bold",
                  kpis.meetsDemand ? "text-green-600" : "text-red-600"
                )}
              >
                {kpis.throughputPerDay}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">uds/día</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {kpis.meetsDemand
                ? `✓ Cumple demanda (+${kpis.demandDelta} extra)`
                : `✗ Déficit de ${Math.abs(kpis.demandDelta)} uds/día`}
            </p>
            <ProgressBar value={throughputPct} colorClass={throughputColorClass} />
          </CardContent>
        </Card>

        {/* CARD 4 — Eficiencia de balanceo */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Balanceo
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
        Lead time:{" "}
        <span className="font-medium text-foreground">{kpis.leadTimeMin.toFixed(1)} min/ud</span>
        {" · "}
        Tiempo total ciclo:{" "}
        <span className="font-medium text-foreground">{kpis.totalCycleMin.toFixed(1)} min</span>
        {" · "}
        Tiempo disponible:{" "}
        <span className="font-medium text-foreground">
          {kpis.availableTimeMin.toFixed(0)} min/día
        </span>
      </p>
    </div>
  )
}
