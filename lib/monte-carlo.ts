import type {
  Scenario,
  MonteCarloOptions,
  MonteCarloResult,
  HistogramBin,
} from "@/types"

const DEFAULT_RUNS = 2000
const DEFAULT_CV = 0.1
const DEFAULT_SEED = 42
const HISTOGRAM_BINS = 12

/** PRNG determinista (mulberry32): misma semilla → misma secuencia. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Muestreo normal estándar (Box-Muller) con un RNG dado. */
function sampleStandardNormal(rng: () => number): number {
  let u = 0
  while (u === 0) u = rng()
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/**
 * Muestrea un tiempo de ciclo desde una lognormal cuya MEDIANA es el tiempo nominal
 * y cuyo coeficiente de variación es `cv`. sigma² = ln(1 + cv²); mu = ln(mediana).
 */
export function sampleLognormal(rng: () => number, median: number, cv: number): number {
  if (median <= 0) return 0
  if (cv <= 0) return median
  const sigma = Math.sqrt(Math.log(1 + cv * cv))
  const mu = Math.log(median)
  return Math.exp(mu + sigma * sampleStandardNormal(rng))
}

/**
 * Simula un día de producción: muestrea el tiempo efectivo de cada estación
 * (lognormal + reproceso Bernoulli que duplica el tiempo) y calcula el throughput
 * como floor(tiempo disponible / cuello de botella muestreado).
 */
function simulateRun(scenario: Scenario, rng: () => number, cv: number): number {
  const availableTimeMin = scenario.shiftHours * 60 * scenario.shiftsPerDay
  let bottleneckMin = 0
  for (const station of scenario.stations) {
    if (station.operators <= 0) return 0
    const baseSample = sampleLognormal(rng, station.cycleTimeMin, cv)
    const rework = rng() < station.failureRate ? 1 : 0
    const effectiveMin = (baseSample / station.operators) * (1 + rework)
    if (effectiveMin > bottleneckMin) bottleneckMin = effectiveMin
  }
  if (bottleneckMin <= 0 || !isFinite(bottleneckMin)) return 0
  return Math.floor(availableTimeMin / bottleneckMin)
}

/** Percentil con interpolación lineal sobre la muestra ordenada. */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

/** Histograma de frecuencias sobre los valores enteros de throughput. */
function buildHistogram(samples: number[]): HistogramBin[] {
  if (samples.length === 0) return []
  const min = Math.min(...samples)
  const max = Math.max(...samples)
  if (min === max) return [{ binStart: min, binEnd: max, count: samples.length }]
  const binCount = Math.min(HISTOGRAM_BINS, max - min)
  const width = (max - min + 1) / binCount
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    binStart: Math.floor(min + i * width),
    binEnd: Math.floor(min + (i + 1) * width) - 1,
    count: 0,
  }))
  bins[binCount - 1].binEnd = max
  for (const s of samples) {
    let idx = Math.floor((s - min) / width)
    if (idx >= binCount) idx = binCount - 1
    bins[idx].count++
  }
  return bins
}

/**
 * Ejecuta la simulación Monte Carlo del escenario.
 * Determinista: mismas opciones (incluida la semilla) → resultado idéntico.
 */
export function runMonteCarlo(
  scenario: Scenario,
  options: MonteCarloOptions = {}
): MonteCarloResult {
  const runs = options.runs ?? DEFAULT_RUNS
  const cv = options.cv ?? DEFAULT_CV
  const seed = options.seed ?? DEFAULT_SEED

  const samples: number[] = []
  if (scenario.stations.length > 0 && runs > 0) {
    const rng = mulberry32(seed)
    for (let i = 0; i < runs; i++) samples.push(simulateRun(scenario, rng, cv))
  }

  const sorted = [...samples].sort((a, b) => a - b)
  const sum = samples.reduce((acc, s) => acc + s, 0)
  const meets = samples.filter((s) => s >= scenario.demandPerDay).length

  return {
    runs: samples.length,
    cv,
    seed,
    demandPerDay: scenario.demandPerDay,
    throughput: {
      min: sorted[0] ?? 0,
      p5: percentile(sorted, 0.05),
      p25: percentile(sorted, 0.25),
      mean: samples.length > 0 ? sum / samples.length : 0,
      median: percentile(sorted, 0.5),
      p75: percentile(sorted, 0.75),
      p95: percentile(sorted, 0.95),
      max: sorted[sorted.length - 1] ?? 0,
    },
    probabilityMeetDemand: samples.length > 0 ? meets / samples.length : 0,
    histogram: buildHistogram(samples),
  }
}
