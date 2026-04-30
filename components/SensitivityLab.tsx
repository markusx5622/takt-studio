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
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { Scenario, Station, KPIs } from "@/types"

// ─── Deep clone helper ─────────────────────────────────────────────────────────

function cloneScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    stations: scenario.stations.map((s) => ({ ...s })),
  }
}

// ─── Impact summary (refined) ──────────────────────────────────────────────────

function ImpactSummary({ baseKpis, labKpis }: { baseKpis: KPIs; labKpis: KPIs }) {
  const throughputDelta = labKpis.throughputPerDay - baseKpis.throughputPerDay
  const passedToMeet = !baseKpis.meetsDemand && labKpis.meetsDemand
  const lostMeeting = baseKpis.meetsDemand && !labKpis.meetsDemand
  const bnChanged = labKpis.bottleneckStationId !== baseKpis.bottleneckStationId
  const leadDelta = labKpis.leadTimeMin - baseKpis.leadTimeMin
  const balDelta = (labKpis.balancingEfficiency - baseKpis.balancingEfficiency) * 100

  let tone: "positive" | "negative" | "neutral" = "neutral"
  if (passedToMeet || throughputDelta >= 5) tone = "positive"
  else if (lostMeeting || throughputDelta <= -5) tone = "negative"

  const bgClass =
    tone === "positive"
      ? "border-green-200/60 bg-green-50/50"
      : tone === "negative"
        ? "border-red-200/60 bg-red-50/50"
        : "border-border bg-muted/20"

  const iconColor =
    tone === "positive" ? "text-green-600" : tone === "negative" ? "text-red-600" : "text-muted-foreground"

  const textColor =
    tone === "positive"
      ? "text-green-800"
      : tone === "negative"
        ? "text-red-800"
        : "text-foreground/80"

  const parts: string[] = []

  if (Math.abs(throughputDelta) >= 1) {
    parts.push(
      throughputDelta > 0
        ? `proyecta +${throughputDelta} uds/día`
        : `proyecta ${throughputDelta} uds/día`
    )
  }

  if (passedToMeet) parts.push("la línea pasa a cumplir la demanda")
  if (lostMeeting) parts.push("la línea deja de cumplir la demanda")

  if (!passedToMeet && !lostMeeting && Math.abs(leadDelta) >= 2) {
    parts.push(leadDelta < 0 ? `reduce el lead time en ${Math.abs(leadDelta).toFixed(1)} min` : `aumenta el lead time en ${leadDelta.toFixed(1)} min`)
  }

  if (!passedToMeet && !lostMeeting && Math.abs(balDelta) >= 3) {
    parts.push(balDelta > 0 ? `mejora el balanceo en ${balDelta.toFixed(1)} pp` : `empeora el balanceo en ${Math.abs(balDelta).toFixed(1)} pp`)
  }

  if (bnChanged) {
    parts.push(`el bottleneck pasa a ser ${labKpis.bottleneckStationName}`)
  }

  const sentence = parts.length > 0 ? `La simulación ${parts.join(", ")}.` : "La simulación no altera significativamente el sistema."

  return (
    <div className={cn("mb-3 rounded-lg border px-3 py-2.5", bgClass)}>
      <div className="flex items-start gap-2">
        {tone === "positive" ? (
          <TrendingUp className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
        ) : tone === "negative" ? (
          <TrendingDown className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
        ) : (
          <Minus className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
        )}
        <p className={cn("text-xs font-medium leading-snug", textColor)}>{sentence}</p>
      </div>
    </div>
  )
}

// ─── Primary KPI card ──────────────────────────────────────────────────────────

function PrimaryKpi({
  icon: Icon,
  label,
  current,
  projected,
  unit,
  format,
  better,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  current: number
  projected: number
  unit?: string
  format: (v: number) => string
  better: "higher" | "lower" | "none"
}) {
  const delta = projected - current
  const hasChange = Math.abs(delta) >= 0.01
  const isBetter =
    better === "higher" ? delta > 0 : better === "lower" ? delta < 0 : false
  const isWorse =
    better === "higher" ? delta < 0 : better === "lower" ? delta > 0 : false

  return (
    <div className="flex flex-col rounded-lg border bg-background p-3">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tabular-nums">{format(projected)}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">{format(current)} actual</span>
        {hasChange && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-bold",
              isBetter ? "text-green-600" : isWorse ? "text-red-600" : "text-muted-foreground"
            )}
          >
            {isBetter ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : isWorse ? (
              <ArrowDownRight className="h-2.5 w-2.5" />
            ) : null}
            {delta > 0 ? "+" : ""}
            {format(delta)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Secondary delta row ───────────────────────────────────────────────────────

function SecondaryDelta({
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
    <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground/70">{fmt(current)}</span>
        <span className="text-[10px] text-muted-foreground/40">→</span>
        <span className="text-xs font-semibold">{fmt(projected)}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        {hasChange && (
          <span
            className={cn(
              "text-[10px] font-semibold",
              isBetter ? "text-green-600" : isWorse ? "text-red-600" : "text-muted-foreground"
            )}
          >
            {delta > 0 ? "+" : ""}
            {fmt(delta)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Detail row (for accordion) ────────────────────────────────────────────────

function DetailRow({
  label,
  current,
  projected,
  unit,
  invert,
  decimals = 1,
  formatCustom,
}: {
  label: string
  current: number
  projected: number
  unit?: string
  invert?: boolean
  decimals?: number
  formatCustom?: (v: number) => string
}) {
  const delta = projected - current
  const isBetter = invert ? delta < 0 : delta > 0
  const isWorse = invert ? delta > 0 : delta < 0
  const hasChange = Math.abs(delta) >= 0.01

  const fmt =
    formatCustom ??
    ((v: number) => (decimals === 0 ? String(Math.round(v)) : v.toFixed(decimals)))

  return (
    <div className="flex items-center justify-between border-b border-border/40 px-2 py-1 last:border-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] tabular-nums text-muted-foreground/70">{fmt(current)}</span>
        <span className="text-[10px] text-muted-foreground/30">→</span>
        <span className="text-[11px] font-semibold tabular-nums">{fmt(projected)}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        {hasChange && (
          <span
            className={cn(
              "text-[10px] font-medium",
              isBetter ? "text-green-600" : isWorse ? "text-red-600" : "text-muted-foreground"
            )}
          >
            {delta > 0 ? "+" : ""}
            {fmt(delta)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── LabControl (refined) ──────────────────────────────────────────────────────

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
    <div
      className={cn(
        "rounded-lg border bg-muted/10 p-3 transition-opacity",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-foreground/80">{label}</span>
        <div className="flex items-center gap-1.5">
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
            className="h-7 w-14 rounded-md border bg-background px-1.5 text-right text-xs font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <div className="relative mt-2 h-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent focus:outline-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-sm"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%, hsl(var(--muted)) 100%)`,
            borderRadius: "9999px",
            height: "5px",
            marginTop: "5px",
          }}
        />
      </div>
    </div>
  )
}

// ─── Shift selector (refined) ──────────────────────────────────────────────────

function ShiftSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="rounded-lg border bg-muted/10 p-3">
      <span className="text-xs font-medium text-foreground/80">Turnos por día</span>
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "flex-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-all",
              value === n
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Station selector ──────────────────────────────────────────────────────────

function StationSelector({
  stations,
  value,
  onChange,
  baseBottleneckId,
}: {
  stations: Station[]
  value: string
  onChange: (id: string) => void
  baseBottleneckId?: string
}) {
  return (
    <div className="rounded-lg border bg-muted/10 p-3">
      <label className="text-xs font-medium text-foreground/80">Estación objetivo</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border bg-background px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {stations.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}{s.id === baseBottleneckId ? " (cuello de botella)" : ""}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[10px] text-muted-foreground/60">
        Por defecto se toma la estación crítica actual. Puedes cambiarla manualmente.
      </p>
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          <div className="space-y-3 md:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="space-y-2 md:col-span-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-muted" />
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
  const [targetStationId, setTargetStationId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // Sync labScenario AND fix targetStationId from ACTIVE scenario (stable)
  useEffect(() => {
    if (activeScenario) {
      setLabScenario(cloneScenario(activeScenario))
      const baseBn = findBottleneck(activeScenario.stations)
      setTargetStationId(baseBn.stationId)
    } else {
      setLabScenario(null)
      setTargetStationId(null)
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

  // Target station info from ACTIVE scenario (stable label)
  const targetStation = useMemo(() => {
    if (!targetStationId || !activeScenario) return null
    return activeScenario.stations.find((s) => s.id === targetStationId) ?? null
  }, [targetStationId, activeScenario])

  // Projected bottleneck from LAB (for results only)
  const projectedBottleneck = useMemo(() => {
    if (!labScenario || labScenario.stations.length === 0) return null
    return findBottleneck(labScenario.stations)
  }, [labScenario])

  const handleReset = useCallback(() => {
    if (activeScenario) {
      setLabScenario(cloneScenario(activeScenario))
      const baseBn = findBottleneck(activeScenario.stations)
      setTargetStationId(baseBn.stationId)
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

    const diffs: string[] = []
    if (scenarioChanges.demandPerDay !== undefined) diffs.push(`demanda ${labScenario.demandPerDay}`)
    if (scenarioChanges.shiftHours !== undefined) diffs.push(`horas ${labScenario.shiftHours}h`)
    if (scenarioChanges.shiftsPerDay !== undefined)
      diffs.push(`${labScenario.shiftsPerDay} turnos`)
    if (stationChanges.some((c) => c.updates.operators !== undefined)) {
      const st = targetStation?.name ?? "bottleneck"
      diffs.push(`+operarios en ${st}`)
    }
    if (stationChanges.some((c) => c.updates.failureRate !== undefined)) {
      const st = targetStation?.name ?? "bottleneck"
      diffs.push(`fallo ${(labScenario.stations.find((s) => s.id === targetStationId)?.failureRate ?? 0) * 100}% en ${st}`)
    }

    const suffix = diffs.length > 0 ? ` — ${diffs.join(", ")}` : " — laboratorio"

    createScenarioVariant(
      activeScenario.id,
      `${activeScenario.name}${suffix}`,
      stationChanges.length > 0 ? stationChanges : undefined,
      Object.keys(scenarioChanges).length > 0 ? scenarioChanges : undefined
    )
  }, [activeScenario, labScenario, targetStation, targetStationId, createScenarioVariant])

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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          {/* ── Controls ────────────────────────────────────────────────────── */}
          <div className="space-y-3 md:col-span-2">
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

            {activeScenario && targetStationId && (
              <StationSelector
                stations={activeScenario.stations}
                value={targetStationId}
                onChange={(id) => setTargetStationId(id)}
                baseBottleneckId={baseKpis?.bottleneckStationId}
              />
            )}

            {targetStation && (
              <LabControl
                label={`Operarios en ${targetStation.name}`}
                value={
                  labScenario.stations.find((s) => s.id === targetStationId)?.operators ??
                  targetStation.operators
                }
                min={1}
                max={8}
                step={1}
                onChange={(v) => {
                  setLabScenario((prev) => {
                    if (!prev || !targetStationId) return prev
                    return {
                      ...prev,
                      stations: prev.stations.map((s) =>
                        s.id === targetStationId ? { ...s, operators: v } : s
                      ),
                    }
                  })
                }}
              />
            )}

            {targetStation && (
              <LabControl
                label={`Tasa de fallo en ${targetStation.name}`}
                value={Math.round(
                  (labScenario.stations.find((s) => s.id === targetStationId)?.failureRate ??
                    targetStation.failureRate) * 100
                )}
                min={0}
                max={15}
                step={1}
                unit="%"
                onChange={(v) => {
                  setLabScenario((prev) => {
                    if (!prev || !targetStationId) return prev
                    return {
                      ...prev,
                      stations: prev.stations.map((s) =>
                        s.id === targetStationId ? { ...s, failureRate: v / 100 } : s
                      ),
                    }
                  })
                }}
              />
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleReset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restablecer
              </Button>
              <Button
                size="sm"
                className="ml-auto gap-1.5 text-xs shadow-sm transition-all hover:shadow-md"
                onClick={handleSave}
              >
                <Save className="h-3.5 w-3.5" />
                Guardar como escenario
              </Button>
            </div>
          </div>

          {/* ── Impact ──────────────────────────────────────────────────────── */}
          <div className="space-y-2 md:col-span-3">
            <ImpactSummary baseKpis={baseKpis} labKpis={labKpis} />

            {/* Primary KPIs */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <PrimaryKpi
                icon={TrendingUp}
                label="Throughput"
                current={baseKpis.throughputPerDay}
                projected={labKpis.throughputPerDay}
                unit="uds/día"
                format={(v) => String(Math.round(v))}
                better="higher"
              />
              <div className="flex flex-col rounded-lg border bg-background p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Demanda
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  {labKpis.meetsDemand ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-bold",
                      labKpis.meetsDemand ? "text-green-700" : "text-red-700"
                    )}
                  >
                    {labKpis.meetsDemand ? "Cumple" : "No cumple"}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    {baseKpis.meetsDemand ? "Cumple" : "No cumple"} actual
                  </span>
                  {labKpis.meetsDemand && !baseKpis.meetsDemand && (
                    <Badge variant="outline" className="bg-green-50 text-[9px] text-green-700">
                      +cumple
                    </Badge>
                  )}
                  {!labKpis.meetsDemand && baseKpis.meetsDemand && (
                    <Badge variant="outline" className="bg-red-50 text-[9px] text-red-700">
                      -cumple
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Bottleneck
                  </span>
                </div>
                <span className="truncate text-sm font-bold" title={labKpis.bottleneckStationName}>
                  {labKpis.bottleneckStationName}
                </span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {labKpis.bottleneckCycleMin.toFixed(1)} min
                  </span>
                  {labKpis.bottleneckStationId !== baseKpis.bottleneckStationId && (
                    <Badge variant="outline" className="text-[9px]">
                      Cambia
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Secondary KPIs */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Métricas secundarias
              </span>
              <SecondaryDelta
                label="Takt time"
                current={baseKpis.taktTimeMin}
                projected={labKpis.taktTimeMin}
                unit="min/ud"
                invert
                decimals={1}
              />
              <SecondaryDelta
                label="Eficiencia de balanceo"
                current={baseKpis.balancingEfficiency * 100}
                projected={labKpis.balancingEfficiency * 100}
                unit="%"
                decimals={1}
              />
              <SecondaryDelta
                label="Lead time"
                current={baseKpis.leadTimeMin}
                projected={labKpis.leadTimeMin}
                unit="min"
                invert
                decimals={1}
              />
            </div>

            {/* Detail accordion */}
            <div className="pt-1">
              <button
                onClick={() => setShowDetail((v) => !v)}
                className="flex w-full items-center justify-between rounded-md border bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40"
              >
                <span>{showDetail ? "Ocultar detalle técnico" : "Ver detalle técnico completo"}</span>
                {showDetail ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              {showDetail && (
                <div className="mt-1.5 rounded-md border bg-background px-2 py-1">
                  <DetailRow
                    label="Takt time"
                    current={baseKpis.taktTimeMin}
                    projected={labKpis.taktTimeMin}
                    unit="min/ud"
                    invert
                    decimals={1}
                  />
                  <DetailRow
                    label="Throughput"
                    current={baseKpis.throughputPerDay}
                    projected={labKpis.throughputPerDay}
                    unit="uds/día"
                    decimals={0}
                  />
                  <DetailRow
                    label="Tiempo disponible"
                    current={baseKpis.availableTimeMin}
                    projected={labKpis.availableTimeMin}
                    unit="min/día"
                    decimals={0}
                  />
                  <DetailRow
                    label="Eficiencia de balanceo"
                    current={baseKpis.balancingEfficiency * 100}
                    projected={labKpis.balancingEfficiency * 100}
                    unit="%"
                    decimals={1}
                  />
                  <DetailRow
                    label="Lead time"
                    current={baseKpis.leadTimeMin}
                    projected={labKpis.leadTimeMin}
                    unit="min"
                    invert
                    decimals={1}
                  />
                  <div className="flex items-center justify-between border-b border-border/40 px-2 py-1 last:border-0">
                    <span className="text-[11px] text-muted-foreground">Cuello de botella</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground/70">{baseKpis.bottleneckStationName}</span>
                      <span className="text-[10px] text-muted-foreground/30">→</span>
                      <span className="text-[11px] font-semibold">{labKpis.bottleneckStationName}</span>
                      {labKpis.bottleneckStationId !== baseKpis.bottleneckStationId && (
                        <span className="text-[10px] font-medium text-amber-600">cambia</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 px-2 py-1 last:border-0">
                    <span className="text-[11px] text-muted-foreground">Cumple demanda</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground/70">
                        {baseKpis.meetsDemand ? "Sí" : "No"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/30">→</span>
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          labKpis.meetsDemand ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {labKpis.meetsDemand ? "Sí" : "No"}
                      </span>
                    </div>
                  </div>
                  <DetailRow
                    label="Delta de demanda"
                    current={baseKpis.demandDelta}
                    projected={labKpis.demandDelta}
                    unit="uds"
                    decimals={0}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
