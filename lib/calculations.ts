import { type Station, type Scenario, type KPIs, type StationWithEffective, type ImprovementRecommendation, type ImprovementType, type ImprovementPriority } from "@/types"

/** Tiempo de ciclo efectivo considerando operarios y tasa de fallo */
export function getEffectiveCycleTime(station: Station): number {
  if (station.operators <= 0) return Infinity
  return (station.cycleTimeMin / station.operators) * (1 + station.failureRate)
}

export function getStationsWithEffective(
  stations: Station[],
  taktTimeMin: number
): StationWithEffective[] {
  if (stations.length === 0) return []

  const withEffective = stations.map((s) => ({
    ...s,
    effectiveCycleMin: getEffectiveCycleTime(s),
    isBottleneck: false,
    exceedsTakt: false,
  }))

  const maxEffective = Math.max(...withEffective.map((s) => s.effectiveCycleMin))

  return withEffective.map((s) => ({
    ...s,
    isBottleneck: s.effectiveCycleMin === maxEffective,
    exceedsTakt: taktTimeMin > 0 ? s.effectiveCycleMin > taktTimeMin : false,
  }))
}

/** Takt Time = Tiempo disponible / Demanda. Ritmo necesario de producción. */
export function calculateTaktTime(scenario: Scenario): number {
  if (scenario.demandPerDay <= 0) return 0
  return (scenario.shiftHours * 60 * scenario.shiftsPerDay) / scenario.demandPerDay
}

export function findBottleneck(
  stations: Station[]
): { stationId: string; stationName: string; effectiveCycleMin: number } {
  if (stations.length === 0) {
    return { stationId: "", stationName: "", effectiveCycleMin: 0 }
  }

  let bottleneck = stations[0]
  let maxCycle = getEffectiveCycleTime(stations[0])

  for (let i = 1; i < stations.length; i++) {
    const cycle = getEffectiveCycleTime(stations[i])
    if (cycle > maxCycle) {
      maxCycle = cycle
      bottleneck = stations[i]
    }
  }

  return {
    stationId: bottleneck.id,
    stationName: bottleneck.name,
    effectiveCycleMin: maxCycle,
  }
}

export function calculateThroughput(scenario: Scenario): number {
  if (scenario.stations.length === 0) return 0

  const availableTimeMin = scenario.shiftHours * 60 * scenario.shiftsPerDay
  const { effectiveCycleMin } = findBottleneck(scenario.stations)

  if (effectiveCycleMin <= 0 || !isFinite(effectiveCycleMin)) return 0

  return Math.floor(availableTimeMin / effectiveCycleMin)
}

export function calculateLeadTime(stations: Station[]): number {
  return stations.reduce((sum, s) => sum + getEffectiveCycleTime(s), 0)
}

/** Eficiencia de balanceo. 1.0 = todas las estaciones tienen el mismo tiempo efectivo (línea perfectamente balanceada). */
export function calculateBalancingEfficiency(stations: Station[]): number {
  if (stations.length === 0) return 0

  const effectiveTimes = stations.map(getEffectiveCycleTime)
  const sum = effectiveTimes.reduce((a, b) => a + b, 0)
  const max = Math.max(...effectiveTimes)

  if (max <= 0 || !isFinite(max)) return 0

  return sum / (stations.length * max)
}

export function calculateAllKPIs(scenario: Scenario): KPIs {
  const taktTimeMin = calculateTaktTime(scenario)
  const { stationId, stationName, effectiveCycleMin } = findBottleneck(scenario.stations)
  const throughputPerDay = calculateThroughput(scenario)
  const leadTimeMin = calculateLeadTime(scenario.stations)
  const balancingEfficiency = calculateBalancingEfficiency(scenario.stations)
  const totalCycleMin = scenario.stations.reduce((sum, s) => sum + s.cycleTimeMin, 0)
  const availableTimeMin = scenario.shiftHours * 60 * scenario.shiftsPerDay
  const meetsDemand = throughputPerDay >= scenario.demandPerDay
  const demandDelta = throughputPerDay - scenario.demandPerDay

  return {
    taktTimeMin,
    bottleneckStationId: stationId,
    bottleneckStationName: stationName,
    bottleneckCycleMin: effectiveCycleMin,
    throughputPerDay,
    leadTimeMin,
    balancingEfficiency,
    totalCycleMin,
    availableTimeMin,
    meetsDemand,
    demandDelta,
  }
}

// ─── Plan de mejora ────────────────────────────────────────────────────────────

function simulateScenario(
  scenario: Scenario,
  stationChanges?: { stationId: string; updates: Partial<Omit<Station, "id">> }[],
  scenarioChanges?: Partial<Pick<Scenario, "shiftsPerDay">>
): { scenario: Scenario; kpis: KPIs } {
  const newStations = scenario.stations.map((s) => {
    const change = stationChanges?.find((c) => c.stationId === s.id)
    if (change) {
      return { ...s, ...change.updates }
    }
    return { ...s }
  })
  const newScenario: Scenario = {
    ...scenario,
    stations: newStations,
    ...scenarioChanges,
  }
  return { scenario: newScenario, kpis: calculateAllKPIs(newScenario) }
}

function buildRecommendation(
  id: string,
  title: string,
  description: string,
  type: ImprovementType,
  baseKpis: KPIs,
  projected: KPIs,
  stationId: string | undefined,
  stationName: string | undefined,
  stationChanges: { originalStationId: string; updates: Partial<Omit<Station, "id">> }[] | undefined,
  scenarioChanges: Partial<Pick<Scenario, "shiftsPerDay">> | undefined,
  badge?: string
): ImprovementRecommendation {
  const throughputDelta = projected.throughputPerDay - baseKpis.throughputPerDay
  const balancingDelta = (projected.balancingEfficiency - baseKpis.balancingEfficiency) * 100
  const leadTimeDelta = projected.leadTimeMin - baseKpis.leadTimeMin
  const meetsDemandAfter = projected.meetsDemand

  let priority: ImprovementPriority = "low"
  if ((!baseKpis.meetsDemand && meetsDemandAfter) || throughputDelta >= 10) {
    priority = "high"
  } else if (throughputDelta >= 3 || balancingDelta >= 5) {
    priority = "medium"
  }

  return {
    id,
    title,
    description,
    type,
    priority,
    baseKpis,
    projectedKpis: projected,
    throughputDelta,
    balancingDelta,
    leadTimeDelta,
    meetsDemandAfter,
    stationId,
    stationName,
    badge,
    applyLabel: "Crear escenario con esta mejora",
    stationChanges,
    scenarioChanges,
  }
}

export function generateRecommendations(
  scenario: Scenario,
  baseKpis: KPIs
): ImprovementRecommendation[] {
  if (scenario.stations.length === 0) return []

  const recommendations: ImprovementRecommendation[] = []

  const bottleneck = scenario.stations.find((s) => s.id === baseKpis.bottleneckStationId)

  // A) +1 operario al bottleneck
  if (bottleneck && bottleneck.operators < 8) {
    const { kpis: projected } = simulateScenario(scenario, [
      { stationId: bottleneck.id, updates: { operators: bottleneck.operators + 1 } },
    ])
    recommendations.push(
      buildRecommendation(
        "add-operator-bottleneck",
        `Añadir 1 operario a ${bottleneck.name}`,
        "Incrementar operarios en la estación que limita el throughput reduce su tiempo efectivo y aumenta la capacidad global de la línea.",
        "operators",
        baseKpis,
        projected,
        bottleneck.id,
        bottleneck.name,
        [{ originalStationId: bottleneck.id, updates: { operators: bottleneck.operators + 1 } }],
        undefined,
        !baseKpis.meetsDemand && projected.meetsDemand ? "Alto impacto" : "Implementación rápida"
      )
    )
  }

  // B) Reducir failure rate
  const problemStation = [...scenario.stations]
    .filter((s) => s.failureRate > 0.02)
    .sort((a, b) => b.failureRate - a.failureRate)[0]
  if (problemStation) {
    const { kpis: projected } = simulateScenario(scenario, [
      { stationId: problemStation.id, updates: { failureRate: 0.02 } },
    ])
    recommendations.push(
      buildRecommendation(
        "reduce-failure",
        `Reducir reproceso en ${problemStation.name}`,
        "Disminuir la tasa de fallo elimina tiempo de retrabajo, reduce el ciclo efectivo y mejora la capacidad real de la estación.",
        "failure-rate",
        baseKpis,
        projected,
        problemStation.id,
        problemStation.name,
        [{ originalStationId: problemStation.id, updates: { failureRate: 0.02 } }],
        undefined,
        "Calidad / reproceso"
      )
    )
  }

  // C) Optimizar método (cycleTime -10%)
  if (bottleneck) {
    const newCycle = Math.round(bottleneck.cycleTimeMin * 0.9 * 10) / 10
    if (newCycle < bottleneck.cycleTimeMin) {
      const { kpis: projected } = simulateScenario(scenario, [
        { stationId: bottleneck.id, updates: { cycleTimeMin: newCycle } },
      ])
      recommendations.push(
        buildRecommendation(
          "optimize-method",
          `Optimizar método en ${bottleneck.name}`,
          "Una mejora de método o estandarización del proceso puede reducir el tiempo de ciclo sin necesidad de añadir mano de obra.",
          "cycle-time",
          baseKpis,
          projected,
          bottleneck.id,
          bottleneck.name,
          [{ originalStationId: bottleneck.id, updates: { cycleTimeMin: newCycle } }],
          undefined,
          "Mejora de método"
        )
      )
    }
  }

  // D) Añadir turno
  if (scenario.shiftsPerDay < 3) {
    const { kpis: projected } = simulateScenario(scenario, undefined, {
      shiftsPerDay: scenario.shiftsPerDay + 1,
    })
    recommendations.push(
      buildRecommendation(
        "add-shift",
        `Aumentar a ${scenario.shiftsPerDay + 1} turnos por día`,
        "Extender el tiempo disponible diario aumenta el throughput total. Útil cuando la línea está cerca del objetivo pero no lo alcanza.",
        "shifts",
        baseKpis,
        projected,
        undefined,
        undefined,
        undefined,
        { shiftsPerDay: scenario.shiftsPerDay + 1 },
        "Implementación rápida"
      )
    )
  }

  // Sort by priority, then throughput delta
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return recommendations
    .sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (pDiff !== 0) return pDiff
      return b.throughputDelta - a.throughputDelta
    })
    .slice(0, 4)
}
