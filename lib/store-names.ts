import esMessages from "@/messages/es.json"
import enMessages from "@/messages/en.json"
import { detectLocale } from "@/lib/presets"

// ─── Nombres generados por el store (snapshots, restauraciones, comparaciones) ─
// Mismo patrón que presets.ts: los textos viven en messages/*.json (fuente
// única) y aquí solo se elige el bundle según <html lang>, sin React — el
// store se ejecuta fuera de componentes.

export type StoreNames = {
  snapshotTag: string
  restoredSuffix: string
  comparisonSuffixA: string
  comparisonSuffixB: string
  importedSuffix: string
}

export function getStoreNames(locale?: "es" | "en"): StoreNames {
  const messages = (locale ?? detectLocale()) === "en" ? enMessages : esMessages
  return messages.store
}
