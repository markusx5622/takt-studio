import type { Scenario, KPIs } from "@/types"
import { getStationsWithEffective } from "@/lib/calculations"

export type InsightType = "critical" | "warning" | "success" | "info"

export type Insight = {
  type: InsightType
  title: string
  message: string
}

export function generateInsights(scenario: Scenario, kpis: KPIs): Insight[] {
  if (scenario.stations.length === 0) return []

  const insights: Insight[] = []
  const stationsEff = getStationsWithEffective(scenario.stations, kpis.taktTimeMin)

  const sorted = [...stationsEff].sort((a, b) => b.effectiveCycleMin - a.effectiveCycleMin)
  const bottleneck = sorted[0]
  const secondSlowest = sorted[1]
  const fastest = sorted[sorted.length - 1]

  // 1. Demand met / not met
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

  // 2. Dominant bottleneck (>20% slower than 2nd)
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

  // 3. Balancing efficiency
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

  // 4. High failure rate (>5%)
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

  // 5. Theoretical max capacity (if ≥2 stations)
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
