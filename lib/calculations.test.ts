import { describe, it, expect } from "vitest"
import {
  calculateTaktTime,
  findBottleneck,
  getEffectiveCycleTime,
  calculateBalancingEfficiency,
  calculateThroughput,
  calculateAllKPIs,
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

function makeScenario(
  stations: Station[],
  demandPerDay: number,
  shiftHours: number,
  shiftsPerDay: number
): Scenario {
  return { id: `sc${++_id}`, name: "Test", stations, demandPerDay, shiftHours, shiftsPerDay }
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

  it("failureRate incrementa el tiempo efectivo", () => {
    // (60 / 2) * (1 + 0.1) = 30 * 1.1 = 33
    const station = makeStation(60, 2, 0.1)
    expect(getEffectiveCycleTime(station)).toBeCloseTo(33, 2)
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
