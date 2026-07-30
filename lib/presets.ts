import type { Scenario, Station, EconomicInputs } from "@/types"

export const DEFAULT_ECONOMICS: EconomicInputs = {
  laborCostPerHour: 22,
  contributionMarginPerUnit: 650,
  reworkCostPerUnit: 120,
  shiftFixedCostPerDay: 300,
  methodImprovementOneOffCost: 2500,
  qualityImprovementOneOffCost: 1800,
  workingDaysPerMonth: 22,
}

const MONOBATH_STATIONS: Omit<Station, "id">[] = [
  { name: "Estructura metálica y solera",          cycleTimeMin: 45, operators: 2, failureRate: 0.02 },
  { name: "Instalación de fontanería",             cycleTimeMin: 55, operators: 2, failureRate: 0.05 },
  { name: "Instalación eléctrica",                 cycleTimeMin: 35, operators: 1, failureRate: 0.03 },
  { name: "Alicatado y revestimientos cerámicos",  cycleTimeMin: 90, operators: 3, failureRate: 0.04 },
  { name: "Montaje sanitarios y grifería",         cycleTimeMin: 50, operators: 2, failureRate: 0.03 },
  { name: "Control de calidad e inspección",       cycleTimeMin: 25, operators: 1, failureRate: 0.01 },
  { name: "Embalaje y preparación expedición",     cycleTimeMin: 30, operators: 1, failureRate: 0.02 },
]

export function createMonobathPreset(): Scenario {
  return {
    id: crypto.randomUUID(),
    name: "Línea Monobath — Baño Hotel Estándar",
    stations: MONOBATH_STATIONS.map((s) => ({ ...s, id: crypto.randomUUID() })),
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
