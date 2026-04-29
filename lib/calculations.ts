import { type Station, type Scenario, type KPIs, type StationWithEffective } from "@/types"

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
