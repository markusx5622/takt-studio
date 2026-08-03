"use client"

import { useState, useMemo, useCallback } from "react"
import { useTranslations } from "next-intl"
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
  ArrowDownRight,
  Gauge,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { Scenario, Station } from "@/types"
import ImpactSummary from "@/components/sensitivity/ImpactSummary"
import PrimaryKpi from "@/components/sensitivity/PrimaryKpi"
import SecondaryDelta from "@/components/sensitivity/SecondaryDelta"
import DetailRow from "@/components/sensitivity/DetailRow"
import LabControl from "@/components/sensitivity/LabControl"
import ShiftSelector from "@/components/sensitivity/ShiftSelector"
import StationSelector from "@/components/sensitivity/StationSelector"
import SensitivityLabSkeleton from "@/components/sensitivity/SensitivityLabSkeleton"

// ─── Deep clone helper ─────────────────────────────────────────────────────────

function cloneScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    stations: scenario.stations.map((s) => ({ ...s })),
  }
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SensitivityLab() {
  const t = useTranslations("simulator.lab")
  const hydrated = useHydrated()
  const activeScenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const createScenarioVariant = useTaktStore((s) => s.createScenarioVariant)

  const [labScenario, setLabScenario] = useState<Scenario | null>(null)
  const [targetStationId, setTargetStationId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // Sync labScenario AND fix targetStationId from ACTIVE scenario (stable).
  // Patrón "adjust state during render" (react.dev): mismo comportamiento, sin efecto.
  const [syncedScenarioId, setSyncedScenarioId] = useState<string | null>(null)
  if ((activeScenario?.id ?? null) !== syncedScenarioId) {
    setSyncedScenarioId(activeScenario?.id ?? null)
    if (activeScenario) {
      setLabScenario(cloneScenario(activeScenario))
      setTargetStationId(findBottleneck(activeScenario.stations).stationId)
    } else {
      setLabScenario(null)
      setTargetStationId(null)
    }
  }

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
    if (scenarioChanges.demandPerDay !== undefined)
      diffs.push(t("diffDemand", { value: labScenario.demandPerDay }))
    if (scenarioChanges.shiftHours !== undefined)
      diffs.push(t("diffHours", { value: labScenario.shiftHours }))
    if (scenarioChanges.shiftsPerDay !== undefined)
      diffs.push(t("diffShifts", { count: labScenario.shiftsPerDay }))
    if (stationChanges.some((c) => c.updates.operators !== undefined)) {
      const st = targetStation?.name ?? "bottleneck"
      diffs.push(t("diffOperators", { name: st }))
    }
    if (stationChanges.some((c) => c.updates.failureRate !== undefined)) {
      const st = targetStation?.name ?? "bottleneck"
      diffs.push(
        t("diffFailure", {
          pct: (labScenario.stations.find((s) => s.id === targetStationId)?.failureRate ?? 0) * 100,
          name: st,
        })
      )
    }

    const suffix = diffs.length > 0 ? ` — ${diffs.join(", ")}` : t("saveSuffix")

    createScenarioVariant(
      activeScenario.id,
      `${activeScenario.name}${suffix}`,
      stationChanges.length > 0 ? stationChanges : undefined,
      Object.keys(scenarioChanges).length > 0 ? scenarioChanges : undefined
    )
  }, [activeScenario, labScenario, targetStation, targetStationId, createScenarioVariant, t])

  if (!hydrated) return <SensitivityLabSkeleton />

  if (!activeScenario || activeScenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <FlaskConical className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {t("emptyTitle")}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {t("emptySubtitle")}
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
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <CardDescription className="text-xs">
            {t("description")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          {/* ── Controls ────────────────────────────────────────────────────── */}
          <div className="space-y-3 md:col-span-2">
            <LabControl
              label={t("dailyDemand")}
              value={labScenario.demandPerDay}
              min={1}
              max={demandMax}
              step={1}
              unit={t("unitsUds")}
              onChange={(v) =>
                setLabScenario((prev) => (prev ? { ...prev, demandPerDay: v } : prev))
              }
            />

            <LabControl
              label={t("hoursPerShift")}
              value={labScenario.shiftHours}
              min={1}
              max={12}
              step={0.5}
              unit={t("unitsH")}
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

            {activeScenario && targetStationId && baseKpis && (
              <StationSelector
                stations={activeScenario.stations}
                value={targetStationId}
                onChange={(id) => setTargetStationId(id)}
                baseBottleneckId={baseKpis.bottleneckStationId}
                onSelectBaseBottleneck={() => {
                  setTargetStationId(baseKpis.bottleneckStationId)
                }}
                isBaseBottleneckSelected={targetStationId === baseKpis.bottleneckStationId}
              />
            )}

            {targetStation && (
              <LabControl
                label={t("operatorsIn", { name: targetStation.name })}
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
                label={t("failureIn", { name: targetStation.name })}
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
                {t("reset")}
              </Button>
              <Button
                size="sm"
                className="ml-auto gap-1.5 text-xs shadow-sm transition-all hover:shadow-md"
                onClick={handleSave}
              >
                <Save className="h-3.5 w-3.5" />
                {t("save")}
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
                label={t("throughput")}
                current={baseKpis.throughputPerDay}
                projected={labKpis.throughputPerDay}
                unit={t("unitsPerDay")}
                format={(v) => String(Math.round(v))}
                better="higher"
              />
              <div className="flex flex-col rounded-lg border bg-background p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("demand")}
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
                    {labKpis.meetsDemand ? t("meets") : t("notMeets")}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    {baseKpis.meetsDemand ? t("meets") : t("notMeets")} {t("currentSuffix")}
                  </span>
                  {labKpis.meetsDemand && !baseKpis.meetsDemand && (
                    <Badge variant="outline" className="bg-green-50 text-[10px] text-green-700">
                      {t("nowMeets")}
                    </Badge>
                  )}
                  {!labKpis.meetsDemand && baseKpis.meetsDemand && (
                    <Badge variant="outline" className="bg-red-50 text-[10px] text-red-700">
                      {t("lostMeets")}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("bottleneck")}
                  </span>
                </div>
                <span className="truncate text-sm font-bold" title={labKpis.bottleneckStationName}>
                  {labKpis.bottleneckStationName}
                </span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {labKpis.bottleneckCycleMin.toFixed(1)} {t("minUnit")}
                  </span>
                  {labKpis.bottleneckStationId !== baseKpis.bottleneckStationId && (
                    <Badge variant="outline" className="text-[10px]">
                      {t("changes")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Secondary KPIs */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t("secondaryMetrics")}
              </span>
              <SecondaryDelta
                label={t("taktTime")}
                current={baseKpis.taktTimeMin}
                projected={labKpis.taktTimeMin}
                unit={t("minPerUnit")}
                invert
                decimals={1}
              />
              <SecondaryDelta
                label={t("balancingEfficiency")}
                current={baseKpis.balancingEfficiency * 100}
                projected={labKpis.balancingEfficiency * 100}
                unit="%"
                decimals={1}
              />
              <SecondaryDelta
                label={t("leadTime")}
                current={baseKpis.leadTimeMin}
                projected={labKpis.leadTimeMin}
                unit={t("minUnit")}
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
                <span>{showDetail ? t("hideDetail") : t("showDetail")}</span>
                {showDetail ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              {showDetail && (
                <div className="mt-1.5 rounded-md border bg-background px-2 py-1">
                  <DetailRow
                    label={t("taktTime")}
                    current={baseKpis.taktTimeMin}
                    projected={labKpis.taktTimeMin}
                    unit={t("minPerUnit")}
                    invert
                    decimals={1}
                  />
                  <DetailRow
                    label={t("throughput")}
                    current={baseKpis.throughputPerDay}
                    projected={labKpis.throughputPerDay}
                    unit={t("unitsPerDay")}
                    decimals={0}
                  />
                  <DetailRow
                    label={t("availableTime")}
                    current={baseKpis.availableTimeMin}
                    projected={labKpis.availableTimeMin}
                    unit={t("minPerDay")}
                    decimals={0}
                  />
                  <DetailRow
                    label={t("balancingEfficiency")}
                    current={baseKpis.balancingEfficiency * 100}
                    projected={labKpis.balancingEfficiency * 100}
                    unit="%"
                    decimals={1}
                  />
                  <DetailRow
                    label={t("leadTime")}
                    current={baseKpis.leadTimeMin}
                    projected={labKpis.leadTimeMin}
                    unit={t("minUnit")}
                    invert
                    decimals={1}
                  />
                  <div className="flex items-center justify-between border-b border-border/40 px-2 py-1 last:border-0">
                    <span className="text-[11px] text-muted-foreground">{t("bottleneckLabel")}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground/70">{baseKpis.bottleneckStationName}</span>
                      <span className="text-[10px] text-muted-foreground/30">→</span>
                      <span className="text-[11px] font-semibold">{labKpis.bottleneckStationName}</span>
                      {labKpis.bottleneckStationId !== baseKpis.bottleneckStationId && (
                        <span className="text-[10px] font-medium text-amber-700">{t("changesLower")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 px-2 py-1 last:border-0">
                    <span className="text-[11px] text-muted-foreground">{t("meetsDemandLabel")}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground/70">
                        {baseKpis.meetsDemand ? t("yes") : t("no")}
                      </span>
                      <span className="text-[10px] text-muted-foreground/30">→</span>
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          labKpis.meetsDemand ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {labKpis.meetsDemand ? t("yes") : t("no")}
                      </span>
                    </div>
                  </div>
                  <DetailRow
                    label={t("demandDelta")}
                    current={baseKpis.demandDelta}
                    projected={labKpis.demandDelta}
                    unit={t("unitsUds")}
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
