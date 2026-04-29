import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useState, useEffect } from "react"
import type { Station, Scenario, AppState } from "@/types"
import { createMonobathPreset } from "@/lib/presets"

interface TaktStore extends AppState {
  // Escenarios
  addScenario: (name: string) => void
  removeScenario: (id: string) => void
  duplicateScenario: (id: string, newName: string) => void
  updateScenario: (
    id: string,
    updates: Partial<Pick<Scenario, "name" | "demandPerDay" | "shiftHours" | "shiftsPerDay">>
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
}

function createInitialState(): AppState {
  const scenarioA = { ...createMonobathPreset(), name: "Escenario A — Monobath" }
  const scenarioB = { ...createMonobathPreset(), name: "Escenario B — Monobath" }
  return {
    scenarios: [scenarioA, scenarioB],
    activeScenarioId: scenarioA.id,
    compareScenarioAId: scenarioA.id,
    compareScenarioBId: scenarioB.id,
  }
}

export const useTaktStore = create<TaktStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      addScenario: (name: string) => {
        const id = crypto.randomUUID()
        const scenario: Scenario = {
          id,
          name,
          stations: [],
          demandPerDay: 8,
          shiftHours: 8,
          shiftsPerDay: 1,
        }
        set((state) => ({
          scenarios: [...state.scenarios, scenario],
          activeScenarioId: state.activeScenarioId || id,
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
        set((state) => ({ scenarios: [...state.scenarios, newScenario] }))
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
    }),
    { name: "takt-studio-storage" }
  )
)

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])
  return hydrated
}
