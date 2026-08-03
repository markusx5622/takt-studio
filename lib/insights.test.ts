import { describe, it, expect } from "vitest"
import { generateInsights } from "./insights"
import { calculateAllKPIs } from "./calculations"
import type { Scenario, Station } from "@/types"

let _id = 0
function makeStation(
  cycleTimeMin: number,
  operators: number,
  failureRate = 0,
  name = "Station"
): Station {
  return { id: `s${++_id}`, name, cycleTimeMin, operators, failureRate }
}

function makeScenario(stations: Station[], demandPerDay: number): Scenario {
  return {
    id: "sc1",
    name: "Test",
    stations,
    demandPerDay,
    shiftHours: 8,
    shiftsPerDay: 1,
    economics: {
      laborCostPerHour: 22,
      contributionMarginPerUnit: 650,
      reworkCostPerUnit: 120,
      shiftFixedCostPerDay: 300,
      methodImprovementOneOffCost: 2500,
      qualityImprovementOneOffCost: 1800,
      workingDaysPerMonth: 22,
    },
  }
}

function insightsFor(scenario: Scenario) {
  return generateInsights(scenario, calculateAllKPIs(scenario))
}

function keysOf(scenario: Scenario) {
  return insightsFor(scenario).map((i) => i.key)
}

describe("generateInsights", () => {
  it("sin estaciones no genera insights", () => {
    expect(insightsFor(makeScenario([], 10))).toEqual([])
  })

  it("demanda cumplida → insight success 'demandMet' con throughput y demanda", () => {
    // Takt = 480/10 = 48 min; estación efectiva 40 → cumple
    const scenario = makeScenario([makeStation(40, 1)], 10)
    const insights = insightsFor(scenario)
    const met = insights.find((i) => i.key === "demandMet")
    expect(met?.type).toBe("success")
    expect(met?.values?.demand).toBe(10)
    expect(met?.values?.throughput).toBe(12)
  })

  it("demanda no cumplida → critical 'demandNotMet' con déficit y cuello de botella", () => {
    // Takt = 480/20 = 24 min; estación 40 → no cumple
    const scenario = makeScenario([makeStation(40, 1, 0, "Lenta")], 20)
    const insights = insightsFor(scenario)
    const notMet = insights.find((i) => i.key === "demandNotMet")
    expect(notMet?.type).toBe("critical")
    expect(notMet?.values?.station).toBe("Lenta")
    expect(notMet?.values?.deficit).toBe(8)
    expect(notMet?.values?.takt).toBe("24.0")
    expect(notMet?.values?.cycle).toBe("40.0")
  })

  it("cuello de botella dominante (>20% sobre el segundo) → warning 'dominantBottleneck'", () => {
    const scenario = makeScenario(
      [makeStation(100, 1, 0, "Muy lenta"), makeStation(40, 1, 0, "Rápida")],
      5
    )
    const dom = insightsFor(scenario).find((i) => i.key === "dominantBottleneck")
    expect(dom?.type).toBe("warning")
    expect(dom?.values?.name).toBe("Muy lenta")
    expect(dom?.values?.reduced).toBe("50.0") // 100/(1+1) operarios
  })

  it("sin dominancia (>20%) no aparece 'dominantBottleneck'", () => {
    const scenario = makeScenario(
      [makeStation(45, 1), makeStation(40, 1)],
      5
    )
    expect(keysOf(scenario)).not.toContain("dominantBottleneck")
  })

  it("eficiencia de balanceo <70% → warning 'unbalanced' con extremos", () => {
    const scenario = makeScenario(
      [makeStation(90, 1, 0, "Lenta"), makeStation(10, 1, 0, "Rápida")],
      5
    )
    const unb = insightsFor(scenario).find((i) => i.key === "unbalanced")
    expect(unb?.type).toBe("warning")
    expect(unb?.values?.fastName).toBe("Rápida")
    expect(unb?.values?.slowName).toBe("Lenta")
  })

  it("eficiencia ≥85% → success 'wellBalanced'", () => {
    const scenario = makeScenario(
      [makeStation(40, 1), makeStation(39, 1), makeStation(40, 1)],
      5
    )
    const wb = insightsFor(scenario).find((i) => i.key === "wellBalanced")
    expect(wb?.type).toBe("success")
  })

  it("fallo >5% → warning 'highFailure' con tasa y ahorro", () => {
    const scenario = makeScenario([makeStation(40, 1, 0.1, "Frágil")], 5)
    const hf = insightsFor(scenario).find((i) => i.key === "highFailure")
    expect(hf?.type).toBe("warning")
    expect(hf?.values?.name).toBe("Frágil")
    expect(hf?.values?.rate).toBe("10")
    expect(hf?.values?.savings).toBe("3.2") // 40 * (0.10-0.02)
  })

  it("fallo ≤5% no genera 'highFailure'", () => {
    const scenario = makeScenario([makeStation(40, 1, 0.05)], 5)
    expect(keysOf(scenario)).not.toContain("highFailure")
  })

  it("con ≥2 estaciones añade info 'theoreticalMax' basado en la segunda más lenta", () => {
    const scenario = makeScenario(
      [makeStation(100, 1), makeStation(50, 1, 0, "Segunda")],
      5
    )
    const tm = insightsFor(scenario).find((i) => i.key === "theoreticalMax")
    expect(tm?.type).toBe("info")
    expect(tm?.values?.capacity).toBe(9) // floor(480/50)
    expect(tm?.values?.name).toBe("Segunda")
  })

  it("con 1 estación no hay 'theoreticalMax'", () => {
    const scenario = makeScenario([makeStation(40, 1)], 5)
    expect(keysOf(scenario)).not.toContain("theoreticalMax")
  })
})
