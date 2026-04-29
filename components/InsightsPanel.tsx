"use client"

import { useState } from "react"
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useTaktStore, useHydrated } from "@/lib/store"
import {
  calculateAllKPIs,
  getStationsWithEffective,
  calculateTaktTime,
} from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Scenario, KPIs } from "@/types"

// ─── Insight type ─────────────────────────────────────────────────────────────

type InsightType = "critical" | "warning" | "success" | "info"

type Insight = {
  type: InsightType
  title: string
  message: string
}

// ─── Logic ────────────────────────────────────────────────────────────────────

function generateInsights(scenario: Scenario, kpis: KPIs): Insight[] {
  if (scenario.stations.length === 0) return []

  const insights: Insight[] = []
  const stationsEff = getStationsWithEffective(scenario.stations, kpis.taktTimeMin)

  // Sort descending by effective cycle — [0] = slowest (bottleneck), [last] = fastest
  const sorted = [...stationsEff].sort((a, b) => b.effectiveCycleMin - a.effectiveCycleMin)
  const bottleneck = sorted[0]
  const secondSlowest = sorted[1]
  const fastest = sorted[sorted.length - 1]

  // ── 1. Demand met / not met ──────────────────────────────────────────────────
  if (!kpis.meetsDemand) {
    insights.push({
      type: "critical",
      title: "Producción insuficiente",
      message:
        `La línea produce ${kpis.throughputPerDay} uds/día pero la demanda es ` +
        `${scenario.demandPerDay}. Déficit de ${Math.abs(kpis.demandDelta)} módulos diarios. ` +
        `El cuello de botella en '${kpis.bottleneckStationName}' ` +
        `(${kpis.bottleneckCycleMin.toFixed(1)} min) supera el takt time ` +
        `(${kpis.taktTimeMin.toFixed(1)} min).`,
    })
  } else {
    insights.push({
      type: "success",
      title: "Demanda cubierta",
      message:
        `La línea produce ${kpis.throughputPerDay} uds/día, por encima de la demanda de ` +
        `${scenario.demandPerDay}.`,
    })
  }

  // ── 2. Dominant bottleneck (>20% slower than 2nd) ───────────────────────────
  if (bottleneck && secondSlowest && secondSlowest.effectiveCycleMin > 0) {
    const diff =
      (bottleneck.effectiveCycleMin - secondSlowest.effectiveCycleMin) /
      secondSlowest.effectiveCycleMin
    if (diff > 0.2) {
      const reducedTime =
        (bottleneck.cycleTimeMin / (bottleneck.operators + 1)) *
        (1 + bottleneck.failureRate)
      insights.push({
        type: "warning",
        title: "Cuello de botella dominante",
        message:
          `'${bottleneck.name}' es significativamente más lento que el resto. ` +
          `Opciones: añadir 1 operario (reduciría a ${reducedTime.toFixed(1)} min) ` +
          `o redistribuir tareas con estaciones adyacentes.`,
      })
    }
  }

  // ── 3. Balancing efficiency ──────────────────────────────────────────────────
  const effPct = kpis.balancingEfficiency * 100
  if (effPct < 70) {
    insights.push({
      type: "warning",
      title: `Línea desbalanceada (${effPct.toFixed(0)}%)`,
      message:
        `Hay mucha variación entre tiempos efectivos. Las estaciones más rápidas ` +
        `('${fastest?.name ?? "—"}', ${fastest?.effectiveCycleMin.toFixed(1) ?? "—"} min) ` +
        `esperan a las lentas ('${bottleneck?.name ?? "—"}', ` +
        `${bottleneck?.effectiveCycleMin.toFixed(1) ?? "—"} min). ` +
        `Considera redistribuir cargas.`,
    })
  } else if (effPct >= 85) {
    insights.push({
      type: "success",
      title: `Excelente balanceo (${effPct.toFixed(0)}%)`,
      message: `Los tiempos efectivos están bien distribuidos. Poco margen de mejora por redistribución.`,
    })
  }

  // ── 4. High failure rate (>5%) ───────────────────────────────────────────────
  const highFailure = scenario.stations.filter((s) => s.failureRate > 0.05)
  if (highFailure.length > 0) {
    const s = highFailure[0]
    const baseTime = s.cycleTimeMin / s.operators
    const savings = baseTime * (s.failureRate - 0.02)
    insights.push({
      type: "warning",
      title: "Tasa de fallo elevada",
      message:
        `La estación '${s.name}' tiene una tasa de fallo del ` +
        `${(s.failureRate * 100).toFixed(0)}%. Reducirla al 2% ahorraría ` +
        `${savings.toFixed(1)} min/ud de tiempo efectivo.`,
    })
  }

  // ── 5. Theoretical max capacity (always, if ≥2 stations) ────────────────────
  if (secondSlowest && kpis.availableTimeMin > 0) {
    const theoretical = Math.floor(kpis.availableTimeMin / secondSlowest.effectiveCycleMin)
    insights.push({
      type: "info",
      title: "Capacidad teórica máxima",
      message:
        `Si se eliminara el cuello de botella, la capacidad máxima sería de ` +
        `${theoretical} uds/día (limitado por la siguiente estación más lenta: ` +
        `'${secondSlowest.name}').`,
    })
  }

  return insights
}

// ─── Insight styles ───────────────────────────────────────────────────────────

const ICON_MAP: Record<InsightType, React.ComponentType<{ className?: string }>> = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
}

const STYLE_MAP: Record<InsightType, { wrap: string; icon: string }> = {
  critical: { wrap: "border-red-200 bg-red-50",    icon: "text-red-600" },
  warning:  { wrap: "border-amber-200 bg-amber-50", icon: "text-amber-600" },
  success:  { wrap: "border-green-200 bg-green-50", icon: "text-green-600" },
  info:     { wrap: "border-blue-200 bg-blue-50",   icon: "text-blue-600" },
}

// ─── Single insight block ─────────────────────────────────────────────────────

function InsightBlock({ insight }: { insight: Insight }) {
  const Icon = ICON_MAP[insight.type]
  const styles = STYLE_MAP[insight.type]
  return (
    <div className={cn("flex gap-3 rounded-lg border p-3", styles.wrap)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.icon)} />
      <div>
        <p className="text-sm font-semibold leading-tight">{insight.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{insight.message}</p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const MAX_VISIBLE = 5

export default function InsightsPanel() {
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const [expanded, setExpanded] = useState(false)

  if (!hydrated || !scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4 space-y-0">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Análisis automático</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[120px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Añade estaciones para obtener análisis.
          </p>
        </CardContent>
      </Card>
    )
  }

  const kpis = calculateAllKPIs(scenario)
  const insights = generateInsights(scenario, kpis)
  const visible = expanded ? insights : insights.slice(0, MAX_VISIBLE)
  const hiddenCount = insights.length - MAX_VISIBLE

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">Análisis automático</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((insight, i) => (
          <InsightBlock key={i} insight={insight} />
        ))}

        {hiddenCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-3.5 w-3.5" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
                Ver {hiddenCount} más
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
