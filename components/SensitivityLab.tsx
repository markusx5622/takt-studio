"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs, findBottleneck } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  FlaskConical,
  RotateCcw,
  Save,
  AlertTriangle,
  CheckCircle2,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import type { Scenario, Station, KPIs } from "@/types"

// ─── Deep clone helper ─────────────────────────────────────────────────────────

function cloneScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    stations: scenario.stations.map((s) => ({ ...s })),
  }
}

// ─── Delta badge ───────────────────────────────────────────────────────────────

function DeltaRow({
  label,
  current,
  projected,
  unit,
  invert,
  decimals = 1,
}: {
  label: string
  current: number
  projected: number
  unit?: string
  invert?: boolean
  decimals?: number
}) {
  const delta = projected - current
  const isBetter = invert ? delta < 0 : delta > 0
  const isWorse = invert ? delta > 0 : delta < 0
  const hasChange = Math.abs(delta) >= 0.01

  const fmt = (v: number) =>
    decimals === 0 ? String(Math.round(v)) : v.toFixed(decimals)

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className="text-xs text-muted-foreground">{fmt(current)}</span>
        <span className="text-xs text-muted-foreground/50">→</span>
        <span className="text-sm font-semibold">{fmt(projected)}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        {hasChange && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-bold",
              isBetter ? "text-green-600" : isWorse ? "text-red-600" : "text-muted-foreground"
            )}
          >
            {isBetter ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : isWorse ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {delta > 0 ? "+" : ""}
            {fmt(delta)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Control slider ────────────────────────────────────────────────────────────

function LabControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
  disabled?: boolean
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0

  return (
    <div className={cn("space-y-1.5", disabled && "opacity-50 pointer-events-none")}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground/80">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
            }}
            className="h-7 w-16 rounded-md border bg-background px-1.5 text-right text-xs font-semibold tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <div className="relative h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent focus:outline-none"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%, hsl(var(--muted)) 100%)`,
            borderRadius: "9999px",
            height: "6px",
            marginTop: "7px",
          }}
        />
      </div>
    </div>
  )
}

// ─── Shift selector ────────────────────────────────────────────────────────────

function ShiftSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-foreground/80">Turnos por día</span>
      <div className="flex gap-2">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "flex-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition-all",
              value === n
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {n} turno{n > 1 ? "s" : ""}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SensitivityLabSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <div className="h-5 w-5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
          <div className="space-y-3 md:col-span-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SensitivityLab() {
  const hydrated = useHydrated()
  const activeScenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const createScenarioVariant = useTaktStore((s) => s.createScenarioVariant)

  const [labScenario, setLabScenario] = useState<Scenario | null>(null)

  // Sync labScenario when active scenario changes
  useEffect(() => {
    if (activeScenario) {
      setLabScenario(cloneScenario(activeScenario))
    } else {
      setLabScenario(null)
    }
  }, [activeScenario?.id])

  const baseKpis = useMemo(() => {
    if (!activeScenario || activeScenario.stations.length === 0) return null
    return calculateAllKPIs(activeScenario)
  }, [activeScenario])

  const labKpis = useMemo(() => {
    if (!labScenario || labScenario.stations.length === 0) return null
    return calculateAllKPIs(labScenario)
  }, [labScenario])

  const bottleneck = useMemo(() => {
    if (!labScenario || labScenario.stations.length === 0) return null
    return findBottleneck(labScenario.stations)
  }, [labScenario])

  const bottleneckStation = useMemo(() => {
    if (!bottleneck?.stationId || !labScenario) return null
    return labScenario.stations.find((s) => s.id === bottleneck.stationId) ?? null
  }, [bottleneck, labScenario])

  const handleReset = useCallback(() => {
    if (activeScenario) {
      setLabScenario(cloneScenario(activeScenario))
    }
  }, [activeScenario])

  const handleSave = useCallback(() => {
    if (!activeScenario || !labScenario) return

    const stationChanges: { originalStationId: string; updates: Partial<Omit<Station, "id">> }[] =
      []

    labScenario.stations.forEach((labSt, i) => {
      const origSt = activeScenario.stations[i]
      if (!origSt) return
      const updates: Partial<Omit<Station, "id">> = {}
      if (labSt.operators !== origSt.operators) updates.operators = labSt.operators
      if (labSt.failureRate !== origSt.failureRate) updates.failureRate = labSt.failureRate
      if (Object.keys(updates).length > 0) {
        stationChanges.push({ originalStationId: origSt.id, updates })
      }
    })

    const scenarioChanges: Partial<Pick<Scenario, "demandPerDay" | "shiftHours" | "shiftsPerDay">> =
      {}
    if (labScenario.demandPerDay !== activeScenario.demandPerDay)
      scenarioChanges.demandPerDay = labScenario.demandPerDay
    if (labScenario.shiftHours !== activeScenario.shiftHours)
      scenarioChanges.shiftHours = labScenario.shiftHours
    if (labScenario.shiftsPerDay !== activeScenario.shiftsPerDay)
      scenarioChanges.shiftsPerDay = labScenario.shiftsPerDay

    // Use a more specific name if only one thing changed
    const diffs: string[] = []
    if (scenarioChanges.demandPerDay !== undefined) diffs.push(`demanda ${labScenario.demandPerDay}`)
    if (scenarioChanges.shiftHours !== undefined) diffs.push(`horas ${labScenario.shiftHours}h`)
    if (scenarioChanges.shiftsPerDay !== undefined)
      diffs.push(`${labScenario.shiftsPerDay} turnos`)
    if (stationChanges.some((c) => c.updates.operators !== undefined)) {
      const st = bottleneckStation?.name ?? "bottleneck"
      diffs.push(`+operarios en ${st}`)
    }
    if (stationChanges.some((c) => c.updates.failureRate !== undefined)) {
      const st = bottleneckStation?.name ?? "bottleneck"
      diffs.push(`fallo ${labScenario.stations.find((s) => s.id === bottleneck?.stationId)?.failureRate ?? 0}% en ${st}`)
    }

    const suffix = diffs.length > 0 ? ` — ${diffs.join(", ")}` : " — laboratorio"

    createScenarioVariant(
      activeScenario.id,
      `${activeScenario.name}${suffix}`,
      stationChanges.length > 0 ? stationChanges : undefined,
      Object.keys(scenarioChanges).length > 0 ? scenarioChanges : undefined
    )
  }, [activeScenario, labScenario, bottleneckStation, bottleneck, createScenarioVariant])

  if (!hydrated) return <SensitivityLabSkeleton />

  if (!activeScenario || activeScenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <FlaskConical className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Laboratorio de sensibilidad</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Define la línea para explorar sensibilidad
          </p>
          <p className="text-xs text-muted-foreground/60">
            Añade estaciones y parámetros para probar diferentes configuraciones sin alterar el escenario actual.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!labScenario || !baseKpis || !labKpis) return <SensitivityLabSkeleton />

  const demandMax = Math.max(50, activeScenario.demandPerDay * 3)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <FlaskConical className="h-5 w-5 text-primary" aria-hidden />
        <div>
          <CardTitle className="text-lg">Laboratorio de sensibilidad</CardTitle>
          <CardDescription className="text-xs">
            Explora cómo responde la línea al variar demanda, turnos y capacidad crítica sin alterar el escenario actual
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {/* ── Controls column ───────────────────────────────────────────── */}
          <div className="space-y-5 md:col-span-2">
            <LabControl
              label="Demanda diaria"
              value={labScenario.demandPerDay}
              min={1}
              max={demandMax}
              step={1}
              unit="uds"
              onChange={(v) =>
                setLabScenario((prev) => (prev ? { ...prev, demandPerDay: v } : prev))
              }
            />

            <LabControl
              label="Horas por turno"
              value={labScenario.shiftHours}
              min={1}
              max={12}
              step={0.5}
              unit="h"
              onChange={(v) =>
                setLabScenario((prev) => (prev ? { ...prev, shiftHours: v } : prev))
              }
            />

            <ShiftSelector
              value={labScenario.shiftsPerDay}
              onChange={(v) =>
                setLabScenario((prev) => (prev ? { ...prev, shiftsPerDay: v } : prev))
              }
            />

            {bottleneckStation && (
              <LabControl
                label={`Operarios en ${bottleneckStation.name}`}
                value={bottleneckStation.operators}
                min={1}
                max={8}
                step={1}
                onChange={(v) => {
                  setLabScenario((prev) => {
                    if (!prev) return prev
                    return {
                      ...prev,
                      stations: prev.stations.map((s) =>
                        s.id === bottleneckStation.id ? { ...s, operators: v } : s
                      ),
                    }
                  })
                }}
              />
            )}

            {bottleneckStation && (
              <LabControl
                label={`Tasa de fallo en ${bottleneckStation.name}`}
                value={Math.round(bottleneckStation.failureRate * 100)}
                min={0}
                max={15}
                step={1}
                unit="%"
                onChange={(v) => {
                  setLabScenario((prev) => {
                    if (!prev) return prev
                    return {
                      ...prev,
                      stations: prev.stations.map((s) =>
                        s.id === bottleneckStation.id
                          ? { ...s, failureRate: v / 100 }
                          : s
                      ),
                    }
                  })
                }}
              />
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleReset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restablecer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1.5 text-xs transition-all hover:bg-muted hover:border-foreground/20"
                onClick={handleSave}
              >
                <Save className="h-3.5 w-3.5" />
                Guardar como escenario
              </Button>
            </div>
          </div>

          {/* ── KPI comparison column ─────────────────────────────────────── */}
          <div className="space-y-2.5 md:col-span-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Comparación de KPIs
              </span>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Mejora
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Empeora
                </span>
              </div>
            </div>

            <DeltaRow
              label="Takt time"
              current={baseKpis.taktTimeMin}
              projected={labKpis.taktTimeMin}
              unit="min/ud"
              invert
              decimals={1}
            />
            <DeltaRow
              label="Throughput"
              current={baseKpis.throughputPerDay}
              projected={labKpis.throughputPerDay}
              unit="uds/día"
              decimals={0}
            />
            <DeltaRow
              label="Eficiencia de balanceo"
              current={baseKpis.balancingEfficiency * 100}
              projected={labKpis.balancingEfficiency * 100}
              unit="%"
              decimals={1}
            />
            <DeltaRow
              label="Lead time"
              current={baseKpis.leadTimeMin}
              projected={labKpis.leadTimeMin}
              unit="min"
              invert
              decimals={1}
            />

            {/* Demand status */}
            <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">Cumplimiento de demanda</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {baseKpis.meetsDemand ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {baseKpis.meetsDemand ? "Cumple" : "No cumple"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground/40">→</span>
                <div className="flex items-center gap-1.5">
                  {labKpis.meetsDemand ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      labKpis.meetsDemand ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {labKpis.meetsDemand ? "Cumple" : "No cumple"}
                  </span>
                  {labKpis.meetsDemand && !baseKpis.meetsDemand && (
                    <Badge variant="outline" className="bg-green-50 text-[10px] text-green-700">
                      Pasa a cumplir
                    </Badge>
                  )}
                  {!labKpis.meetsDemand && baseKpis.meetsDemand && (
                    <Badge variant="outline" className="bg-red-50 text-[10px] text-red-700">
                      Deja de cumplir
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Bottleneck */}
            <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">Cuello de botella</span>
              <div className="text-right">
                <span className="text-xs font-semibold">{labKpis.bottleneckStationName}</span>
                <span className="ml-1.5 text-[10px] text-muted-foreground">
                  {labKpis.bottleneckCycleMin.toFixed(1)} min
                </span>
                {labKpis.bottleneckStationId !== baseKpis.bottleneckStationId && (
                  <Badge variant="outline" className="ml-2 text-[10px]">
                    Cambia
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
