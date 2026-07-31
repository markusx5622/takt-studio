import { describe, it, expect } from "vitest"
import { encodeScenarioToHash, decodeScenarioFromHash } from "@/lib/share"
import { createMonobathPreset } from "@/lib/presets"

describe("encodeScenarioToHash", () => {
  it("genera un fragmento s= en base64url sin caracteres +, / ni =", () => {
    const hash = encodeScenarioToHash(createMonobathPreset())
    expect(hash.startsWith("s=")).toBe(true)
    const encoded = hash.slice(2)
    expect(encoded).not.toMatch(/[+/=]/)
  })
})

describe("decodeScenarioFromHash", () => {
  it("round-trip: recupera el escenario con nombre, estaciones y demanda intactos", () => {
    const scenario = createMonobathPreset()
    const hash = encodeScenarioToHash(scenario)
    const decoded = decodeScenarioFromHash(`#${hash}`)
    expect(decoded).not.toBeNull()
    expect(decoded!.name).toBe(scenario.name)
    expect(decoded!.stations.length).toBe(scenario.stations.length)
    expect(decoded!.demandPerDay).toBe(scenario.demandPerDay)
  })

  it("round-trip con caracteres especiales (tildes y eñes) en nombres", () => {
    const scenario = createMonobathPreset()
    scenario.name = "Línea de diseño — baño & montaje ñ"
    const decoded = decodeScenarioFromHash(`#${encodeScenarioToHash(scenario)}`)
    expect(decoded!.name).toBe("Línea de diseño — baño & montaje ñ")
  })

  it("devuelve null si no hay parámetro s en el hash", () => {
    expect(decodeScenarioFromHash("#")).toBeNull()
    expect(decodeScenarioFromHash("")).toBeNull()
    expect(decodeScenarioFromHash("#otro=valor")).toBeNull()
  })

  it("devuelve null ante base64 corrupto", () => {
    expect(decodeScenarioFromHash("#s=!!!basura***")).toBeNull()
  })

  it("devuelve null ante un payload JSON válido pero no conforme", () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ foo: "bar" }))
    let binary = ""
    for (const byte of bytes) binary += String.fromCharCode(byte)
    const encoded = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
    expect(decodeScenarioFromHash(`#s=${encoded}`)).toBeNull()
  })
})
