import { describe, it, expect } from "vitest"
import {
  createPresetFromSector,
  INDUSTRY_PRESETS_DATA,
  createMonobathPreset,
  createEmptyScenario,
  getPresetNames,
  IndustrySectorKey,
} from "./presets"

describe("Industrial Sector Presets Test Suite", () => {
  const sectors: IndustrySectorKey[] = [
    "monobath",
    "automotive",
    "electronics",
    "logistics",
    "ceramics",
    "food_pharma",
    "machinery",
  ]

  it("defines 7 complete industry sector presets", () => {
    expect(Object.keys(INDUSTRY_PRESETS_DATA)).toHaveLength(7)
  })

  it.each(sectors)("creates valid preset stations for sector '%s' in ES", (sector) => {
    const stations = createPresetFromSector(sector, "es")
    const data = INDUSTRY_PRESETS_DATA[sector]

    expect(stations).toHaveLength(data.stations.length)
    expect(data.demandPerDay).toBeGreaterThan(0)
    expect(data.shiftHours).toBeGreaterThanOrEqual(1)
    expect(data.shiftsPerDay).toBeGreaterThanOrEqual(1)

    stations.forEach((st, idx) => {
      expect(st.id).toBeDefined()
      expect(st.name).toBe(data.stations[idx].nameEs)
      expect(st.cycleTimeMin).toBeGreaterThan(0)
      expect(st.operators).toBeGreaterThanOrEqual(1)
      expect(st.failureRate).toBeGreaterThanOrEqual(0)
      expect(["manual", "machine"]).toContain(st.processType ?? "manual")
    })
  })

  it.each(sectors)("creates valid preset stations for sector '%s' in EN", (sector) => {
    const stations = createPresetFromSector(sector, "en")
    const data = INDUSTRY_PRESETS_DATA[sector]

    expect(stations).toHaveLength(data.stations.length)

    stations.forEach((st, idx) => {
      expect(st.id).toBeDefined()
      expect(st.name).toBe(data.stations[idx].nameEn)
      expect(st.cycleTimeMin).toBeGreaterThan(0)
      expect(st.operators).toBeGreaterThanOrEqual(1)
      expect(st.failureRate).toBeGreaterThanOrEqual(0)
      expect(["manual", "machine"]).toContain(st.processType ?? "manual")
    })
  })

  it("creates Monobath preset with localized names", () => {
    const esNames = getPresetNames("es")
    const scenarioEs = createMonobathPreset(esNames)
    expect(scenarioEs.name).toBe(esNames.scenarioName)
    expect(scenarioEs.stations[0].name).toBe(esNames.stationNames[0])

    const enNames = getPresetNames("en")
    const scenarioEn = createMonobathPreset(enNames)
    expect(scenarioEn.name).toBe(enNames.scenarioName)
    expect(scenarioEn.stations[0].name).toBe(enNames.stationNames[0])
  })

  it("creates an empty scenario with given name", () => {
    const empty = createEmptyScenario("Escenario de prueba")
    expect(empty.name).toBe("Escenario de prueba")
    expect(empty.stations).toHaveLength(0)
    expect(empty.demandPerDay).toBe(8)
  })
})
