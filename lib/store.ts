import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useSyncExternalStore } from "react"
import type { Station, Scenario, AppState, EconomicInputs, ScenarioSnapshot, ExportPayload } from "@/types"
import { createEmptyScenario, DEFAULT_ECONOMICS, detectLocale } from "@/lib/presets"
import { getStoreNames } from "@/lib/store-names"
import { buildScenarioExportPayload, buildSnapshotExportPayload, regenerateScenarioIds } from "@/lib/import-export"

interface TaktStore extends AppState {
  // Escenarios
  addScenario: (name: string) => void
  removeScenario: (id: string) => void
  duplicateScenario: (id: string, newName: string) => void
  createScenarioVariant: (
    sourceId: string,
    newName: string,
    stationChanges?: { originalStationId: string; updates: Partial<Omit<Station, "id">> }[],
    scenarioChanges?: Partial<Pick<Scenario, "shiftsPerDay">>
  ) => void
  updateScenario: (
    id: string,
    updates: Partial<Pick<Scenario, "name" | "demandPerDay" | "shiftHours" | "shiftsPerDay" | "economics" | "stations" | "monteCarloOptions">>
  ) => void
  setActiveScenario: (id: string) => void
  setCompareA: (id: string) => void
  setCompareB: (id: string) => void
  // Estaciones (operan sobre el escenario activo)
  addStation: (station: Omit<Station, "id">) => void
  updateStation: (stationId: string, updates: Partial<Omit<Station, "id">>) => void
  removeStation: (stationId: string) => void
  moveStation: (stationId: string, direction: "up" | "down") => void
  // Reset
  resetToPreset: () => void
  // Helpers
  getActiveScenario: () => Scenario | undefined
  getScenarioById: (id: string) => Scenario | undefined
  // Snapshots
  saveSnapshot: (scenarioId: string, name?: string, note?: string) => void
  removeSnapshot: (snapshotId: string) => void
  setBaselineSnapshot: (snapshotId: string) => void
  restoreSnapshotAsScenario: (snapshotId: string, newName?: string) => void
  setCompareFromSnapshots: (snapshotAId: string, snapshotBId: string) => void
  getSnapshotsByScenarioId: (scenarioId: string) => ScenarioSnapshot[]
  // Import / Export
  exportScenarioById: (id: string) => ExportPayload | null
  exportSnapshotById: (id: string) => ExportPayload | null
  importScenarioFromPayload: (payload: ExportPayload, importedName?: string) => void
  importSnapshotAsScenario: (payload: ExportPayload, importedName?: string) => void
}

function createInitialState(): AppState {
  return {
    scenarios: [],
    activeScenarioId: "",
    compareScenarioAId: "",
    compareScenarioBId: "",
    snapshots: [],
  }
}

export const useTaktStore = create<TaktStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      addScenario: (name: string) => {
        const scenario = createEmptyScenario(name)
        set((state) => ({
          scenarios: [...state.scenarios, scenario],
          activeScenarioId: state.activeScenarioId || scenario.id,
        }))
      },

      removeScenario: (id: string) => {
        set((state) => {
          const scenarios = state.scenarios.filter((s) => s.id !== id)
          const activeScenarioId =
            state.activeScenarioId === id ? (scenarios[0]?.id ?? "") : state.activeScenarioId
          return { scenarios, activeScenarioId }
        })
      },

      duplicateScenario: (id: string, newName: string) => {
        const original = get().scenarios.find((s) => s.id === id)
        if (!original) return
        const newScenario: Scenario = {
          ...original,
          id: crypto.randomUUID(),
          name: newName,
          stations: original.stations.map((station) => ({
            ...station,
            id: crypto.randomUUID(),
          })),
        }
        set((state) => ({
          scenarios: [...state.scenarios, newScenario],
          activeScenarioId: newScenario.id,
        }))
      },

      createScenarioVariant: (
        sourceId: string,
        newName: string,
        stationChanges?: { originalStationId: string; updates: Partial<Omit<Station, "id">> }[],
        scenarioChanges?: Partial<Pick<Scenario, "shiftsPerDay">>
      ) => {
        const original = get().scenarios.find((s) => s.id === sourceId)
        if (!original) return

        const newStations = original.stations.map((station) => ({
          ...station,
          id: crypto.randomUUID(),
        }))

        // Map original station IDs to new stations for applying changes
        const idMap = new Map<string, typeof newStations[number]>()
        original.stations.forEach((orig, i) => {
          idMap.set(orig.id, newStations[i])
        })

        stationChanges?.forEach(({ originalStationId, updates }) => {
          const target = idMap.get(originalStationId)
          if (target) {
            Object.assign(target, updates)
          }
        })

        const newScenario: Scenario = {
          ...original,
          id: crypto.randomUUID(),
          name: newName,
          stations: newStations,
          ...scenarioChanges,
        }

        set((state) => ({
          scenarios: [...state.scenarios, newScenario],
          activeScenarioId: newScenario.id,
          compareScenarioAId: sourceId,
          compareScenarioBId: newScenario.id,
        }))
      },

      updateScenario: (id, updates) => {
        set((state) => ({
          scenarios: state.scenarios.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }))
      },

      setActiveScenario: (id: string) => set({ activeScenarioId: id }),
      setCompareA: (id: string) => set({ compareScenarioAId: id }),
      setCompareB: (id: string) => set({ compareScenarioBId: id }),

      addStation: (station: Omit<Station, "id">) => {
        const { activeScenarioId } = get()
        if (!activeScenarioId) return
        const newStation: Station = {
          ...station,
          id: crypto.randomUUID(),
          failureRate: station.failureRate ?? 0,
        }
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === activeScenarioId
              ? { ...s, stations: [...s.stations, newStation] }
              : s
          ),
        }))
      },

      updateStation: (stationId: string, updates: Partial<Omit<Station, "id">>) => {
        const { activeScenarioId } = get()
        if (!activeScenarioId) return
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === activeScenarioId
              ? {
                  ...s,
                  stations: s.stations.map((st) =>
                    st.id === stationId ? { ...st, ...updates } : st
                  ),
                }
              : s
          ),
        }))
      },

      removeStation: (stationId: string) => {
        const { activeScenarioId } = get()
        if (!activeScenarioId) return
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === activeScenarioId
              ? { ...s, stations: s.stations.filter((st) => st.id !== stationId) }
              : s
          ),
        }))
      },

      moveStation: (stationId: string, direction: "up" | "down") => {
        const { activeScenarioId } = get()
        if (!activeScenarioId) return
        set((state) => ({
          scenarios: state.scenarios.map((s) => {
            if (s.id !== activeScenarioId) return s
            const stations = [...s.stations]
            const index = stations.findIndex((st) => st.id === stationId)
            if (index === -1) return s
            const newIndex = direction === "up" ? index - 1 : index + 1
            if (newIndex < 0 || newIndex >= stations.length) return s
            const temp = stations[index]
            stations[index] = stations[newIndex]
            stations[newIndex] = temp
            return { ...s, stations }
          }),
        }))
      },

      resetToPreset: () => set(createInitialState()),

      getActiveScenario: () => {
        const { scenarios, activeScenarioId } = get()
        return scenarios.find((s) => s.id === activeScenarioId)
      },

      getScenarioById: (id: string) => get().scenarios.find((s) => s.id === id),

      saveSnapshot: (scenarioId: string, name?: string, note?: string) => {
        const scenario = get().scenarios.find((s) => s.id === scenarioId)
        if (!scenario) return
        const snapshot: ScenarioSnapshot = {
          id: crypto.randomUUID(),
          scenarioId,
          name:
            name ??
            `${scenario.name} — ${getStoreNames().snapshotTag} ${new Date().toLocaleString(
              detectLocale(),
              {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}`,
          createdAt: new Date().toISOString(),
          isBaseline: false,
          scenarioData: JSON.parse(JSON.stringify(scenario)),
          note,
        }
        set((state) => ({
          snapshots: [...state.snapshots, snapshot],
        }))
      },

      removeSnapshot: (snapshotId: string) => {
        set((state) => ({
          snapshots: state.snapshots.filter((sn) => sn.id !== snapshotId),
        }))
      },

      setBaselineSnapshot: (snapshotId: string) => {
        const snapshot = get().snapshots.find((s) => s.id === snapshotId)
        if (!snapshot) return
        set((state) => ({
          snapshots: state.snapshots.map((sn) =>
            sn.scenarioId === snapshot.scenarioId
              ? { ...sn, isBaseline: sn.id === snapshotId }
              : sn
          ),
        }))
      },

      restoreSnapshotAsScenario: (snapshotId: string, newName?: string) => {
        const snapshot = get().snapshots.find((s) => s.id === snapshotId)
        if (!snapshot) return
        const restored: Scenario = {
          ...snapshot.scenarioData,
          id: crypto.randomUUID(),
          name: newName ?? `${snapshot.name}${getStoreNames().restoredSuffix}`,
          stations: snapshot.scenarioData.stations.map((st) => ({
            ...st,
            id: crypto.randomUUID(),
          })),
        }
        set((state) => ({
          scenarios: [...state.scenarios, restored],
          activeScenarioId: restored.id,
        }))
      },

      setCompareFromSnapshots: (snapshotAId: string, snapshotBId: string) => {
        const snapA = get().snapshots.find((s) => s.id === snapshotAId)
        const snapB = get().snapshots.find((s) => s.id === snapshotBId)
        if (!snapA || !snapB) return

        const scenarioA: Scenario = {
          ...snapA.scenarioData,
          id: crypto.randomUUID(),
          name: `${snapA.name}${getStoreNames().comparisonSuffixA}`,
          stations: snapA.scenarioData.stations.map((st) => ({ ...st, id: crypto.randomUUID() })),
        }
        const scenarioB: Scenario = {
          ...snapB.scenarioData,
          id: crypto.randomUUID(),
          name: `${snapB.name}${getStoreNames().comparisonSuffixB}`,
          stations: snapB.scenarioData.stations.map((st) => ({ ...st, id: crypto.randomUUID() })),
        }

        set((state) => ({
          scenarios: [...state.scenarios, scenarioA, scenarioB],
          compareScenarioAId: scenarioA.id,
          compareScenarioBId: scenarioB.id,
        }))
      },

      getSnapshotsByScenarioId: (scenarioId: string) => {
        return get()
          .snapshots.filter((s) => s.scenarioId === scenarioId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      exportScenarioById: (id: string) => {
        const scenario = get().scenarios.find((s) => s.id === id)
        if (!scenario) return null
        return buildScenarioExportPayload(scenario)
      },

      exportSnapshotById: (id: string) => {
        const snapshot = get().snapshots.find((s) => s.id === id)
        if (!snapshot) return null
        return buildSnapshotExportPayload(snapshot)
      },

      importScenarioFromPayload: (payload: ExportPayload, importedName?: string) => {
        if (payload.exportType !== "scenario") return
        const scenario = regenerateScenarioIds(payload.scenario)
        scenario.name = importedName?.trim() || scenario.name
        set((state) => ({
          scenarios: [...state.scenarios, scenario],
          activeScenarioId: scenario.id,
        }))
      },

      importSnapshotAsScenario: (payload: ExportPayload, importedName?: string) => {
        const snapshot = payload.exportType === "snapshot" ? payload.snapshot : null
        if (!snapshot) return
        const scenario = regenerateScenarioIds(snapshot.scenarioData)
        scenario.name = importedName?.trim() || `${snapshot.name}${getStoreNames().importedSuffix}`
        set((state) => ({
          scenarios: [...state.scenarios, scenario],
          activeScenarioId: scenario.id,
        }))
      },
    }),
    {
      name: "takt-studio-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { scenarios?: Scenario[]; snapshots?: unknown[] }
        if (version < 1) {
          if (state.scenarios) {
            state.scenarios = state.scenarios.map((s) => ({
              ...s,
              economics: {
                ...DEFAULT_ECONOMICS,
                ...(s.economics ?? {}),
              } as EconomicInputs,
            }))
          }
        }
        if (version < 2) {
          state.snapshots = state.snapshots ?? []
        }
        return persistedState as { scenarios: Scenario[]; activeScenarioId: string; compareScenarioAId: string; compareScenarioBId: string; snapshots: ScenarioSnapshot[] }
      },
    }
  )
)

export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}
