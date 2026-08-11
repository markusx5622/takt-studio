import { type Station, type Scenario, type KPIs, type StationWithEffective, type ImprovementRecommendation, type ImprovementType, type ImprovementPriority, type EconomicInputs, type EconomicKPIs, type RecommendationEconomicImpact } from "@/types"
import { DEFAULT_ECONOMICS } from "@/lib/presets"

/** Calcula el multiplicador de demanda acumulada de atrás hacia adelante en la línea */
export function getYieldMultipliers(stations: Station[]): number[] {
  const multipliers: number[] = new Array(stations.length).fill(1)
  let cumulativeYield = 1
  for (let i = stations.length - 1; i >= 0; i--) {
    const s = stations[i]
    // station.failureRate acts as scrap rate. Max 99% to avoid division by zero.
    const stationYield = 1 - Math.min(s.failureRate, 0.99)
    cumulativeYield *= stationYield
    multipliers[i] = 1 / cumulativeYield
  }
  return multipliers
}

/** Tiempo de ciclo efectivo considerando operarios y multiplicador de demanda (propagación de scrap) */
export function getEffectiveCycleTime(station: Station, demandMultiplier: number = 1): number {
  if (station.operators <= 0) return Infinity
  const units = station.unitsPerCycle ?? 1
  return ((station.cycleTimeMin / units) / station.operators) * demandMultiplier
}

export function getStationsWithEffective(
  stations: Station[],
  taktTimeMin: number
): StationWithEffective[] {
  if (stations.length === 0) return []

  const multipliers = getYieldMultipliers(stations)

  const withEffective = stations.map((s, index) => ({
    ...s,
    demandMultiplier: multipliers[index],
    effectiveCycleMin: getEffectiveCycleTime(s, multipliers[index]),
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

/** Calcula el tiempo disponible neto tras restar el % de asignación y los tiempos de cambio de serie */
export function getNetAvailableTimeMin(scenario: Scenario): number {
  const allocation = scenario.allocationPercent ?? 100
  const availableTimeFull = scenario.shiftHours * 60 * scenario.shiftsPerDay * (allocation / 100)
  
  const changeoversPerDay = scenario.changeoversPerDay ?? 0
  const changeoverTimeMin = scenario.changeoverTimeMin ?? 0
  const changeoverLoss = changeoversPerDay * changeoverTimeMin

  return Math.max(0, availableTimeFull - changeoverLoss)
}

/** Takt Time = Tiempo disponible / Demanda. Ritmo necesario de producción. */
export function calculateTaktTime(scenario: Scenario): number {
  if (scenario.demandPerDay <= 0) return 0
  const availableTimeMin = getNetAvailableTimeMin(scenario)
  return availableTimeMin / scenario.demandPerDay
}

export function findBottleneck(
  stations: Station[]
): { stationId: string; stationName: string; effectiveCycleMin: number } {
  if (stations.length === 0) {
    return { stationId: "", stationName: "", effectiveCycleMin: 0 }
  }

  const multipliers = getYieldMultipliers(stations)
  let bottleneck = stations[0]
  let maxCycle = getEffectiveCycleTime(stations[0], multipliers[0])

  for (let i = 1; i < stations.length; i++) {
    const cycle = getEffectiveCycleTime(stations[i], multipliers[i])
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

  const availableTimeMin = getNetAvailableTimeMin(scenario)
  const { effectiveCycleMin } = findBottleneck(scenario.stations)

  if (effectiveCycleMin <= 0 || !isFinite(effectiveCycleMin)) return 0

  return Math.floor(availableTimeMin / effectiveCycleMin)
}

export function calculateLeadTime(stations: Station[]): number {
  const multipliers = getYieldMultipliers(stations)
  return stations.reduce((sum, s, index) => sum + getEffectiveCycleTime(s, multipliers[index]), 0)
}

/** Eficiencia de balanceo. 1.0 = todas las estaciones tienen el mismo tiempo efectivo (línea perfectamente balanceada). */
export function calculateBalancingEfficiency(stations: Station[]): number {
  if (stations.length === 0) return 0

  const multipliers = getYieldMultipliers(stations)
  const effectiveTimes = stations.map((s, index) => getEffectiveCycleTime(s, multipliers[index]))
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
  const availableTimeMin = getNetAvailableTimeMin(scenario)
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

export function simulateScenario(
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
  titleKey: string,
  titleValues: Record<string, string | number> | undefined,
  descriptionKey: string,
  type: ImprovementType,
  baseKpis: KPIs,
  projected: KPIs,
  stationId: string | undefined,
  stationName: string | undefined,
  stationChanges: { originalStationId: string; updates: Partial<Omit<Station, "id">> }[] | undefined,
  scenarioChanges: Partial<Pick<Scenario, "shiftsPerDay">> | undefined,
  badgeKey?: string
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
    titleKey,
    titleValues,
    descriptionKey,
    badgeKey,
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
        "addOperator",
        { name: bottleneck.name },
        "addOperator",
        "operators",
        baseKpis,
        projected,
        bottleneck.id,
        bottleneck.name,
        [{ originalStationId: bottleneck.id, updates: { operators: bottleneck.operators + 1 } }],
        undefined,
        !baseKpis.meetsDemand && projected.meetsDemand ? "highImpact" : "quickWin"
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
        "reduceRework",
        { name: problemStation.name },
        "reduceRework",
        "failure-rate",
        baseKpis,
        projected,
        problemStation.id,
        problemStation.name,
        [{ originalStationId: problemStation.id, updates: { failureRate: 0.02 } }],
        undefined,
        "qualityRework"
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
          "optimizeMethod",
          { name: bottleneck.name },
          "optimizeMethod",
          "cycle-time",
          baseKpis,
          projected,
          bottleneck.id,
          bottleneck.name,
          [{ originalStationId: bottleneck.id, updates: { cycleTimeMin: newCycle } }],
          undefined,
          "methodImprovement"
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
        "addShift",
        { count: scenario.shiftsPerDay + 1 },
        "addShift",
        "shifts",
        baseKpis,
        projected,
        undefined,
        undefined,
        undefined,
        { shiftsPerDay: scenario.shiftsPerDay + 1 },
        "quickWin"
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

// ─── Economic calculations ─────────────────────────────────────────────────────

/** Normaliza un objeto economics parcial o undefined a un EconomicInputs completo. */
export function normalizeEconomics(
  economics?: Partial<EconomicInputs> | null
): EconomicInputs {
  return {
    ...DEFAULT_ECONOMICS,
    ...(economics ?? {}),
  }
}

function getEconomics(scenario: Scenario): EconomicInputs {
  return normalizeEconomics(scenario.economics)
}

/**
 * Calcula KPIs económicos estimados a partir de un escenario.
 *
 * Fórmulas:
 * - totalOperators = sum(operators)
 * - laborHoursPerDay = totalOperators * shiftHours * shiftsPerDay
 * - laborCostPerDay = laborHoursPerDay * laborCostPerHour
 * - expectedReworkRate = weighted avg of failureRate by cycleTimeMin / totalCycleMin
 * - fulfilledUnitsPerDay = min(throughputPerDay, demandPerDay)
 * - demandShortfallUnitsPerDay = max(demandPerDay - throughputPerDay, 0)
 * - reworkCostPerDay = fulfilledUnitsPerDay * expectedReworkRate * reworkCostPerUnit
 * - fulfilledContributionPerDay = fulfilledUnitsPerDay * contributionMarginPerUnit
 * - opportunityGapValuePerDay = demandShortfallUnitsPerDay * contributionMarginPerUnit
 * - shiftCostPerDay = shiftsPerDay * shiftFixedCostPerDay
 * - totalOperatingCostPerDay = laborCostPerDay + shiftCostPerDay + reworkCostPerDay
 * - profitProxyPerDay = fulfilledContributionPerDay - totalOperatingCostPerDay
 */
export function calculateEconomicKPIs(scenario: Scenario, baseKpis?: KPIs): EconomicKPIs {
  const kpis = baseKpis ?? calculateAllKPIs(scenario)
  const economics = getEconomics(scenario)

  const totalOperators = scenario.stations.reduce((sum, s) => sum + s.operators, 0)
  const laborHoursPerDay = totalOperators * scenario.shiftHours * scenario.shiftsPerDay
  const laborCostPerDay = laborHoursPerDay * economics.laborCostPerHour

  const totalCycleMin = scenario.stations.reduce((sum, s) => sum + s.cycleTimeMin, 0)
  const expectedReworkRate =
    totalCycleMin > 0
      ? scenario.stations.reduce((sum, s) => sum + s.cycleTimeMin * s.failureRate, 0) /
        totalCycleMin
      : 0

  const fulfilledUnitsPerDay = Math.min(kpis.throughputPerDay, scenario.demandPerDay)
  const demandShortfallUnitsPerDay = Math.max(scenario.demandPerDay - kpis.throughputPerDay, 0)

  const reworkCostPerDay = fulfilledUnitsPerDay * expectedReworkRate * economics.reworkCostPerUnit
  const fulfilledContributionPerDay = fulfilledUnitsPerDay * economics.contributionMarginPerUnit
  const opportunityGapValuePerDay = demandShortfallUnitsPerDay * economics.contributionMarginPerUnit
  const shiftCostPerDay = scenario.shiftsPerDay * economics.shiftFixedCostPerDay
  const totalOperatingCostPerDay = laborCostPerDay + shiftCostPerDay + reworkCostPerDay
  const profitProxyPerDay = fulfilledContributionPerDay - totalOperatingCostPerDay

  return {
    totalOperators,
    laborHoursPerDay,
    laborCostPerDay,
    expectedReworkRate,
    reworkCostPerDay,
    fulfilledUnitsPerDay,
    demandShortfallUnitsPerDay,
    fulfilledContributionPerDay,
    opportunityGapValuePerDay,
    shiftCostPerDay,
    totalOperatingCostPerDay,
    profitProxyPerDay,
  }
}

/**
 * Calcula el impacto económico estimado de una recomendación comparando
 * el escenario base con el escenario proyectado.
 */
export function calculateRecommendationEconomicImpact(
  baseScenario: Scenario,
  projectedScenario: Scenario,
  recommendationType?: ImprovementType
): RecommendationEconomicImpact {
  const baseEcon = calculateEconomicKPIs(baseScenario)
  const projEcon = calculateEconomicKPIs(projectedScenario)

  const additionalContributionPerDay =
    projEcon.fulfilledContributionPerDay - baseEcon.fulfilledContributionPerDay
  const additionalLaborCostPerDay = projEcon.laborCostPerDay - baseEcon.laborCostPerDay
  const additionalShiftCostPerDay = projEcon.shiftCostPerDay - baseEcon.shiftCostPerDay
  const additionalReworkCostPerDay = projEcon.reworkCostPerDay - baseEcon.reworkCostPerDay

  const netImpactPerDay =
    additionalContributionPerDay -
    additionalLaborCostPerDay -
    additionalShiftCostPerDay -
    additionalReworkCostPerDay

  const economics = getEconomics(baseScenario)
  let oneOffCost = 0
  if (recommendationType === "cycle-time") {
    oneOffCost = economics.methodImprovementOneOffCost
  } else if (recommendationType === "failure-rate") {
    oneOffCost = economics.qualityImprovementOneOffCost
  }

  const paybackDays =
    oneOffCost > 0 && netImpactPerDay > 0 ? oneOffCost / netImpactPerDay : null

  return {
    additionalContributionPerDay,
    additionalLaborCostPerDay,
    additionalShiftCostPerDay,
    additionalReworkCostPerDay,
    netImpactPerDay,
    oneOffCost,
    paybackDays,
  }
}
