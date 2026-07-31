import type { Scenario, ExportPayload } from "@/types"
import { validateExportPayload } from "@/lib/import-export"

const SHARE_PARAM = "s"

/** Serializa un escenario a un fragmento de URL (`s=...`) en base64url. */
export function encodeScenarioToHash(scenario: Scenario): string {
  const payload: ExportPayload = {
    exportType: "scenario",
    exportedAt: new Date().toISOString(),
    appVersion: "0.1.0",
    scenario,
  }
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const base64url = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
  return `${SHARE_PARAM}=${base64url}`
}

/**
 * Decodifica y valida un escenario desde el hash de la URL.
 * Devuelve null ante cualquier problema (hash ausente, base64 corrupto, payload inválido).
 */
export function decodeScenarioFromHash(hash: string): Scenario | null {
  try {
    const params = new URLSearchParams(hash.replace(/^#/, ""))
    const encoded = params.get(SHARE_PARAM)
    if (!encoded) return null
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const raw: unknown = JSON.parse(new TextDecoder().decode(bytes))
    const result = validateExportPayload(raw)
    if (!result.success || result.payload.exportType !== "scenario") return null
    return result.payload.scenario
  } catch {
    return null
  }
}
