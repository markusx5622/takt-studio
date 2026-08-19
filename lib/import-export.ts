import type { Scenario, Station, ScenarioSnapshot, ExportPayload } from "@/types"
import { normalizeEconomics } from "@/lib/calculations"

const APP_VERSION = "0.1.0"

// ─── Result type for validation ────────────────────────────────────────────────
// i18n: la capa lib devuelve CÓDIGOS de error (+ valores opcionales), no texto.
// La UI traduce con el namespace "importExport.errors".

export type ValidationError = {
  code: string
  values?: Record<string, string | number>
  inner?: ValidationError
}

type ValidationResult =
  | { success: true; payload: ExportPayload }
  | { success: false; error: ValidationError }

// ─── Guard helpers ─────────────────────────────────────────────────────────────

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === "string"
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value)
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

// ─── Station validation ────────────────────────────────────────────────────────

function validateStation(raw: unknown): { valid: true; station: Station } | { valid: false; reason: ValidationError } {
  if (!isObject(raw)) {
    return { valid: false, reason: { code: "stationNotObject" } }
  }

  const name = raw.name
  if (!isString(name) || name.trim().length === 0) {
    return { valid: false, reason: { code: "stationInvalidName" } }
  }

  const cycleTimeMin = raw.cycleTimeMin
  if (!isNumber(cycleTimeMin) || cycleTimeMin < 0) {
    return { valid: false, reason: { code: "stationInvalidCycle", values: { name } } }
  }

  const operators = raw.operators
  if (!isNumber(operators) || operators < 1 || !Number.isInteger(operators)) {
    return { valid: false, reason: { code: "stationInvalidOperators", values: { name } } }
  }

  const station: Station = {
    id: crypto.randomUUID(),
    name: name.trim(),
    cycleTimeMin,
    operators,
    unitsPerCycle: isNumber(raw.unitsPerCycle) && raw.unitsPerCycle >= 1 ? Math.floor(raw.unitsPerCycle) : 1,
    failureRate: isNumber(raw.failureRate) ? Math.max(0, Math.min(1, raw.failureRate)) : 0,
    processType: raw.processType === "machine" ? "machine" : "manual",
  }

  return { valid: true, station }
}

// ─── Scenario validation ───────────────────────────────────────────────────────

function validateScenarioData(raw: unknown): { valid: true; scenario: Scenario } | { valid: false; reason: ValidationError } {
  if (!isObject(raw)) {
    return { valid: false, reason: { code: "scenarioNotObject" } }
  }

  const name = raw.name
  if (!isString(name) || name.trim().length === 0) {
    return { valid: false, reason: { code: "scenarioInvalidName" } }
  }

  const stationsRaw = raw.stations
  if (!isArray(stationsRaw)) {
    return { valid: false, reason: { code: "scenarioNoStationsArray" } }
  }

  const stations: Station[] = []
  for (let i = 0; i < stationsRaw.length; i++) {
    const result = validateStation(stationsRaw[i])
    if (!result.valid) {
      return { valid: false, reason: result.reason }
    }
    stations.push(result.station)
  }

  const demandPerDay = isNumber(raw.demandPerDay) && raw.demandPerDay > 0 ? raw.demandPerDay : 8
  const shiftHours = isNumber(raw.shiftHours) && raw.shiftHours > 0 ? raw.shiftHours : 8
  const shiftsPerDay = isNumber(raw.shiftsPerDay) && raw.shiftsPerDay > 0 ? raw.shiftsPerDay : 1

  const economicsRaw = isObject(raw.economics) ? raw.economics : undefined
  const economics = normalizeEconomics(economicsRaw as Partial<import("@/types").EconomicInputs> | undefined)

  const scenario: Scenario = {
    id: crypto.randomUUID(),
    name: name.trim(),
    stations,
    demandPerDay,
    shiftHours,
    shiftsPerDay,
    economics,
  }

  return { valid: true, scenario }
}

// ─── Snapshot validation ───────────────────────────────────────────────────────

function validateSnapshotData(raw: unknown): { valid: true; snapshot: ScenarioSnapshot } | { valid: false; reason: ValidationError } {
  if (!isObject(raw)) {
    return { valid: false, reason: { code: "snapshotNotObject" } }
  }

  const scenarioDataRaw = raw.scenarioData
  const scenarioResult = validateScenarioData(scenarioDataRaw)
  if (!scenarioResult.valid) {
    return { valid: false, reason: { code: "snapshotInvalidScenarioData", inner: scenarioResult.reason } }
  }

  const name = isString(raw.name) && raw.name.trim().length > 0 ? raw.name.trim() : scenarioResult.scenario.name
  const createdAt = isString(raw.createdAt) ? raw.createdAt : new Date().toISOString()
  const isBaseline = isBoolean(raw.isBaseline) ? raw.isBaseline : false
  const note = isString(raw.note) ? raw.note : undefined

  const snapshot: ScenarioSnapshot = {
    id: crypto.randomUUID(),
    scenarioId: crypto.randomUUID(),
    name,
    createdAt,
    isBaseline,
    scenarioData: scenarioResult.scenario,
    note,
  }

  return { valid: true, snapshot }
}

// ─── Public validation API ─────────────────────────────────────────────────────

export function validateExportPayload(raw: unknown): ValidationResult {
  if (!isObject(raw)) {
    return { success: false, error: { code: "notJsonObject" } }
  }

  const exportType = raw.exportType
  if (exportType !== "scenario" && exportType !== "snapshot") {
    return { success: false, error: { code: "unknownExportType" } }
  }

  const exportedAt = isString(raw.exportedAt) ? raw.exportedAt : new Date().toISOString()
  const appVersion = isString(raw.appVersion) ? raw.appVersion : "unknown"

  if (exportType === "scenario") {
    const scenarioRaw = raw.scenario
    const result = validateScenarioData(scenarioRaw)
    if (!result.valid) {
      return { success: false, error: result.reason }
    }

    const payload: ExportPayload = {
      exportType: "scenario",
      exportedAt,
      appVersion,
      scenario: result.scenario,
    }
    return { success: true, payload }
  }

  // snapshot
  const snapshotRaw = raw.snapshot
  const result = validateSnapshotData(snapshotRaw)
  if (!result.valid) {
    return { success: false, error: result.reason }
  }

  const payload: ExportPayload = {
    exportType: "snapshot",
    exportedAt,
    appVersion,
    snapshot: result.snapshot,
  }
  return { success: true, payload }
}

// ─── Regenerate IDs ────────────────────────────────────────────────────────────

export function regenerateScenarioIds(scenario: Scenario): Scenario {
  return {
    ...scenario,
    id: crypto.randomUUID(),
    stations: scenario.stations.map((station) => ({
      ...station,
      id: crypto.randomUUID(),
    })),
  }
}

// ─── Export payload builders ───────────────────────────────────────────────────

export function buildScenarioExportPayload(scenario: Scenario): Extract<ExportPayload, { exportType: "scenario" }> {
  return {
    exportType: "scenario",
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    scenario,
  }
}

export function buildSnapshotExportPayload(snapshot: ScenarioSnapshot): Extract<ExportPayload, { exportType: "snapshot" }> {
  return {
    exportType: "snapshot",
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    snapshot,
  }
}

// ─── File name generator ───────────────────────────────────────────────────────

export function generateExportFileName(payload: ExportPayload): string {
  const date = new Date().toISOString().split("T")[0]

  if (payload.exportType === "scenario") {
    const slug = payload.scenario.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 30)
    return `takt-studio-scenario-${slug || "escenario"}-${date}.json`
  }

  const slug = payload.snapshot.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
  const baselinePrefix = payload.snapshot.isBaseline ? "baseline-" : ""
  return `takt-studio-snapshot-${baselinePrefix}${slug || "snapshot"}-${date}.json`
}

// ─── Download helper ───────────────────────────────────────────────────────────

export function downloadJsonFile(payload: ExportPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = generateExportFileName(payload)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
