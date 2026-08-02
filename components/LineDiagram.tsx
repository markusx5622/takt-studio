"use client"

import { useMemo, Fragment } from "react"
import { useTranslations } from "next-intl"
import {
  ArrowRight,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  PackageCheck,
  GitBranch,
} from "lucide-react"
import { useTaktStore, useHydrated } from "@/lib/store"
import { getStationsWithEffective, calculateTaktTime } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { StationWithEffective } from "@/types"

// ─── ENTRADA ──────────────────────────────────────────────────────────────────

function EntradaIndicator() {
  const t = useTranslations("simulator.diagram")
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/40 px-4 py-4">
      <Package className="h-5 w-5 text-muted-foreground" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {t("input")}
      </span>
    </div>
  )
}

// ─── SALIDA ───────────────────────────────────────────────────────────────────

function SalidaIndicator() {
  const t = useTranslations("simulator.diagram")
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-green-400 px-4 py-4">
      <PackageCheck className="h-5 w-5 text-green-600" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">
        {t("output")}
      </span>
    </div>
  )
}

// ─── Arrow ────────────────────────────────────────────────────────────────────

function ArrowConnector() {
  return (
    <div className="flex shrink-0 items-center justify-center p-1.5 text-muted-foreground/40">
      <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
    </div>
  )
}

// ─── Station card ─────────────────────────────────────────────────────────────

function StationCard({ station, index }: { station: StationWithEffective; index: number }) {
  const t = useTranslations("simulator.diagram")
  return (
    <div
      className={cn(
        "w-40 shrink-0 overflow-hidden rounded-lg border-2 transition-shadow hover:shadow-lg",
        station.isBottleneck && "border-red-500",
        !station.isBottleneck && station.exceedsTakt && "border-amber-500 bg-amber-50",
        !station.isBottleneck && !station.exceedsTakt && "border-green-300 bg-white"
      )}
    >
      {station.isBottleneck && (
        <div className="bg-red-500 px-1 py-0.5 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wide text-white">
            {t("bottleneck")}
          </span>
        </div>
      )}

      <div className="p-3">
        <div className="mb-2 flex items-start gap-1">
          <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
            #{index + 1}
          </span>
          <span
            className="line-clamp-2 text-[11px] font-semibold leading-tight"
            title={station.name}
          >
            {station.name}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="font-medium">{station.effectiveCycleMin.toFixed(1)} min</span>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3 shrink-0" />
          <span>×{station.operators}</span>
        </div>

        {station.failureRate > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>{t("failure", { pct: (station.failureRate * 100).toFixed(0) })}</span>
          </div>
        )}

        <div className="mt-2 flex justify-end">
          {station.exceedsTakt ? (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-label={t("exceedsTakt")} />
          ) : (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" aria-label={t("withinTakt")} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LineDiagramSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 w-40 shrink-0 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface LineDiagramProps {
  scenarioId?: string
}

export default function LineDiagram({ scenarioId }: LineDiagramProps = {}) {
  const t = useTranslations("simulator.diagram")
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === (scenarioId ?? state.activeScenarioId))
  )

  const taktTimeMin = useMemo(
    () => (scenario ? calculateTaktTime(scenario) : 0),
    [scenario]
  )

  const stations = useMemo(
    () => (scenario ? getStationsWithEffective(scenario.stations, taktTimeMin) : []),
    [scenario, taktTimeMin]
  )

  if (!hydrated) return <LineDiagramSkeleton />

  if (!scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 flex-col items-center justify-center gap-3 text-center">
          <GitBranch className="h-10 w-10 text-muted-foreground/25" />
          <p className="text-sm text-muted-foreground">
            {t("empty")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-3 pt-1">
          <div className="flex flex-col items-center md:min-w-max md:flex-row md:items-center">
            <EntradaIndicator />
            <ArrowConnector />

            {stations.map((station, index) => (
              <Fragment key={station.id}>
                <StationCard station={station} index={index} />
                {index < stations.length - 1 && <ArrowConnector />}
              </Fragment>
            ))}

            <ArrowConnector />
            <SalidaIndicator />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
