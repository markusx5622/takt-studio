import type { Scenario, Station, EconomicInputs } from "@/types"
import esMessages from "@/messages/es.json"
import enMessages from "@/messages/en.json"

export const DEFAULT_ECONOMICS: EconomicInputs = {
  laborCostPerHour: 22,
  contributionMarginPerUnit: 650,
  reworkCostPerUnit: 120,
  shiftFixedCostPerDay: 300,
  methodImprovementOneOffCost: 2500,
  qualityImprovementOneOffCost: 1800,
  workingDaysPerMonth: 22,
}

// ─── Nombres localizados del preset ────────────────────────────────────────────
// Los nombres de estaciones del preset son DATOS de usuario (se persisten y se
// comparten), pero la primera impresión debe estar en el idioma activo. Los
// textos viven en messages/*.json (fuente única); aquí solo se elige el bundle.
// Detección: <html lang> lo fija el layout en servidor; en SSR/tests cae a ES
// (defaultLocale). No requiere React — el store se crea a nivel de módulo.

export type PresetNames = {
  scenarioName: string
  scenarioAName: string
  scenarioBName: string
  stationNames: string[]
}

export function detectLocale(): "es" | "en" {
  if (typeof document !== "undefined" && document.documentElement.lang === "en") {
    return "en"
  }
  return "es"
}

export function getPresetNames(locale?: "es" | "en"): PresetNames {
  const messages = (locale ?? detectLocale()) === "en" ? enMessages : esMessages
  const p = messages.simulator.presets
  return {
    scenarioName: p.scenarioName,
    scenarioAName: p.scenarioAName,
    scenarioBName: p.scenarioBName,
    stationNames: [...p.stationNames],
  }
}

const MONOBATH_STATIONS: Omit<Station, "id" | "name">[] = [
  { cycleTimeMin: 45, operators: 2, failureRate: 0.02 },
  { cycleTimeMin: 55, operators: 2, failureRate: 0.05 },
  { cycleTimeMin: 35, operators: 1, failureRate: 0.03 },
  { cycleTimeMin: 90, operators: 3, failureRate: 0.04 },
  { cycleTimeMin: 50, operators: 2, failureRate: 0.03 },
  { cycleTimeMin: 25, operators: 1, failureRate: 0.01 },
  { cycleTimeMin: 30, operators: 1, failureRate: 0.02 },
]

export function createMonobathPreset(names?: PresetNames): Scenario {
  const n = names ?? getPresetNames()
  return {
    id: crypto.randomUUID(),
    name: n.scenarioName,
    stations: MONOBATH_STATIONS.map((s, i) => ({
      ...s,
      name: n.stationNames[i] ?? `Station ${i + 1}`,
      id: crypto.randomUUID(),
    })),
    demandPerDay: 8,
    shiftHours: 8,
    shiftsPerDay: 1,
    economics: { ...DEFAULT_ECONOMICS },
  }
}

export function createEmptyScenario(name: string): Scenario {
  return {
    id: crypto.randomUUID(),
    name,
    stations: [],
    demandPerDay: 8,
    shiftHours: 8,
    shiftsPerDay: 1,
    economics: { ...DEFAULT_ECONOMICS },
  }
}
