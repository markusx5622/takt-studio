import type { Scenario, KPIs } from "@/types"
import { getStationsWithEffective } from "@/lib/calculations"

export type InsightType = "critical" | "warning" | "success" | "info"

/**
 * i18n: los insights no llevan texto, llevan la CLAVE del mensaje y los valores
 * a interpolar. La UI (InsightsPanel) y el PDF los resuelven con next-intl
 * bajo el namespace "simulator.insights.<key>.title|message".
 */
export type Insight = {
  type: InsightType
  key: string
  values?: Record<string, string | number>
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
      key: "demandNotMet",
      values: {
        throughput: kpis.throughputPerDay,
        demand: scenario.demandPerDay,
        deficit: Math.abs(kpis.demandDelta),
        station: kpis.bottleneckStationName,
        cycle: kpis.bottleneckCycleMin.toFixed(1),
        takt: kpis.taktTimeMin.toFixed(1),
      },
    })
  } else {
    insights.push({
      type: "success",
      key: "demandMet",
      values: {
        throughput: kpis.throughputPerDay,
        demand: scenario.demandPerDay,
      },
    })
  }

  // 2. Dominant bottleneck (>20% slower than 2nd)
  if (bottleneck && secondSlowest && secondSlowest.effectiveCycleMin > 0) {
    const diff =
      (bottleneck.effectiveCycleMin - secondSlowest.effectiveCycleMin) /
      secondSlowest.effectiveCycleMin
    if (diff > 0.2) {
      const isMachine = bottleneck.processType === "machine"
      const reducedTime = isMachine
        ? (bottleneck.cycleTimeMin * 0.8 / (bottleneck.unitsPerCycle ?? 1)) * (1 + bottleneck.failureRate)
        : (bottleneck.cycleTimeMin / ((bottleneck.unitsPerCycle ?? 1) * (bottleneck.operators + 1))) *
          (1 + bottleneck.failureRate)
      insights.push({
        type: "warning",
        key: "dominantBottleneck",
        values: {
          name: bottleneck.name,
          reduced: reducedTime.toFixed(1),
        },
      })
    }
  }

  // 3. Balancing efficiency
  const effPct = kpis.balancingEfficiency * 100
  if (effPct < 70) {
    insights.push({
      type: "warning",
      key: "unbalanced",
      values: {
        pct: effPct.toFixed(0),
        fastName: fastest?.name ?? "—",
        fastMin: fastest?.effectiveCycleMin.toFixed(1) ?? "—",
        slowName: bottleneck?.name ?? "—",
        slowMin: bottleneck?.effectiveCycleMin.toFixed(1) ?? "—",
      },
    })
  } else if (effPct >= 85) {
    insights.push({
      type: "success",
      key: "wellBalanced",
      values: { pct: effPct.toFixed(0) },
    })
  }

  // 4. High failure rate (>5%)
  const highFailure = scenario.stations.filter((s) => s.failureRate > 0.05)
  if (highFailure.length > 0) {
    const s = highFailure[0]
    const isMachine = s.processType === "machine"
    const opDivisor = isMachine ? 1 : Math.max(1, s.operators)
    const baseTime = (s.cycleTimeMin / (s.unitsPerCycle ?? 1)) / opDivisor
    const savings = baseTime * (s.failureRate - 0.02)
    insights.push({
      type: "warning",
      key: "highFailure",
      values: {
        name: s.name,
        rate: (s.failureRate * 100).toFixed(0),
        savings: savings.toFixed(1),
      },
    })
  }

  // 5. Theoretical max capacity (if ≥2 stations)
  if (secondSlowest && kpis.availableTimeMin > 0) {
    const theoretical = Math.floor(kpis.availableTimeMin / secondSlowest.effectiveCycleMin)
    insights.push({
      type: "info",
      key: "theoreticalMax",
      values: {
        capacity: theoretical,
        name: secondSlowest.name,
      },
    })
  }

  return insights
}
