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
  if (typeof window !== "undefined") {
    const path = window.location.pathname
    if (path === "/en" || path.startsWith("/en/")) {
      return "en"
    }
  }
  if (typeof document !== "undefined" && document.documentElement?.lang) {
    if (document.documentElement.lang.toLowerCase().startsWith("en")) {
      return "en"
    }
  }
  return "es"
}

export function getPresetNames(locale?: string): PresetNames {
  const loc = (locale ?? detectLocale()).toLowerCase().startsWith("en") ? "en" : "es"
  const messages = loc === "en" ? enMessages : esMessages
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

export type IndustrySectorKey =
  | "monobath"
  | "automotive"
  | "electronics"
  | "logistics"
  | "ceramics"
  | "food_pharma"
  | "machinery"

export const INDUSTRY_PRESETS_DATA: Record<
  IndustrySectorKey,
  {
    nameEs: string
    nameEn: string
    demandPerDay: number
    shiftHours: number
    shiftsPerDay: number
    stations: { nameEs: string; nameEn: string; cycleTimeMin: number; operators: number; failureRate: number }[]
  }
> = {
  monobath: {
    nameEs: "Módulos Prefabricados Off-Site (Monobath)",
    nameEn: "Off-Site Prefabricated Modules (Monobath)",
    demandPerDay: 8,
    shiftHours: 8,
    shiftsPerDay: 1,
    stations: [
      { nameEs: "Estructura y chasis de acero", nameEn: "Steel Frame & Chassis", cycleTimeMin: 45, operators: 2, failureRate: 0.02 },
      { nameEs: "Tabiquería y paneles impermeables", nameEn: "Drywall & Waterproof Panels", cycleTimeMin: 55, operators: 2, failureRate: 0.05 },
      { nameEs: "Fontanería y tuberías PEX", nameEn: "Plumbing & PEX Piping", cycleTimeMin: 35, operators: 1, failureRate: 0.03 },
      { nameEs: "Alicatado y revestimiento cerámico", nameEn: "Tiling & Ceramic Cladding", cycleTimeMin: 90, operators: 3, failureRate: 0.04 },
      { nameEs: "Montaje de sanitarios y grifería", nameEn: "Sanitary Fixture Assembly", cycleTimeMin: 50, operators: 2, failureRate: 0.03 },
      { nameEs: "Instalación eléctrica y LED", nameEn: "Electrical & LED Wiring", cycleTimeMin: 25, operators: 1, failureRate: 0.01 },
      { nameEs: "Inspección final y embalaje", nameEn: "Final Inspection & Packing", cycleTimeMin: 30, operators: 1, failureRate: 0.02 },
    ],
  },
  automotive: {
    nameEs: "Ensamblaje Automotriz (Chasis/Motor)",
    nameEn: "Automotive Assembly (Chassis/Engine)",
    demandPerDay: 120,
    shiftHours: 8,
    shiftsPerDay: 2,
    stations: [
      { nameEs: "Estructura de carrocería y soldadura", nameEn: "Body Structure & Welding", cycleTimeMin: 18, operators: 3, failureRate: 0.01 },
      { nameEs: "Tratamiento de pintura y secado", nameEn: "Paint & Drying Process", cycleTimeMin: 22, operators: 2, failureRate: 0.02 },
      { nameEs: "Inserción de motor y transmisión", nameEn: "Powertrain & Engine Marriage", cycleTimeMin: 32, operators: 4, failureRate: 0.03 },
      { nameEs: "Montaje de interiores y salpicadero", nameEn: "Interior Trim & Dashboard", cycleTimeMin: 24, operators: 3, failureRate: 0.02 },
      { nameEs: "Cableado eléctrico y batería", nameEn: "Harness & Battery Integration", cycleTimeMin: 16, operators: 2, failureRate: 0.01 },
      { nameEs: "Test dinámico y alineación", nameEn: "Dynamic Roll Test & Alignment", cycleTimeMin: 12, operators: 2, failureRate: 0.01 },
    ],
  },
  electronics: {
    nameEs: "Montaje Electrónico (Línea SMT)",
    nameEn: "Electronics Assembly (SMT Line)",
    demandPerDay: 250,
    shiftHours: 8,
    shiftsPerDay: 2,
    stations: [
      { nameEs: "Impresión de pasta de soldar", nameEn: "Solder Paste Printing", cycleTimeMin: 6, operators: 1, failureRate: 0.01 },
      { nameEs: "Montaje componentes SMT Pick&Place", nameEn: "SMT Component Pick & Place", cycleTimeMin: 12, operators: 2, failureRate: 0.02 },
      { nameEs: "Horno de reflujo térmico", nameEn: "Thermal Reflow Oven", cycleTimeMin: 10, operators: 1, failureRate: 0.01 },
      { nameEs: "Inspección óptica AOI y X-Ray", nameEn: "Automated Optical Inspection AOI", cycleTimeMin: 8, operators: 1, failureRate: 0.01 },
      { nameEs: "Ensamblaje final y test funcional", nameEn: "Final Assembly & Functional Test", cycleTimeMin: 14, operators: 2, failureRate: 0.02 },
    ],
  },
  logistics: {
    nameEs: "Logística y Embalaje de Kits",
    nameEn: "Logistics & Kit Packaging",
    demandPerDay: 150,
    shiftHours: 8,
    shiftsPerDay: 1,
    stations: [
      { nameEs: "Recepción y desensamblaje", nameEn: "Receiving & Unboxing", cycleTimeMin: 8, operators: 2, failureRate: 0.01 },
      { nameEs: "Picking en estanterías por lista", nameEn: "List-Based Shelf Picking", cycleTimeMin: 15, operators: 3, failureRate: 0.03 },
      { nameEs: "Verificación por escáner y etiquetado", nameEn: "Barcode Verification & Labeling", cycleTimeMin: 6, operators: 1, failureRate: 0.01 },
      { nameEs: "Empaquetado final y flejado", nameEn: "Final Packing & Pallet Strapping", cycleTimeMin: 10, operators: 2, failureRate: 0.02 },
    ],
  },
  ceramics: {
    nameEs: "Producción Industrial de Azulejos y Cerámica",
    nameEn: "Industrial Ceramic & Tile Manufacturing",
    demandPerDay: 180,
    shiftHours: 8,
    shiftsPerDay: 3,
    stations: [
      { nameEs: "Atomizado y molienda de arcillas", nameEn: "Clay Spray Drying & Atomization", cycleTimeMin: 5, operators: 1, failureRate: 0.01 },
      { nameEs: "Prensado hidráulico de gran formato", nameEn: "High-Tonnage Hydraulic Pressing", cycleTimeMin: 12, operators: 2, failureRate: 0.02 },
      { nameEs: "Secado rápido de azulejo crudo", nameEn: "Rapid Roller Dryer", cycleTimeMin: 7, operators: 1, failureRate: 0.01 },
      { nameEs: "Esmaltado y decoración digital Inkjet", nameEn: "Glazing & Digital Inkjet Printing", cycleTimeMin: 10, operators: 2, failureRate: 0.03 },
      { nameEs: "Cocción continua en horno monorrodillo", nameEn: "Continuous Roller Kiln Firing", cycleTimeMin: 16, operators: 2, failureRate: 0.02 },
      { nameEs: "Rectificado, clasificación por tono y embalaje", nameEn: "Edge Grinding, Optical Sorting & Packing", cycleTimeMin: 9, operators: 2, failureRate: 0.01 },
    ],
  },
  food_pharma: {
    nameEs: "Procesado y Envasado Agroalimentario",
    nameEn: "Agri-Food Processing & Canning Line",
    demandPerDay: 300,
    shiftHours: 8,
    shiftsPerDay: 2,
    stations: [
      { nameEs: "Selección de materia prima y lavado", nameEn: "Raw Material Sorting & Washing", cycleTimeMin: 6, operators: 2, failureRate: 0.01 },
      { nameEs: "Escaldado térmico y troceado automático", nameEn: "Thermal Blanching & Dicing", cycleTimeMin: 8, operators: 1, failureRate: 0.02 },
      { nameEs: "Dosificación y envasado en línea", nameEn: "Dosing & Container Filling", cycleTimeMin: 10, operators: 2, failureRate: 0.02 },
      { nameEs: "Sellado hermético y esterilización autoclave", nameEn: "Hermetic Sealing & Autoclave Sterilization", cycleTimeMin: 15, operators: 2, failureRate: 0.03 },
      { nameEs: "Etiquetado, encajado y paletizado robotizado", nameEn: "Labeling, Case Packing & Palletizing", cycleTimeMin: 7, operators: 1, failureRate: 0.01 },
    ],
  },
  machinery: {
    nameEs: "Fabricación de Equipos e Hidráulica Industrial",
    nameEn: "Industrial Equipment & Machinery Assembly",
    demandPerDay: 45,
    shiftHours: 8,
    shiftsPerDay: 1,
    stations: [
      { nameEs: "Mecanizado CNC de carcasas y bloques", nameEn: "CNC Block Machining", cycleTimeMin: 24, operators: 2, failureRate: 0.02 },
      { nameEs: "Inserción de rodamientos y retenes", nameEn: "Bearing & Seal Insertion", cycleTimeMin: 16, operators: 1, failureRate: 0.01 },
      { nameEs: "Montaje de rotor y bobinado eléctrico", nameEn: "Rotor Assembly & Stator Wiring", cycleTimeMin: 30, operators: 3, failureRate: 0.03 },
      { nameEs: "Prueba de estanqueidad y test hidráulico", nameEn: "Leak & Pressure Test Bench", cycleTimeMin: 20, operators: 2, failureRate: 0.04 },
      { nameEs: "Pintura electrostática y secado", nameEn: "Electrostatic Painting & Curing", cycleTimeMin: 18, operators: 1, failureRate: 0.02 },
      { nameEs: "Embalaje técnico e inspección final", nameEn: "Technical Packaging & Final Inspection", cycleTimeMin: 12, operators: 1, failureRate: 0.01 },
    ],
  },
}

export function createPresetFromSector(sectorKey: IndustrySectorKey, locale?: string): Station[] {
  const loc = (locale ?? detectLocale()).toLowerCase().startsWith("en") ? "en" : "es"
  const isEn = loc === "en"
  const sector = INDUSTRY_PRESETS_DATA[sectorKey] || INDUSTRY_PRESETS_DATA.monobath
  return sector.stations.map((st) => ({
    id: crypto.randomUUID(),
    name: isEn ? st.nameEn : st.nameEs,
    cycleTimeMin: st.cycleTimeMin,
    operators: st.operators,
    failureRate: st.failureRate,
  }))
}

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
