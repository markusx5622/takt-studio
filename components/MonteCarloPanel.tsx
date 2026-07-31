"use client"

import { useMemo, useState } from "react"
import { useTaktStore, useHydrated } from "@/lib/store"
import { runMonteCarlo } from "@/lib/monte-carlo"
import { calculateThroughput } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Dices, Gauge, ShieldCheck, ShieldAlert } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { MonteCarloResult } from "@/types"

const RUNS = 2000
const CV_OPTIONS = [
  { value: 0.05, label: "Baja (5%)" },
  { value: 0.1, label: "Media (10%)" },
  { value: 0.2, label: "Alta (20%)" },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MonteCarloSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="h-6 w-64 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

// ─── Tooltip del histograma ────────────────────────────────────────────────────

interface HistogramTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { range: string; count: number } }>
}

function HistogramTooltip({ active, payload }: HistogramTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="rounded-md border bg-background p-3 text-xs shadow-md">
      <p className="font-semibold">{d.range} uds/día</p>
      <p className="text-muted-foreground">{d.count} ejecuciones</p>
    </div>
  )
}

// ─── Panel principal ───────────────────────────────────────────────────────────

export default function MonteCarloPanel() {
  const hydrated = useHydrated()
  const scenario = useTaktStore((s) =>
    s.scenarios.find((sc) => sc.id === s.activeScenarioId)
  )
  const [cv, setCv] = useState(0.1)
  const [seed, setSeed] = useState(42)

  const result = useMemo<MonteCarloResult | null>(() => {
    if (!scenario || scenario.stations.length === 0) return null
    return runMonteCarlo(scenario, { runs: RUNS, cv, seed })
  }, [scenario, cv, seed])

  const deterministic = useMemo(
    () => (scenario ? calculateThroughput(scenario) : 0),
    [scenario]
  )

  if (!hydrated) return <MonteCarloSkeleton />
  if (!scenario || !result) return null

  const prob = result.probabilityMeetDemand
  const meets = prob >= 0.95
  const histogramData = result.histogram.map((b) => ({
    range: b.binStart === b.binEnd ? `${b.binStart}` : `${b.binStart}–${b.binEnd}`,
    count: b.count,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              Simulación Monte Carlo
            </CardTitle>
            <CardDescription>
              {RUNS.toLocaleString("es-ES")} ejecuciones · tiempos lognormales · reprocesos
              Bernoulli · semilla {seed} (resultados reproducibles)
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Variabilidad:</span>
            {CV_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={cv === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCv(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setSeed((s) => s + 1)}>
              <Dices className="mr-2 h-4 w-4" />
              Re-ejecutar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI principal + percentiles */}
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              P(cumplir demanda)
            </p>
            <p className={cn("text-4xl font-bold", meets ? "text-emerald-600" : "text-red-600")}>
              {(prob * 100).toFixed(1)}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            {meets ? (
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-600" />
            )}
            <p className="max-w-xs text-sm text-muted-foreground">
              {meets
                ? "La línea cubre la demanda diaria con alta confianza estadística."
                : "Existe riesgo real de no cubrir la demanda diaria. Considera aplicar las mejoras propuestas."}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Badge variant="secondary">p5: {result.throughput.p5.toFixed(0)} uds</Badge>
            <Badge variant="secondary">p50: {result.throughput.median.toFixed(0)} uds</Badge>
            <Badge variant="secondary">p95: {result.throughput.p95.toFixed(0)} uds</Badge>
            <Badge variant="outline">Determinista: {deterministic} uds</Badge>
          </div>
        </div>

        {/* Histograma */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip content={<HistogramTooltip />} />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground">
          Demanda diaria: {result.demandPerDay} uds. El histograma muestra la distribución del
          throughput diario simulado; el valor determinista corresponde al escenario base sin
          variabilidad (mediana de la distribución, sin reprocesos aleatorios).
        </p>
      </CardContent>
    </Card>
  )
}
