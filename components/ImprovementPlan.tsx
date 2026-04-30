"use client"

import { useMemo } from "react"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs, generateRecommendations } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Wrench,
  ArrowRight,
  TrendingUp,
  Clock,
  BarChart3,
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertTriangle,
} from "lucide-react"
import type { ImprovementRecommendation, ImprovementPriority } from "@/types"

// ─── Priority styles ───────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<
  ImprovementPriority,
  { badge: string; label: string; border: string }
> = {
  high: {
    badge: "bg-red-100 text-red-800",
    label: "Alta prioridad",
    border: "border-red-200/60",
  },
  medium: {
    badge: "bg-amber-100 text-amber-800",
    label: "Prioridad media",
    border: "border-amber-200/60",
  },
  low: {
    badge: "bg-blue-100 text-blue-800",
    label: "Baja prioridad",
    border: "border-border",
  },
}

// ─── Impact metric ─────────────────────────────────────────────────────────────

function ImpactMetric({
  label,
  value,
  delta,
  positive,
  neutral,
}: {
  label: string
  value: string
  delta?: string
  positive?: boolean
  neutral?: boolean
}) {
  const colorClass = neutral
    ? "text-muted-foreground"
    : positive
      ? "text-green-600"
      : "text-red-600"

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
      {delta && <span className={cn("text-xs font-medium", colorClass)}>{delta}</span>}
    </div>
  )
}

// ─── Recommendation card ───────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  onApply,
}: {
  rec: ImprovementRecommendation
  onApply: (rec: ImprovementRecommendation) => void
}) {
  const styles = PRIORITY_STYLES[rec.priority]
  const throughputPositive = rec.throughputDelta > 0
  const balancingPositive = rec.balancingDelta > 0
  const leadTimePositive = rec.leadTimeDelta < 0

  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-4 transition-all duration-200 hover:shadow-sm",
        styles.border
      )}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 shrink-0 text-primary" />
          <h4 className="text-sm font-semibold leading-tight">{rec.title}</h4>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={cn("text-[10px]", styles.badge)}>
            {styles.label}
          </Badge>
          {rec.badge && (
            <Badge variant="outline" className="text-[10px]">
              {rec.badge}
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-xs leading-relaxed text-foreground/70">{rec.description}</p>

      {/* Impact metrics */}
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-md border bg-muted/20 p-3 sm:grid-cols-4">
        <ImpactMetric
          label="Throughput"
          value={`${rec.projectedKpis.throughputPerDay} uds/día`}
          delta={
            throughputPositive
              ? `+${rec.throughputDelta} uds`
              : rec.throughputDelta < 0
                ? `${rec.throughputDelta} uds`
                : "Sin cambio"
          }
          positive={throughputPositive}
          neutral={rec.throughputDelta === 0}
        />
        <ImpactMetric
          label="Demanda"
          value={rec.meetsDemandAfter ? "Cumple" : "No cumple"}
          delta={
            rec.meetsDemandAfter && !rec.baseKpis.meetsDemand
              ? "Pasa a cumplir"
              : undefined
          }
          positive={rec.meetsDemandAfter}
          neutral={rec.meetsDemandAfter === rec.baseKpis.meetsDemand}
        />
        <ImpactMetric
          label="Balanceo"
          value={`${(rec.projectedKpis.balancingEfficiency * 100).toFixed(0)}%`}
          delta={
            Math.abs(rec.balancingDelta) >= 0.1
              ? `${rec.balancingDelta > 0 ? "+" : ""}${rec.balancingDelta.toFixed(1)} pp`
              : "Sin cambio"
          }
          positive={balancingPositive}
          neutral={Math.abs(rec.balancingDelta) < 0.1}
        />
        <ImpactMetric
          label="Lead time"
          value={`${rec.projectedKpis.leadTimeMin.toFixed(1)} min`}
          delta={
            Math.abs(rec.leadTimeDelta) >= 0.1
              ? `${rec.leadTimeDelta > 0 ? "+" : ""}${rec.leadTimeDelta.toFixed(1)} min`
              : "Sin cambio"
          }
          positive={leadTimePositive}
          neutral={Math.abs(rec.leadTimeDelta) < 0.1}
        />
      </div>

      {/* Action */}
      <div className="mt-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs transition-all duration-200 hover:bg-muted hover:border-foreground/20"
          onClick={() => onApply(rec)}
        >
          <ArrowRight className="h-3.5 w-3.5" />
          {rec.applyLabel}
        </Button>
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function ImprovementPlanSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <div className="h-5 w-5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-16 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ImprovementPlan() {
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const createScenarioVariant = useTaktStore((s) => s.createScenarioVariant)

  const kpis = useMemo(
    () => (scenario && scenario.stations.length > 0 ? calculateAllKPIs(scenario) : null),
    [scenario]
  )

  const recommendations = useMemo(() => {
    if (!scenario || !kpis) return []
    return generateRecommendations(scenario, kpis)
  }, [scenario, kpis])

  if (!hydrated) return <ImprovementPlanSkeleton />

  if (!scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Plan de mejora recomendado</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Define la línea para obtener recomendaciones de mejora
          </p>
          <p className="text-xs text-muted-foreground/60">
            Añade estaciones y parámetros para que el simulador proponga acciones concretas.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Plan de mejora recomendado</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-center">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            La línea actual está bien configurada o no se detectan mejoras automáticas claras.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Ajusta la demanda, los turnos o las estaciones para explorar nuevas opciones.
          </p>
        </CardContent>
      </Card>
    )
  }

  function handleApply(rec: ImprovementRecommendation) {
    if (!scenario) return
    createScenarioVariant(
      scenario.id,
      `${scenario.name} — ${rec.title}`,
      rec.stationChanges,
      rec.scenarioChanges
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <Lightbulb className="h-5 w-5 text-primary" aria-hidden />
        <div>
          <CardTitle className="text-lg">Plan de mejora recomendado</CardTitle>
          <CardDescription className="text-xs">
            Acciones simuladas para mejorar capacidad, balanceo o cumplimiento de demanda
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} onApply={handleApply} />
        ))}
      </CardContent>
    </Card>
  )
}
