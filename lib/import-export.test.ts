import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  validateExportPayload,
  regenerateScenarioIds,
  buildScenarioExportPayload,
  buildSnapshotExportPayload,
  generateExportFileName,
} from "./import-export"
import type { Scenario, ScenarioSnapshot } from "@/types"

// Mock crypto.randomUUID for deterministic tests
const mockUUIDs = [
  "uuid-scenario-1",
  "uuid-station-1",
  "uuid-station-2",
  "uuid-scenario-2",
  "uuid-station-3",
  "uuid-station-4",
  "uuid-snapshot-1",
  "uuid-snapshot-scenario",
]
let uuidIndex = 0

vi.stubGlobal("crypto", {
  randomUUID: () => {
    const id = mockUUIDs[uuidIndex % mockUUIDs.length]
    uuidIndex++
    return id
  },
})

beforeEach(() => {
  uuidIndex = 0
})

function makeValidScenario(): Scenario {
  return {
    id: "original-scenario-id",
    name: "Línea Monobath",
    stations: [
      { id: "original-station-1", name: "Estructura", cycleTimeMin: 45, operators: 2, failureRate: 0.02 },
      { id: "original-station-2", name: "Fontanería", cycleTimeMin: 55, operators: 2, failureRate: 0.05 },
    ],
    demandPerDay: 8,
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

function makeValidSnapshot(): ScenarioSnapshot {
  return {
    id: "original-snapshot-id",
    scenarioId: "original-scenario-id",
    name: "Baseline inicial",
    createdAt: "2026-04-30T10:00:00.000Z",
    isBaseline: true,
    scenarioData: makeValidScenario(),
    note: "Nota de prueba",
  }
}

// ─── validateExportPayload ─────────────────────────────────────────────────────

describe("validateExportPayload", () => {
  it("accepts a valid scenario payload", () => {
    const payload = buildScenarioExportPayload(makeValidScenario())
    const result = validateExportPayload(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.payload.exportType).toBe("scenario")
      if (result.payload.exportType === "scenario") {
        expect(result.payload.scenario.name).toBe("Línea Monobath")
        expect(result.payload.scenario.stations).toHaveLength(2)
      }
    }
  })

  it("accepts a valid snapshot payload", () => {
    const payload = buildSnapshotExportPayload(makeValidSnapshot())
    const result = validateExportPayload(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.payload.exportType).toBe("snapshot")
      if (result.payload.exportType === "snapshot") {
        expect(result.payload.snapshot.name).toBe("Baseline inicial")
        expect(result.payload.snapshot.scenarioData.stations).toHaveLength(2)
      }
    }
  })

  it("rejects non-object input", () => {
    const result = validateExportPayload("not an object")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("notJsonObject")
    }
  })

  it("rejects missing exportType", () => {
    const result = validateExportPayload({ scenario: makeValidScenario() })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("unknownExportType")
    }
  })

  it("rejects scenario without stations array", () => {
    const result = validateExportPayload({
      exportType: "scenario",
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      scenario: { name: "Test", demandPerDay: 8, shiftHours: 8, shiftsPerDay: 1 },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("scenarioNoStationsArray")
    }
  })

  it("rejects station without name", () => {
    const result = validateExportPayload({
      exportType: "scenario",
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      scenario: {
        name: "Test",
        stations: [{ cycleTimeMin: 10, operators: 1 }],
        demandPerDay: 8,
        shiftHours: 8,
        shiftsPerDay: 1,
      },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("stationInvalidName")
    }
  })

  it("rejects station with invalid cycleTimeMin", () => {
    const result = validateExportPayload({
      exportType: "scenario",
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      scenario: {
        name: "Test",
        stations: [{ name: "Estación A", cycleTimeMin: -5, operators: 1 }],
        demandPerDay: 8,
        shiftHours: 8,
        shiftsPerDay: 1,
      },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("stationInvalidCycle")
      expect(result.error.values?.name).toBe("Estación A")
    }
  })

  it("rejects station with invalid operators", () => {
    const result = validateExportPayload({
      exportType: "scenario",
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      scenario: {
        name: "Test",
        stations: [{ name: "Estación A", cycleTimeMin: 10, operators: 0 }],
        demandPerDay: 8,
        shiftHours: 8,
        shiftsPerDay: 1,
      },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("stationInvalidOperators")
      expect(result.error.values?.name).toBe("Estación A")
    }
  })

  it("normalizes missing economics with defaults", () => {
    const scenario = makeValidScenario()
    delete (scenario as Record<string, unknown>).economics

    const result = validateExportPayload({
      exportType: "scenario",
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      scenario,
    })

    expect(result.success).toBe(true)
    if (result.success && result.payload.exportType === "scenario") {
      expect(result.payload.scenario.economics.laborCostPerHour).toBe(22)
      expect(result.payload.scenario.economics.contributionMarginPerUnit).toBe(650)
    }
  })

  it("normalizes partial economics", () => {
    const scenario = makeValidScenario()
    scenario.economics = { laborCostPerHour: 30 } as typeof scenario.economics

    const result = validateExportPayload({
      exportType: "scenario",
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      scenario,
    })

    expect(result.success).toBe(true)
    if (result.success && result.payload.exportType === "scenario") {
      expect(result.payload.scenario.economics.laborCostPerHour).toBe(30)
      expect(result.payload.scenario.economics.contributionMarginPerUnit).toBe(650)
    }
  })

  it("normalizes snapshot with incomplete scenarioData", () => {
    const result = validateExportPayload({
      exportType: "snapshot",
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      snapshot: {
        name: "Snapshot parcial",
        createdAt: "2026-04-30T10:00:00.000Z",
        isBaseline: false,
        scenarioData: {
          name: "Escenario mínimo",
          stations: [{ name: "A", cycleTimeMin: 10, operators: 1 }],
        },
      },
    })

    expect(result.success).toBe(true)
    if (result.success && result.payload.exportType === "snapshot") {
      expect(result.payload.snapshot.name).toBe("Snapshot parcial")
      expect(result.payload.snapshot.scenarioData.demandPerDay).toBe(8)
      expect(result.payload.snapshot.scenarioData.economics.laborCostPerHour).toBe(22)
    }
  })

  it("rejects snapshot with invalid scenarioData", () => {
    const result = validateExportPayload({
      exportType: "snapshot",
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      snapshot: {
        name: "Snapshot malo",
        createdAt: "2026-04-30T10:00:00.000Z",
        isBaseline: false,
        scenarioData: { name: "Malo", stations: "no-array" },
      },
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("snapshotInvalidScenarioData")
      expect(result.error.inner?.code).toBe("scenarioNoStationsArray")
    }
  })
})

// ─── regenerateScenarioIds ─────────────────────────────────────────────────────

describe("regenerateScenarioIds", () => {
  it("changes scenario id and all station ids", () => {
    const scenario = makeValidScenario()
    const originalScenarioId = scenario.id
    const originalStationIds = scenario.stations.map((s) => s.id)

    const regenerated = regenerateScenarioIds(scenario)

    expect(regenerated.id).not.toBe(originalScenarioId)
    expect(regenerated.stations).toHaveLength(2)
    expect(regenerated.stations[0].id).not.toBe(originalStationIds[0])
    expect(regenerated.stations[1].id).not.toBe(originalStationIds[1])
  })

  it("preserves all other data", () => {
    const scenario = makeValidScenario()
    const regenerated = regenerateScenarioIds(scenario)

    expect(regenerated.name).toBe(scenario.name)
    expect(regenerated.demandPerDay).toBe(scenario.demandPerDay)
    expect(regenerated.shiftHours).toBe(scenario.shiftHours)
    expect(regenerated.shiftsPerDay).toBe(scenario.shiftsPerDay)
    expect(regenerated.economics).toEqual(scenario.economics)
    expect(regenerated.stations[0].name).toBe(scenario.stations[0].name)
    expect(regenerated.stations[0].cycleTimeMin).toBe(scenario.stations[0].cycleTimeMin)
    expect(regenerated.stations[0].operators).toBe(scenario.stations[0].operators)
    expect(regenerated.stations[0].failureRate).toBe(scenario.stations[0].failureRate)
  })
})

// ─── generateExportFileName ────────────────────────────────────────────────────

describe("generateExportFileName", () => {
  it("generates a filename for scenario export", () => {
    const payload = buildScenarioExportPayload(makeValidScenario())
    const filename = generateExportFileName(payload)
    expect(filename).toMatch(/^takt-studio-scenario-l-nea-monobath-\d{4}-\d{2}-\d{2}\.json$/)
  })

  it("generates a filename for snapshot export with baseline prefix", () => {
    const snapshot = makeValidSnapshot()
    const payload = buildSnapshotExportPayload(snapshot)
    const filename = generateExportFileName(payload)
    expect(filename).toMatch(/^takt-studio-snapshot-baseline-baseline-inicial-\d{4}-\d{2}-\d{2}\.json$/)
  })

  it("generates a filename for non-baseline snapshot", () => {
    const snapshot = makeValidSnapshot()
    snapshot.isBaseline = false
    snapshot.name = "Snapshot v2"
    const payload = buildSnapshotExportPayload(snapshot)
    const filename = generateExportFileName(payload)
    expect(filename).not.toContain("baseline-")
    expect(filename).toMatch(/^takt-studio-snapshot-snapshot-v2-\d{4}-\d{2}-\d{2}\.json$/)
  })
})
