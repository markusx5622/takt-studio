"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs } from "@/lib/calculations"
import { buildSnapshotExportPayload } from "@/lib/import-export"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  History,
  Camera,
  RotateCcw,
  GitCompare,
  Trash2,
  Flag,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Search,
  Download,
  StickyNote,
  Activity,
  ShieldAlert,
  Sparkles,
  Layers,
  Clock,
  Zap,
  Percent,
} from "lucide-react"
import type { ScenarioSnapshot } from "@/types"
import ConsultingBackground from "@/components/ConsultingBackground"

// ─── Format helpers ────────────────────────────────────────────────────────────

function fmtDate(iso: string, locale: string) {
  const d = new Date(iso)
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Snapshot metadata hook ───────────────────────────────────────────────────

function useSnapshotMeta(snapshot: ScenarioSnapshot) {
  return useMemo(() => {
    const s = snapshot.scenarioData
    const kpis = calculateAllKPIs(s)
    return {
      stationsCount: s.stations.length,
      demand: s.demandPerDay,
      throughput: kpis.throughputPerDay,
      bottleneck: kpis.bottleneckStationName || "—",
      meetsDemand: kpis.meetsDemand,
      requiredOEE: kpis.requiredOEE,
      historicalOEE: kpis.historicalOEE,
      isOEEStressed: kpis.isOEEStressed,
      allocationPercent: s.allocationPercent ?? 100,
      taktTime: kpis.taktTimeMin,
      leadTime: kpis.leadTimeMin,
    }
  }, [snapshot])
}

// ─── Export JSON helper ────────────────────────────────────────────────────────

function handleExportSnapshotJSON(snapshot: ScenarioSnapshot) {
  const payload = buildSnapshotExportPayload(snapshot)
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `snapshot-${snapshot.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Snapshot card ─────────────────────────────────────────────────────────────

function SnapshotCard({
  snapshot,
  isSelected,
  onToggleSelect,
  onBaseline,
  onRestore,
  onDelete,
}: {
  snapshot: ScenarioSnapshot
  isSelected: boolean
  onToggleSelect: () => void
  onBaseline: () => void
  onRestore: () => void
  onDelete: () => void
}) {
  const t = useTranslations("history")
  const locale = useLocale()
  const meta = useSnapshotMeta(snapshot)

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md",
        snapshot.isBaseline
          ? "border-amber-300/80 bg-gradient-to-b from-amber-50/20 via-white to-white"
          : "border-slate-200/80 hover:border-slate-300",
        isSelected && "ring-2 ring-blue-500/80 border-blue-300 bg-blue-50/10 shadow-md"
      )}
    >
      {/* Top Header & Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-slate-800 line-clamp-1" title={snapshot.name}>
              {snapshot.name}
            </h3>
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            {fmtDate(snapshot.createdAt, locale)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {snapshot.isBaseline && (
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-100/80 text-[10px] font-bold text-amber-800 shadow-2xs"
            >
              <Flag className="mr-1 h-3 w-3 fill-amber-500 text-amber-600" />
              {t("baseline")}
            </Badge>
          )}

          {meta.isOEEStressed && (
            <Badge
              variant="destructive"
              className="text-[10px] font-bold tracking-wider shadow-2xs"
              title={`${t("metaOEE")}: ${meta.requiredOEE}% > ${meta.historicalOEE}%`}
            >
              <ShieldAlert className="mr-1 h-3 w-3" />
              {t("oeeStressed")}
            </Badge>
          )}
        </div>
      </div>

      {/* Snapshot Engineering Notes */}
      {snapshot.note && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-xs text-slate-600">
          <StickyNote className="h-4 w-4 shrink-0 text-amber-500/80 mt-0.5" />
          <p className="line-clamp-2 italic leading-relaxed text-[11px]">{snapshot.note}</p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            {t("metaStations")}
          </span>
          <p className="mt-0.5 text-xs font-bold text-slate-800">{meta.stationsCount}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            {t("metaDemand")}
          </span>
          <p className="mt-0.5 text-xs font-bold text-slate-800">{meta.demand} <span className="text-[10px] font-normal text-slate-500">{t("unitsUds")}</span></p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            {t("metaThroughput")}
          </span>
          <p className={cn("mt-0.5 text-xs font-bold", meta.meetsDemand ? "text-emerald-700" : "text-rose-600")}>
            {meta.throughput} <span className="text-[10px] font-normal text-slate-500">{t("unitsUds")}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            {t("metaBottleneck")}
          </span>
          <p className="mt-0.5 truncate text-xs font-bold text-slate-800" title={meta.bottleneck}>
            {meta.bottleneck}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            {t("metaOEE")}
          </span>
          <p className={cn("mt-0.5 text-xs font-bold", meta.isOEEStressed ? "text-rose-600 font-extrabold" : "text-slate-800")}>
            {meta.requiredOEE}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            {t("metaAllocation")}
          </span>
          <p className="mt-0.5 text-xs font-bold text-slate-800">{meta.allocationPercent}%</p>
        </div>
      </div>

      {/* Demand fulfillment indicator */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div>
          {meta.meetsDemand ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("meetsDemand")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              {t("missesDemand")}
            </span>
          )}
        </div>

        <div className="text-[11px] font-medium text-slate-400">
          Takt: <span className="font-semibold text-slate-700">{meta.taktTime.toFixed(1)}m</span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-4 flex items-center justify-between gap-1 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2.5 text-xs rounded-lg transition-colors",
              snapshot.isBaseline
                ? "bg-amber-50 text-amber-800 font-semibold hover:bg-amber-100"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            )}
            onClick={onBaseline}
            title={snapshot.isBaseline ? t("removeBaseline") : t("baseline")}
          >
            <Flag className="mr-1 h-3.5 w-3.5" />
            {snapshot.isBaseline ? t("removeBaseline") : t("baseline")}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            onClick={onRestore}
            title={t("restore")}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            {t("restore")}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2.5 text-xs rounded-lg transition-colors",
              isSelected
                ? "bg-blue-100 text-blue-800 font-bold"
                : "text-slate-500 hover:text-blue-700 hover:bg-blue-50"
            )}
            onClick={onToggleSelect}
            title={t("compare")}
          >
            <GitCompare className="mr-1 h-3.5 w-3.5" />
            {isSelected ? t("selected") : t("compare")}
          </Button>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            onClick={() => handleExportSnapshotJSON(snapshot)}
            title={t("exportJson")}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            onClick={onDelete}
            title={t("deleteConfirm", { name: snapshot.name })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function HistorialSkeleton() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <ConsultingBackground />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pt-2 pb-8">
        <div className="page-header-rule pb-4 mb-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HistorialPage() {
  const t = useTranslations("history")
  const locale = useLocale()
  const hydrated = useHydrated()
  const router = useRouter()

  const scenarios = useTaktStore((s) => s.scenarios)
  const activeScenarioId = useTaktStore((s) => s.activeScenarioId)
  const snapshots = useTaktStore((s) => s.snapshots)
  const saveSnapshot = useTaktStore((s) => s.saveSnapshot)
  const removeSnapshot = useTaktStore((s) => s.removeSnapshot)
  const setBaselineSnapshot = useTaktStore((s) => s.setBaselineSnapshot)
  const restoreSnapshotAsScenario = useTaktStore((s) => s.restoreSnapshotAsScenario)
  const setCompareFromSnapshots = useTaktStore((s) => s.setCompareFromSnapshots)
  const setActiveScenario = useTaktStore((s) => s.setActiveScenario)
  const setCompareA = useTaktStore((s) => s.setCompareA)
  const setCompareB = useTaktStore((s) => s.setCompareB)

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null)
  const [snapshotName, setSnapshotName] = useState("")
  const [snapshotNote, setSnapshotNote] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === activeScenarioId),
    [scenarios, activeScenarioId]
  )

  const activeSnapshots = useMemo(() => {
    if (!activeScenario) return []
    return snapshots
      .filter((s) => s.scenarioId === activeScenario.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [snapshots, activeScenario])

  const filteredSnapshots = useMemo(() => {
    if (!searchQuery.trim()) return activeSnapshots
    const q = searchQuery.toLowerCase()
    return activeSnapshots.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.note && s.note.toLowerCase().includes(q))
    )
  }, [activeSnapshots, searchQuery])

  const baselineSnapshot = activeSnapshots.find((s) => s.isBaseline)

  const latestSnapshot = useMemo(() => {
    if (activeSnapshots.length === 0) return null
    return activeSnapshots[0]
  }, [activeSnapshots])

  function handleCompareWithActive(snapshot: ScenarioSnapshot) {
    // Restore snapshot into a scenario variant and compare with active
    restoreSnapshotAsScenario(snapshot.id, `${snapshot.name} (Restaurado)`)
    const restoredScenarioId = useTaktStore.getState().activeScenarioId
    setCompareA(activeScenarioId)
    setCompareB(restoredScenarioId)
    router.push("/comparar")
  }

  function handleCompareWithBaseline(snapshot: ScenarioSnapshot) {
    if (!baselineSnapshot) return
    setCompareFromSnapshots(baselineSnapshot.id, snapshot.id)
    router.push("/comparar")
  }

  if (!hydrated) return <HistorialSkeleton />

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <ConsultingBackground />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pt-2 pb-28 md:pb-8">
        
        {/* Page Header */}
        <div className="page-header-rule pb-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full shadow-2xs">
            <Link href="/simulador" className="flex items-center gap-1.5 text-xs font-semibold">
              {t("goToSimulator")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/60 shadow-2xs">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <History className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t("statsTotalSnapshots")}
                </span>
                <p className="text-xl font-black text-slate-800 tracking-tight">
                  {activeSnapshots.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-amber-50/30 shadow-2xs">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Flag className="h-5 w-5 fill-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t("statsActiveBaseline")}
                </span>
                <p className="text-sm font-bold text-slate-800 truncate" title={baselineSnapshot ? baselineSnapshot.name : t("noBaseline")}>
                  {baselineSnapshot ? baselineSnapshot.name : t("noBaseline")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30 shadow-2xs">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t("statsLastSnapshot")}
                </span>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {latestSnapshot ? fmtDate(latestSnapshot.createdAt, locale) : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Scenario Selector & Save Form */}
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardContent className="pt-6 pb-6 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              
              {/* Scenario Selector */}
              <div className="space-y-1.5 lg:w-72">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t("activeScenario")}
                </label>
                <Select value={activeScenarioId} onValueChange={setActiveScenario}>
                  <SelectTrigger className="w-full font-semibold border-slate-200 bg-white shadow-2xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="font-medium">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Form Input for Snapshot */}
              {activeScenario && activeScenario.stations.length > 0 && (
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder={t("snapshotNamePlaceholder")}
                      value={snapshotName}
                      onChange={(e) => setSnapshotName(e.target.value)}
                      className="h-10 text-xs border-slate-200 bg-white"
                    />
                    <Input
                      placeholder={t("snapshotNotePlaceholder")}
                      value={snapshotNote}
                      onChange={(e) => setSnapshotNote(e.target.value)}
                      className="h-10 text-xs border-slate-200 bg-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="gap-2 font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10"
                      onClick={() => {
                        if (!activeScenario) return
                        saveSnapshot(
                          activeScenario.id,
                          snapshotName.trim() || undefined,
                          snapshotNote.trim() || undefined
                        )
                        setSnapshotName("")
                        setSnapshotNote("")
                      }}
                    >
                      <Camera className="h-4 w-4" />
                      {t("saveSnapshot")}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {(!activeScenario || activeScenario.stations.length === 0) && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs font-medium text-amber-800">
                  {t("noStationsWarning")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Baseline Hero Banner */}
        {baselineSnapshot && (
          <Card className="border-amber-200/80 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <Flag className="h-4 w-4 text-amber-600 fill-amber-500" />
              <CardTitle className="text-sm font-bold text-amber-900">{t("baselineTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-800">{baselineSnapshot.name}</h4>
                  <p className="text-xs text-slate-500">{fmtDate(baselineSnapshot.createdAt, locale)}</p>
                  {baselineSnapshot.note && (
                    <p className="mt-1 text-xs italic text-slate-600 bg-amber-100/50 px-2.5 py-1 rounded-md inline-block">
                      "{baselineSnapshot.note}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-semibold border-amber-200 bg-white hover:bg-amber-50"
                    onClick={() => restoreSnapshotAsScenario(baselineSnapshot.id)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
                    {t("restore")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Counter Bar */}
        {activeSnapshots.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-xs border-slate-200 bg-white"
              />
            </div>
            <span className="text-xs font-medium text-slate-500">
              {t("snapshotCountInfo", { filtered: filteredSnapshots.length, total: activeSnapshots.length })}
            </span>
          </div>
        )}

        {/* Snapshots Grid */}
        {filteredSnapshots.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/50 text-center p-8">
            <History className="h-10 w-10 text-slate-300" />
            <div>
              <p className="text-sm font-bold text-slate-700">{t("emptyTitle")}</p>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                {t("emptyText")}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredSnapshots.map((snapshot) => (
              <SnapshotCard
                key={snapshot.id}
                snapshot={snapshot}
                isSelected={selectedSnapshotId === snapshot.id}
                onToggleSelect={() => {
                  if (selectedSnapshotId === snapshot.id) {
                    setSelectedSnapshotId(null)
                  } else if (selectedSnapshotId) {
                    // Compare both selected snapshots directly
                    setCompareFromSnapshots(selectedSnapshotId, snapshot.id)
                    setSelectedSnapshotId(null)
                    router.push("/comparar")
                  } else {
                    setSelectedSnapshotId(snapshot.id)
                  }
                }}
                onBaseline={() => setBaselineSnapshot(snapshot.id)}
                onRestore={() => restoreSnapshotAsScenario(snapshot.id)}
                onDelete={() => {
                  removeSnapshot(snapshot.id)
                  if (selectedSnapshotId === snapshot.id) setSelectedSnapshotId(null)
                }}
              />
            ))}
          </div>
        )}

        {/* Floating Compare Drawer / Action Bar */}
        {selectedSnapshotId && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/95 px-5 py-3.5 text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold">
                {t("selectedForCompare")}:
              </span>
              <Badge variant="secondary" className="bg-slate-800 text-slate-200 text-xs font-bold border-slate-700">
                {snapshots.find((s) => s.id === selectedSnapshotId)?.name}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {baselineSnapshot && baselineSnapshot.id !== selectedSnapshotId && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                  onClick={() => {
                    const snap = snapshots.find((s) => s.id === selectedSnapshotId)
                    if (snap) handleCompareWithBaseline(snap)
                    setSelectedSnapshotId(null)
                  }}
                >
                  <Flag className="mr-1.5 h-3.5 w-3.5" />
                  {t("compareWithBaseline")}
                </Button>
              )}

              <Button
                size="sm"
                className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => {
                  const snap = snapshots.find((s) => s.id === selectedSnapshotId)
                  if (snap) handleCompareWithActive(snap)
                  setSelectedSnapshotId(null)
                }}
              >
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                {t("compareWithActive")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-slate-400 hover:text-white"
                onClick={() => setSelectedSnapshotId(null)}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
