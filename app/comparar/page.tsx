"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  Copy,
  TrendingUp,
  Clock,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { KPIs, Scenario } from "@/types"

// Dynamic imports for browser-only Recharts components
const TaktChart = dynamic(() => import("@/components/TaktChart"), { ssr: false })
const LineDiagram = dynamic(() => import("@/components/LineDiagram"), { ssr: false })

// ─── Scenario selector ─────────────────────────────────────────────────────────

function ScenarioSelect({
  label,
  value,
  onChange,
  scenarios,
}: {
  label: string
  value: string
  onChange: (id: string) => void
  scenarios: Scenario[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {scenarios.map((sc) => (
          <option key={sc.id} value={sc.id}>
            {sc.name}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Delta badge ───────────────────────────────────────────────────────────────

function DeltaBadge({
  delta,
  higherIsBetter,
  fmt,
}: {
  delta: number
  higherIsBetter: boolean
  fmt: (v: number) => string
}) {
  if (Math.abs(delta) < 0.01) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        Sin cambio
      </span>
    )
  }

  const isImprovement = higherIsBetter ? delta > 0 : delta < 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isImprovement ? "text-green-600" : "text-red-600"
      )}
    >
      {isImprovement ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {delta > 0 ? "+" : ""}
      {fmt(delta)}
    </span>
  )
}

// ─── Mini KPIs ─────────────────────────────────────────────────────────────────

function MiniKpis({ kpis }: { kpis: KPIs }) {
  const effPct = kpis.balancingEfficiency * 100
  const bottleneckExceedsTakt = kpis.bottleneckCycleMin > kpis.taktTimeMin

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Takt Time
          </div>
          <p className="mt-1 text-xl font-bold">{kpis.taktTimeMin.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">min/ud</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            Throughput
          </div>
          <p
            className={cn(
              "mt-1 text-xl font-bold",
              kpis.meetsDemand ? "text-green-600" : "text-red-600"
            )}
          >
            {kpis.throughputPerDay}
          </p>
          <p className="text-[10px] text-muted-foreground">uds/día</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            Cuello de botella
          </div>
          <p className="mt-1 truncate text-sm font-bold" title={kpis.bottleneckStationName}>
            {kpis.bottleneckStationName || "—"}
          </p>
          <div className="mt-1">
            {bottleneckExceedsTakt ? (
              <Badge variant="destructive" className="text-[10px]">
                Excede Takt
              </Badge>
            ) : (
              <Badge variant="success" className="text-[10px]">
                OK
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3" />
            Balanceo
          </div>
          <p className="mt-1 text-xl font-bold">{effPct.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">%</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Comparison table ──────────────────────────────────────────────────────────

interface TableRow {
  label: string
  a: string
  b: string
  delta: number
  higherIsBetter: boolean
  fmtDelta: (v: number) => string
}

function buildRows(kpisA: KPIs, kpisB: KPIs): TableRow[] {
  return [
    {
      label: "Takt Time (min/ud)",
      a: kpisA.taktTimeMin.toFixed(2),
      b: kpisB.taktTimeMin.toFixed(2),
      delta: kpisB.taktTimeMin - kpisA.taktTimeMin,
      higherIsBetter: false,
      fmtDelta: (v) => `${Math.abs(v).toFixed(2)} min`,
    },
    {
      label: "Throughput (uds/día)",
      a: String(kpisA.throughputPerDay),
      b: String(kpisB.throughputPerDay),
      delta: kpisB.throughputPerDay - kpisA.throughputPerDay,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(Math.round(v))} uds`,
    },
    {
      label: "Cuello de botella (min/ud)",
      a: kpisA.bottleneckCycleMin.toFixed(2),
      b: kpisB.bottleneckCycleMin.toFixed(2),
      delta: kpisB.bottleneckCycleMin - kpisA.bottleneckCycleMin,
      higherIsBetter: false,
      fmtDelta: (v) => `${Math.abs(v).toFixed(2)} min`,
    },
    {
      label: "Lead Time (min)",
      a: kpisA.leadTimeMin.toFixed(1),
      b: kpisB.leadTimeMin.toFixed(1),
      delta: kpisB.leadTimeMin - kpisA.leadTimeMin,
      higherIsBetter: false,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} min`,
    },
    {
      label: "Eficiencia de balanceo",
      a: `${(kpisA.balancingEfficiency * 100).toFixed(1)}%`,
      b: `${(kpisB.balancingEfficiency * 100).toFixed(1)}%`,
      delta: (kpisB.balancingEfficiency - kpisA.balancingEfficiency) * 100,
      higherIsBetter: true,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} pp`,
    },
    {
      label: "Tiempo total ciclo (min)",
      a: kpisA.totalCycleMin.toFixed(1),
      b: kpisB.totalCycleMin.toFixed(1),
      delta: kpisB.totalCycleMin - kpisA.totalCycleMin,
      higherIsBetter: false,
      fmtDelta: (v) => `${Math.abs(v).toFixed(1)} min`,
    },
  ]
}

function ComparisonTable({
  kpisA,
  kpisB,
  nameA,
  nameB,
}: {
  kpisA: KPIs
  kpisB: KPIs
  nameA: string
  nameB: string
}) {
  const rows = buildRows(kpisA, kpisB)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Tabla comparativa</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  Métrica
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  A
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  B
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                  Δ (B − A)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn("border-b last:border-0", i % 2 === 0 ? "bg-background" : "bg-muted/20")}
                >
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.label}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{row.a}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{row.b}</td>
                  <td className="px-4 py-2.5 text-right">
                    <DeltaBadge
                      delta={row.delta}
                      higherIsBetter={row.higherIsBetter}
                      fmt={row.fmtDelta}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CompararPage() {
  const hydrated = useHydrated()
  const scenarios = useTaktStore((state) => state.scenarios)
  const compareAId = useTaktStore((state) => state.compareScenarioAId)
  const compareBId = useTaktStore((state) => state.compareScenarioBId)
  const setCompareA = useTaktStore((state) => state.setCompareA)
  const setCompareB = useTaktStore((state) => state.setCompareB)

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (scenarios.length < 2) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Comparar escenarios</h1>
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              Necesitas al menos 2 escenarios para comparar.
            </p>
            <Button asChild>
              <Link href="/simulador">Ir al simulador</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const scenarioA = scenarios.find((s) => s.id === compareAId) ?? scenarios[0]
  const scenarioB = scenarios.find((s) => s.id === compareBId) ?? scenarios[1]
  const sameScenario = scenarioA.id === scenarioB.id

  const kpisA = calculateAllKPIs(scenarioA)
  const kpisB = calculateAllKPIs(scenarioB)

  function handleDuplicateAtoB() {
    const store = useTaktStore.getState()
    const original = store.scenarios.find((s) => s.id === compareAId)
    if (!original) return
    store.duplicateScenario(compareAId, `${original.name} (copia)`)
    const newId = useTaktStore.getState().activeScenarioId
    useTaktStore.getState().setCompareB(newId)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">Comparar escenarios</h1>

      {/* Selectors */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="flex-1">
              <ScenarioSelect
                label="Escenario A"
                value={scenarioA.id}
                onChange={setCompareA}
                scenarios={scenarios}
              />
            </div>

            <div className="flex shrink-0 items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicateAtoB}
                className="gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicar A en B
              </Button>
            </div>

            <div className="flex-1">
              <ScenarioSelect
                label="Escenario B"
                value={scenarioB.id}
                onChange={setCompareB}
                scenarios={scenarios}
              />
            </div>
          </div>

          {sameScenario && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Estás comparando el mismo escenario consigo mismo. Selecciona dos escenarios
              distintos o usa &ldquo;Duplicar A en B&rdquo;.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mini KPIs + charts side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              A
            </span>
            <span className="truncate text-sm font-semibold" title={scenarioA.name}>
              {scenarioA.name}
            </span>
          </div>
          <MiniKpis kpis={kpisA} />
          <TaktChart scenarioId={scenarioA.id} height={250} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
              B
            </span>
            <span className="truncate text-sm font-semibold" title={scenarioB.name}>
              {scenarioB.name}
            </span>
          </div>
          <MiniKpis kpis={kpisB} />
          <TaktChart scenarioId={scenarioB.id} height={250} />
        </div>
      </div>

      {/* Line diagrams */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LineDiagram scenarioId={scenarioA.id} />
        <LineDiagram scenarioId={scenarioB.id} />
      </div>

      {/* Comparison table */}
      <ComparisonTable
        kpisA={kpisA}
        kpisB={kpisB}
        nameA={scenarioA.name}
        nameB={scenarioB.name}
      />
    </div>
  )
}
