import { describe, it, expect } from "vitest"
import { getStoreNames } from "./store-names"

describe("getStoreNames", () => {
  it("devuelve los textos en español para 'es'", () => {
    const names = getStoreNames("es")
    expect(names.snapshotTag).toBe("snapshot")
    expect(names.restoredSuffix).toBe(" — restaurado")
    expect(names.comparisonSuffixA).toBe(" (comparación A)")
    expect(names.comparisonSuffixB).toBe(" (comparación B)")
    expect(names.importedSuffix).toBe(" — importado")
  })

  it("devuelve los textos en inglés para 'en'", () => {
    const names = getStoreNames("en")
    expect(names.snapshotTag).toBe("snapshot")
    expect(names.restoredSuffix).toBe(" — restored")
    expect(names.comparisonSuffixA).toBe(" (comparison A)")
    expect(names.comparisonSuffixB).toBe(" (comparison B)")
    expect(names.importedSuffix).toBe(" — imported")
  })

  it("sin locale explícito cae al detectado (ES en jsdom por defecto)", () => {
    const names = getStoreNames()
    expect(names.restoredSuffix).toBe(" — restaurado")
  })

  it("respeta <html lang='en'> cuando no se pasa locale", () => {
    document.documentElement.lang = "en"
    try {
      expect(getStoreNames().importedSuffix).toBe(" — imported")
    } finally {
      document.documentElement.lang = ""
    }
  })
})
