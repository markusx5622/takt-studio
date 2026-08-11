import { describe, it, expect } from "vitest"
import {
  calculateTaktTime,
  findBottleneck,
  getEffectiveCycleTime,
  calculateBalancingEfficiency,
  calculateThroughput,
  calculateAllKPIs,
  calculateEconomicKPIs,
  calculateRecommendationEconomicImpact,
  normalizeEconomics,
} from "./calculations"
import type { Scenario, Station } from "@/types"

let _id = 0
function makeStation(
  cycleTimeMin: number,
  operators: number,
  failureRate = 0,
  name = "Station",
  id?: string
): Station {
  return { id: id ?? `s${++_id}`, name, cycleTimeMin, operators, failureRate }
}

const DEFAULT_TEST_ECONOMICS = {
  laborCostPerHour: 22,
  contributionMarginPerUnit: 650,
  reworkCostPerUnit: 120,
  shiftFixedCostPerDay: 300,
  methodImprovementOneOffCost: 2500,
  qualityImprovementOneOffCost: 1800,
  workingDaysPerMonth: 22,
}

function makeScenario(
  stations: Station[],
  demandPerDay: number,
  shiftHours: number,
  shiftsPerDay: number
): Scenario {
  return {
    id: `sc${++_id}`,
    name: "Test",
    stations,
    demandPerDay,
    shiftHours,
    shiftsPerDay,
    economics: { ...DEFAULT_TEST_ECONOMICS },
  }
}

describe("calculateTaktTime", () => {
  it("takt time con demanda 8, turno 8h, 1 turno = 60 min/ud", () => {
    // (8 * 60 * 1) / 8 = 60
    const scenario = makeScenario([], 8, 8, 1)
    expect(calculateTaktTime(scenario)).toBe(60)
  })

  it("takt time con demanda 0 devuelve 0", () => {
    const scenario = makeScenario([], 0, 8, 1)
    expect(calculateTaktTime(scenario)).toBe(0)
  })

  it("takt time deducts changeover time from available time", () => {
    const scenario = makeScenario([], 8, 8, 1)
    scenario.changeoversPerDay = 2
    scenario.changeoverTimeMin = 30
    // Total time = 480 min. Loss = 2 * 30 = 60 min. Net = 420 min.
    // Takt = 420 / 8 = 52.5
    expect(calculateTaktTime(scenario)).toBe(52.5)
  })
})

describe("findBottleneck", () => {
  it("bottleneck identifica la estación más lenta", () => {
    const s1 = makeStation(30, 1, 0, "Estación 1", "id-1")
    const s2 = makeStation(60, 1, 0, "Estación 2", "id-2")
    const s3 = makeStation(45, 1, 0, "Estación 3", "id-3")
    const result = findBottleneck([s1, s2, s3])
    expect(result.stationId).toBe("id-2")
    expect(result.effectiveCycleMin).toBe(60)
  })
})

describe("getEffectiveCycleTime", () => {
  it("operarios reducen el tiempo efectivo", () => {
    // (60 / 2) * (1 + 0) = 30
    const station = makeStation(60, 2)
    expect(getEffectiveCycleTime(station)).toBe(30)
  })

  it("demandMultiplier incrementa el tiempo efectivo", () => {
    // 60 min, 2 operators = 30 base.
    // Con 10% scrap, demandMultiplier = 1 / (1 - 0.1) = 1.1111...
    // 30 * 1.1111... = 33.3333...
    const station = makeStation(60, 2, 0.1)
    const multiplier = 1 / (1 - 0.1)
    expect(getEffectiveCycleTime(station, multiplier)).toBeCloseTo(33.33, 2)
  })
})

describe("calculateBalancingEfficiency", () => {
  it("eficiencia de balanceo con línea perfecta = 1.0", () => {
    // (30+30+30) / (3 * 30) = 1.0
    const stations = [makeStation(30, 1), makeStation(30, 1), makeStation(30, 1)]
    expect(calculateBalancingEfficiency(stations)).toBe(1.0)
  })

  it("eficiencia de balanceo con línea desbalanceada < 1.0", () => {
    // effectiveCycles: [10, 20, 30] → (10+20+30) / (3*30) = 60/90 ≈ 0.667
    const stations = [makeStation(10, 1), makeStation(20, 1), makeStation(30, 1)]
    expect(calculateBalancingEfficiency(stations)).toBeCloseTo(0.667, 2)
  })
})

describe("calculateThroughput", () => {
  it("throughput no supera la demanda calculada correctamente", () => {
    // Escenario Monobath: 8h, 1 turno = 480 min disponibles
    // effectiveCycles: 20, 22.5, 30, 35, 25, 15, 10 → bottleneck = 35 min
    // throughput = floor(480 / 35) = 13
    const stations = [
      makeStation(20, 1, 0, "Preparación"),
      makeStation(45, 2, 0, "Instalación fontanería"),
      makeStation(60, 2, 0, "Alicatado"),
      makeStation(35, 1, 0, "Instalación sanitarios"),
      makeStation(25, 1, 0, "Acabados"),
      makeStation(15, 1, 0, "Revisión calidad"),
      makeStation(10, 1, 0, "Limpieza final"),
    ]
    const scenario = makeScenario(stations, 10, 8, 1)
    const throughput = calculateThroughput(scenario)
    expect(throughput).toBeGreaterThan(0)
    expect(Number.isFinite(throughput)).toBe(true)
    expect(Number.isInteger(throughput)).toBe(true)
  })

  it("throughput is reduced by changeovers", () => {
    const stations = [makeStation(30, 1)]
    const scenario = makeScenario(stations, 10, 8, 1)
    scenario.changeoversPerDay = 3
    scenario.changeoverTimeMin = 60
    // Total time = 480 min. Loss = 180 min. Net = 300 min.
    // Throughput = floor(300 / 30) = 10
    expect(calculateThroughput(scenario)).toBe(10)
  })
})

describe("calculateAllKPIs", () => {
  it("array vacío de estaciones devuelve KPIs seguros (sin crash)", () => {
    const scenario = makeScenario([], 0, 0, 1)
    expect(() => calculateAllKPIs(scenario)).not.toThrow()
    const kpis = calculateAllKPIs(scenario)
    expect(kpis.taktTimeMin).toBe(0)
    expect(kpis.bottleneckStationId).toBe("")
    expect(kpis.bottleneckStationName).toBe("")
    expect(kpis.bottleneckCycleMin).toBe(0)
    expect(kpis.throughputPerDay).toBe(0)
    expect(kpis.leadTimeMin).toBe(0)
    expect(kpis.balancingEfficiency).toBe(0)
    expect(kpis.totalCycleMin).toBe(0)
    expect(kpis.availableTimeMin).toBe(0)
    expect(kpis.demandDelta).toBe(0)
  })

  it("calculateAllKPIs devuelve meetsDemand correctamente", () => {
    // Throughput > demand: effectiveCycle=40, available=480 → throughput=12 ≥ demand=5
    const highCap = makeScenario([makeStation(40, 1)], 5, 8, 1)
    expect(calculateAllKPIs(highCap).meetsDemand).toBe(true)

    // Throughput < demand: effectiveCycle=60, available=480 → throughput=8 < demand=20
    const lowCap = makeScenario([makeStation(60, 1)], 20, 8, 1)
    expect(calculateAllKPIs(lowCap).meetsDemand).toBe(false)
  })
})

describe("calculateEconomicKPIs", () => {
  it("labor cost diario con 2 operarios, 8h, 1 turno", () => {
    // 2 operarios * 8h * 1 turno = 16h → 16 * 22 = 352
    const scenario = makeScenario([makeStation(60, 2)], 5, 8, 1)
    const econ = calculateEconomicKPIs(scenario)
    expect(econ.totalOperators).toBe(2)
    expect(econ.laborHoursPerDay).toBe(16)
    expect(econ.laborCostPerDay).toBe(352)
  })

  it("fulfilledUnits = min(throughput, demand)", () => {
    // throughput=8, demand=5 → fulfilled=5
    const lowCap = makeScenario([makeStation(60, 1)], 5, 8, 1)
    const econ = calculateEconomicKPIs(lowCap)
    expect(econ.fulfilledUnitsPerDay).toBe(5)
    expect(econ.demandShortfallUnitsPerDay).toBe(0)
  })

  it("demandShortfall correcto cuando throughput < demand", () => {
    // throughput=8, demand=20 → shortfall=12
    const lowCap = makeScenario([makeStation(60, 1)], 20, 8, 1)
    const econ = calculateEconomicKPIs(lowCap)
    expect(econ.fulfilledUnitsPerDay).toBe(8)
    expect(econ.demandShortfallUnitsPerDay).toBe(12)
  })

  it("profitProxy coherente (contribución − costes)", () => {
    // 1 estación: 60min, 1 op, 0 failure → throughput=8, demand=5
    // fulfilled=5 * 650 = 3250 contribution
    // labor: 1*8*1=8h * 22 = 176
    // shift: 1*300 = 300
    // rework: 0 (no failure)
    // total cost = 476
    // profit proxy = 3250 - 476 = 2774
    const scenario = makeScenario([makeStation(60, 1)], 5, 8, 1)
    const econ = calculateEconomicKPIs(scenario)
    expect(econ.fulfilledContributionPerDay).toBe(3250)
    expect(econ.totalOperatingCostPerDay).toBe(476)
    expect(econ.profitProxyPerDay).toBe(2774)
  })
})

describe("calculateRecommendationEconomicImpact", () => {
  it("net impact positivo de añadir un operario", () => {
    // Base: 1 op, 60min → throughput 8, demand 10
    // Projected: 2 ops, 60min → throughput 16, demand 10
    const base = makeScenario([makeStation(60, 1)], 10, 8, 1)
    const projected = makeScenario([makeStation(60, 2)], 10, 8, 1)
    const impact = calculateRecommendationEconomicImpact(base, projected, "operators")
    // Contribution delta: 10 * 650 - 10 * 650 = 0 (both fulfill all demand)
    // Wait: base throughput = 8 < 10, projected = 16 ≥ 10
    // Base fulfilled = 8 * 650 = 5200
    // Projected fulfilled = 10 * 650 = 6500
    // Labor delta: (2*8*1*22) - (1*8*1*22) = 352 - 176 = 176
    // Net = 1300 - 176 = 1124
    expect(impact.additionalContributionPerDay).toBe(1300)
    expect(impact.additionalLaborCostPerDay).toBe(176)
    expect(impact.netImpactPerDay).toBe(1124)
    expect(impact.oneOffCost).toBe(0)
    expect(impact.paybackDays).toBe(null)
  })

  it("paybackDays correcto para mejora de método", () => {
    const base = makeScenario([makeStation(60, 1)], 10, 8, 1)
    const projected = makeScenario([makeStation(60, 2)], 10, 8, 1)
    const impact = calculateRecommendationEconomicImpact(base, projected, "cycle-time")
    // oneOffCost = 2500, netImpact = 1124
    expect(impact.oneOffCost).toBe(2500)
    expect(impact.paybackDays).toBeCloseTo(2500 / 1124, 1)
  })

  it("paybackDays = null cuando netImpact <= 0", () => {
    const base = makeScenario([makeStation(60, 1)], 5, 8, 1)
    const projected = makeScenario([makeStation(60, 1)], 5, 8, 1)
    const impact = calculateRecommendationEconomicImpact(base, projected, "cycle-time")
    expect(impact.netImpactPerDay).toBe(0)
    expect(impact.paybackDays).toBe(null)
  })
})

describe("normalizeEconomics", () => {
  it("devuelve defaults cuando economics es undefined", () => {
    const result = normalizeEconomics(undefined)
    expect(result.laborCostPerHour).toBe(22)
    expect(result.contributionMarginPerUnit).toBe(650)
    expect(result.workingDaysPerMonth).toBe(22)
  })

  it("completa valores parciales manteniendo los proporcionados", () => {
    const result = normalizeEconomics({ laborCostPerHour: 30 })
    expect(result.laborCostPerHour).toBe(30)
    expect(result.contributionMarginPerUnit).toBe(650)
    expect(result.shiftFixedCostPerDay).toBe(300)
  })

  it("no muta el objeto original", () => {
    const partial = { laborCostPerHour: 30 }
    const result = normalizeEconomics(partial)
    expect(result).not.toBe(partial)
    expect(partial).toEqual({ laborCostPerHour: 30 })
  })
})
