"use client"

import { useEffect } from "react"
import { useTaktStore } from "@/lib/store"
import { decodeScenarioFromHash } from "@/lib/share"

/**
 * Detecta un escenario compartido en el hash de la URL (#s=...), lo importa
 * como escenario nuevo y limpia el hash para evitar duplicados al recargar.
 * No renderiza nada.
 */
export default function SharedScenarioLoader() {
  const importScenarioFromPayload = useTaktStore((s) => s.importScenarioFromPayload)

  useEffect(() => {
    const scenario = decodeScenarioFromHash(window.location.hash)
    if (!scenario) return
    importScenarioFromPayload(
      {
        exportType: "scenario",
        exportedAt: new Date().toISOString(),
        appVersion: "shared-url",
        scenario,
      },
      `${scenario.name} — compartido`
    )
    window.history.replaceState(null, "", window.location.pathname)
  }, [importScenarioFromPayload])

  return null
}
