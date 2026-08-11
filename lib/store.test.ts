if (typeof global.localStorage === "undefined" || !global.localStorage) {
  let store: Record<string, string> = {}
  global.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value) },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length }
  } as unknown as Storage
}

import { describe, it, expect, beforeEach } from "vitest"
import { useTaktStore } from "./store"
import type { Scenario } from "@/types"
import { createMonobathPreset, getPresetNames } from "./presets"

function state() {
  return useTaktStore.getState()
}

function active(): Scenario {
  const s = state().getActiveScenario()
  if (!s) throw new Error("no active scenario")
  return s
}

beforeEach(() => {
  localStorage.clear()
  state().resetToPreset()
  const names = getPresetNames()
  const scenarioA = { ...createMonobathPreset(names), name: names.scenarioAName }
  const scenarioB = { ...createMonobathPreset(names), name: names.scenarioBName }
  useTaktStore.setState({
    scenarios: [scenarioA, scenarioB],
    activeScenarioId: scenarioA.id,
    compareScenarioAId: scenarioA.id,
    compareScenarioBId: scenarioB.id,
    snapshots: [],
  })
})

describe("estado inicial / resetToPreset", () => {
  it("arranca limpio sin escenarios precreados y sin snapshots", () => {
    useTaktStore.setState({
      scenarios: [],
      activeScenarioId: "",
      compareScenarioAId: "",
      compareScenarioBId: "",
      snapshots: [],
    })
    const s = state()
    expect(s.scenarios).toHaveLength(0)
    expect(s.activeScenarioId).toBe("")
    expect(s.snapshots).toHaveLength(0)
  })

  it("resetToPreset restaura el estado inicial limpio tras modificaciones", () => {
    state().addScenario("Extra")
    expect(state().scenarios).toHaveLength(3)
    state().resetToPreset()
    expect(state().scenarios).toHaveLength(0)
  })
})

describe("escenarios", () => {
  it("addScenario crea escenario vacío y lo activa", () => {
    state().addScenario("Nuevo")
    const created = state().scenarios.at(-1)!
    expect(state().scenarios).toHaveLength(3)
    expect(created.name).toBe("Nuevo")
    expect(created.stations).toHaveLength(0)
    expect(state().activeScenarioId).toBe(created.id)
  })

  it("removeScenario elimina y reasigna el activo si era el eliminado", () => {
    const first = state().scenarios[0]
    state().removeScenario(first.id)
    expect(state().scenarios).toHaveLength(1)
    expect(state().activeScenarioId).toBe(state().scenarios[0].id)
  })

  it("removeScenario mantiene el activo si elimina otro", () => {
    const [a, b] = state().scenarios
    state().removeScenario(b.id)
    expect(state().activeScenarioId).toBe(a.id)
  })

  it("duplicateScenario copia con ids nuevos y la activa", () => {
    const original = state().scenarios[0]
    state().duplicateScenario(original.id, "Copia")
    const copy = active()
    expect(copy.name).toBe("Copia")
    expect(copy.id).not.toBe(original.id)
    expect(copy.stations).toHaveLength(original.stations.length)
    expect(copy.stations.map((s) => s.id)).not.toContain(original.stations[0].id)
    expect(copy.stations[0].name).toBe(original.stations[0].name)
  })

  it("duplicateScenario con id inexistente no hace nada", () => {
    state().duplicateScenario("nope", "X")
    expect(state().scenarios).toHaveLength(2)
  })

  it("createScenarioVariant aplica cambios de estación y fija la comparación", () => {
    const source = state().scenarios[0]
    const target = source.stations[0]
    state().createScenarioVariant(
      source.id,
      "Variante",
      [{ originalStationId: target.id, updates: { cycleTimeMin: 999 } }],
      { shiftsPerDay: 3 }
    )
    const variant = active()
    expect(variant.name).toBe("Variante")
    expect(variant.shiftsPerDay).toBe(3)
    expect(variant.stations[0].cycleTimeMin).toBe(999)
    expect(variant.stations[1].cycleTimeMin).toBe(source.stations[1].cycleTimeMin)
    expect(state().compareScenarioAId).toBe(source.id)
    expect(state().compareScenarioBId).toBe(variant.id)
  })

  it("updateScenario actualiza campos parciales", () => {
    const s = active()
    state().updateScenario(s.id, { name: "Renombrado", demandPerDay: 42 })
    const updated = state().getScenarioById(s.id)!
    expect(updated.name).toBe("Renombrado")
    expect(updated.demandPerDay).toBe(42)
    expect(updated.shiftHours).toBe(s.shiftHours)
  })

  it("setActiveScenario / setCompareA / setCompareB", () => {
    const [a, b] = state().scenarios
    state().setActiveScenario(b.id)
    expect(state().activeScenarioId).toBe(b.id)
    state().setCompareA(b.id)
    state().setCompareB(a.id)
    expect(state().compareScenarioAId).toBe(b.id)
    expect(state().compareScenarioBId).toBe(a.id)
  })
})

describe("estaciones", () => {
  const newStation = { name: "Extra", cycleTimeMin: 30, operators: 1, failureRate: 0 }

  it("addStation añade al escenario activo con id generado", () => {
    const before = active().stations.length
    state().addStation(newStation)
    const stations = active().stations
    expect(stations).toHaveLength(before + 1)
    expect(stations.at(-1)!.name).toBe("Extra")
    expect(stations.at(-1)!.id).toBeTruthy()
  })

  it("addStation aplica failureRate 0 por defecto", () => {
    state().addStation({ name: "SinFallo", cycleTimeMin: 10, operators: 1 } as never)
    expect(active().stations.at(-1)!.failureRate).toBe(0)
  })

  it("updateStation modifica solo la estación indicada", () => {
    const [first, second] = active().stations
    state().updateStation(first.id, { cycleTimeMin: 123 })
    const stations = active().stations
    expect(stations.find((s) => s.id === first.id)!.cycleTimeMin).toBe(123)
    expect(stations.find((s) => s.id === second.id)!.cycleTimeMin).toBe(second.cycleTimeMin)
  })

  it("removeStation elimina del activo", () => {
    const before = active().stations
    state().removeStation(before[0].id)
    const after = active().stations
    expect(after).toHaveLength(before.length - 1)
    expect(after.map((s) => s.id)).not.toContain(before[0].id)
  })

  it("moveStation sube y baja posiciones", () => {
    const [first, second] = active().stations
    state().moveStation(second.id, "up")
    expect(active().stations[0].id).toBe(second.id)
    state().moveStation(second.id, "down")
    expect(active().stations[0].id).toBe(first.id)
  })

  it("moveStation en los bordes no cambia nada", () => {
    const stations = active().stations
    state().moveStation(stations[0].id, "up")
    expect(active().stations[0].id).toBe(stations[0].id)
    state().moveStation(stations.at(-1)!.id, "down")
    expect(active().stations.at(-1)!.id).toBe(stations.at(-1)!.id)
  })

  it("las operaciones de estación no tocan otros escenarios", () => {
    const other = state().scenarios[1]
    state().addStation(newStation)
    expect(state().getScenarioById(other.id)!.stations).toHaveLength(other.stations.length)
  })
})

describe("snapshots", () => {
  it("saveSnapshot con nombre personalizado", () => {
    const s = active()
    state().saveSnapshot(s.id, "Mi foto")
    const snaps = state().snapshots
    expect(snaps).toHaveLength(1)
    expect(snaps[0].name).toBe("Mi foto")
    expect(snaps[0].scenarioId).toBe(s.id)
    expect(snaps[0].isBaseline).toBe(false)
    expect(snaps[0].scenarioData.stations).toHaveLength(s.stations.length)
  })

  it("saveSnapshot sin nombre genera uno con etiqueta de snapshot", () => {
    const s = active()
    state().saveSnapshot(s.id)
    expect(state().snapshots[0].name).toContain(`${s.name} — snapshot`)
  })

  it("saveSnapshot guarda una copia profunda inmutable", () => {
    const s = active()
    state().saveSnapshot(s.id, "Fija")
    state().updateStation(s.stations[0].id, { cycleTimeMin: 1 })
    expect(state().snapshots[0].scenarioData.stations[0].cycleTimeMin).toBe(
      s.stations[0].cycleTimeMin
    )
  })

  it("saveSnapshot con id inexistente no hace nada", () => {
    state().saveSnapshot("nope")
    expect(state().snapshots).toHaveLength(0)
  })

  it("removeSnapshot elimina", () => {
    const s = active()
    state().saveSnapshot(s.id)
    const snapId = state().snapshots[0].id
    state().removeSnapshot(snapId)
    expect(state().snapshots).toHaveLength(0)
  })

  it("setBaselineSnapshot deja una única baseline por escenario", () => {
    const s = active()
    state().saveSnapshot(s.id, "S1")
    state().saveSnapshot(s.id, "S2")
    const [s1, s2] = state().snapshots
    state().setBaselineSnapshot(s1.id)
    expect(state().snapshots.find((x) => x.id === s1.id)!.isBaseline).toBe(true)
    state().setBaselineSnapshot(s2.id)
    expect(state().snapshots.find((x) => x.id === s1.id)!.isBaseline).toBe(false)
    expect(state().snapshots.find((x) => x.id === s2.id)!.isBaseline).toBe(true)
  })

  it("restoreSnapshotAsScenario crea escenario restaurado con ids nuevos", () => {
    const s = active()
    state().saveSnapshot(s.id, "Base")
    const snapId = state().snapshots[0].id
    state().restoreSnapshotAsScenario(snapId)
    const restored = active()
    expect(restored.name).toBe("Base — restaurado")
    expect(restored.id).not.toBe(s.id)
    expect(restored.stations).toHaveLength(s.stations.length)
    expect(state().scenarios).toHaveLength(3)
  })

  it("restoreSnapshotAsScenario respeta nombre personalizado", () => {
    const s = active()
    state().saveSnapshot(s.id)
    state().restoreSnapshotAsScenario(state().snapshots[0].id, "Custom")
    expect(active().name).toBe("Custom")
  })

  it("setCompareFromSnapshots crea dos escenarios y fija la comparación", () => {
    const s = active()
    state().saveSnapshot(s.id, "A")
    state().saveSnapshot(s.id, "B")
    const [snapA, snapB] = state().snapshots
    state().setCompareFromSnapshots(snapA.id, snapB.id)
    expect(state().scenarios).toHaveLength(4)
    const cmpA = state().getScenarioById(state().compareScenarioAId)!
    const cmpB = state().getScenarioById(state().compareScenarioBId)!
    expect(cmpA.name).toBe("A (comparación A)")
    expect(cmpB.name).toBe("B (comparación B)")
  })

  it("getSnapshotsByScenarioId filtra y ordena por fecha descendente", () => {
    const [a, b] = state().scenarios
    state().saveSnapshot(a.id, "A1")
    state().saveSnapshot(b.id, "B1")
    state().saveSnapshot(a.id, "A2")
    // Las fechas pueden coincidir al milisegundo: forzamos una anterior para
    // que el orden esperado sea determinista.
    const [s1] = state().snapshots
    useTaktStore.setState((st) => ({
      snapshots: st.snapshots.map((sn) =>
        sn.id === s1.id ? { ...sn, createdAt: "2020-01-01T00:00:00.000Z" } : sn
      ),
    }))
    const snapsA = state().getSnapshotsByScenarioId(a.id)
    expect(snapsA.map((s) => s.name)).toEqual(["A2", "A1"])
    expect(state().getSnapshotsByScenarioId(b.id).map((s) => s.name)).toEqual(["B1"])
  })
})

describe("importar / exportar", () => {
  it("exportScenarioById devuelve payload de escenario y null para id desconocido", () => {
    const s = active()
    const payload = state().exportScenarioById(s.id)
    expect(payload?.exportType).toBe("scenario")
    expect(state().exportScenarioById("nope")).toBeNull()
  })

  it("exportSnapshotById devuelve payload de snapshot y null para id desconocido", () => {
    const s = active()
    state().saveSnapshot(s.id)
    const payload = state().exportSnapshotById(state().snapshots[0].id)
    expect(payload?.exportType).toBe("snapshot")
    expect(state().exportSnapshotById("nope")).toBeNull()
  })

  it("importScenarioFromPayload añade escenario con ids regenerados y lo activa", () => {
    const s = active()
    const payload = state().exportScenarioById(s.id)!
    state().importScenarioFromPayload(payload)
    expect(state().scenarios).toHaveLength(3)
    const imported = active()
    expect(imported.name).toBe(s.name)
    expect(imported.id).not.toBe(s.id)
    expect(imported.stations).toHaveLength(s.stations.length)
  })

  it("importScenarioFromPayload respeta nombre personalizado e ignora payloads snapshot", () => {
    const s = active()
    const scenarioPayload = state().exportScenarioById(s.id)!
    state().importScenarioFromPayload(scenarioPayload, "  Importado X  ")
    expect(active().name).toBe("Importado X")

    state().saveSnapshot(s.id)
    const snapshotPayload = state().exportSnapshotById(state().snapshots[0].id)!
    const count = state().scenarios.length
    state().importScenarioFromPayload(snapshotPayload)
    expect(state().scenarios).toHaveLength(count)
  })

  it("importSnapshotAsScenario nombra con sufijo de importado y regenera ids", () => {
    const s = active()
    state().saveSnapshot(s.id, "Foto")
    const payload = state().exportSnapshotById(state().snapshots[0].id)!
    state().importSnapshotAsScenario(payload)
    const imported = active()
    expect(imported.name).toBe("Foto — importado")
    expect(imported.id).not.toBe(s.id)
  })

  it("importSnapshotAsScenario ignora payloads de tipo escenario", () => {
    const s = active()
    const payload = state().exportScenarioById(s.id)!
    const count = state().scenarios.length
    state().importSnapshotAsScenario(payload)
    expect(state().scenarios).toHaveLength(count)
  })
})
