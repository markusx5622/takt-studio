import { describe, it, expect } from "vitest"
import { runMonteCarlo, mulberry32, sampleLognormal } from "@/lib/monte-carlo"
import { calculateThroughput } from "@/lib/calculations"
import { createMonobathPreset, createEmptyScenario } from "@/lib/presets"

describe("mulberry32", () => {
  it("misma semilla produce la misma secuencia", () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    for (let i = 0; i < 100; i++) expect(a()).toBe(b())
  })

  it("genera valores en [0, 1)", () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe("sampleLognormal", () => {
  it("con cv=0 devuelve exactamente la mediana", () => {
    const rng = mulberry32(1)
    expect(sampleLognormal(rng, 50, 0)).toBe(50)
  })

  it("con mediana <= 0 devuelve 0", () => {
    const rng = mulberry32(1)
    expect(sampleLognormal(rng, 0, 0.2)).toBe(0)
  })
})

describe("runMonteCarlo", () => {
  it("es determinista: misma semilla → resultado idéntico", () => {
    const scenario = createMonobathPreset()
    const a = runMonteCarlo(scenario, { seed: 123 })
    const b = runMonteCarlo(scenario, { seed: 123 })
    expect(a).toEqual(b)
  })

  it("semillas distintas producen medias distintas", () => {
    const scenario = createMonobathPreset()
    const a = runMonteCarlo(scenario, { seed: 1 })
    const b = runMonteCarlo(scenario, { seed: 999 })
    expect(a.throughput.mean).not.toBe(b.throughput.mean)
  })

  it("sin variabilidad (cv=0, failureRate=0) coincide con el motor determinista", () => {
    const scenario = createMonobathPreset()
    scenario.stations = scenario.stations.map((s) => ({ ...s, failureRate: 0 }))
    const result = runMonteCarlo(scenario, { cv: 0, runs: 100, seed: 5 })
    const deterministic = calculateThroughput(scenario)
    expect(result.throughput.min).toBe(deterministic)
    expect(result.throughput.max).toBe(deterministic)
  })

  it("los percentiles están ordenados y dentro de [min, max]", () => {
    const result = runMonteCarlo(createMonobathPreset(), { seed: 42 })
    const t = result.throughput
    expect(t.min).toBeLessThanOrEqual(t.p5)
    expect(t.p5).toBeLessThanOrEqual(t.median)
    expect(t.median).toBeLessThanOrEqual(t.p95)
    expect(t.p95).toBeLessThanOrEqual(t.max)
  })

  it("el histograma suma el total de ejecuciones", () => {
    const runs = 500
    const result = runMonteCarlo(createMonobathPreset(), { runs, seed: 42 })
    const total = result.histogram.reduce((acc, b) => acc + b.count, 0)
    expect(total).toBe(runs)
  })

  it("probabilityMeetDemand es 1 con demanda trivial y 0 con demanda imposible", () => {
    const scenario = createMonobathPreset()
    scenario.demandPerDay = 1
    expect(runMonteCarlo(scenario, { seed: 42 }).probabilityMeetDemand).toBe(1)
    scenario.demandPerDay = 100000
    expect(runMonteCarlo(scenario, { seed: 42 }).probabilityMeetDemand).toBe(0)
  })

  it("escenario sin estaciones devuelve resultados a cero sin NaN", () => {
    const result = runMonteCarlo(createEmptyScenario("Vacío"), { seed: 42 })
    expect(result.runs).toBe(0)
    expect(result.throughput.mean).toBe(0)
    expect(result.probabilityMeetDemand).toBe(0)
    expect(result.histogram).toEqual([])
  })
})
