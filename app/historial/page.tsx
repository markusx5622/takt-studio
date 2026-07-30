"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import type { ScenarioSnapshot } from "@/types"
import ConsultingBackground from "@/components/ConsultingBackground"

// ─── Format helpers ────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Snapshot metadata ─────────────────────────────────────────────────────────

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
    }
  }, [snapshot])
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
  const meta = useSnapshotMeta(snapshot)

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-background p-4 transition-all duration-200",
        snapshot.isBaseline && "border-primary/30 bg-primary/[0.02]",
        isSelected && "ring-1 ring-primary/40"
      )}
    >
      {/* Baseline badge */}
      {snapshot.isBaseline && (
        <Badge
          variant="outline"
          className="absolute right-3 top-3 border-primary/30 bg-primary/10 text-[10px] text-primary"
        >
          <Flag className="mr-1 h-2.5 w-2.5" />
          Baseline
        </Badge>
      )}

      {/* Header */}
      <div className="pr-16">
        <h3 className="text-sm font-semibold leading-tight">{snapshot.name}</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{fmtDate(snapshot.createdAt)}</p>
      </div>

      {/* Metadata */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md border bg-muted/20 px-2 py-1.5">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Estaciones
          </span>
          <p className="text-xs font-semibold">{meta.stationsCount}</p>
        </div>
        <div className="rounded-md border bg-muted/20 px-2 py-1.5">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Demanda
          </span>
          <p className="text-xs font-semibold">{meta.demand} uds</p>
        </div>
        <div className="rounded-md border bg-muted/20 px-2 py-1.5">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Throughput
          </span>
          <p className="text-xs font-semibold">{meta.throughput} uds</p>
        </div>
        <div className="rounded-md border bg-muted/20 px-2 py-1.5">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Bottleneck
          </span>
          <p className="truncate text-xs font-semibold" title={meta.bottleneck}>
            {meta.bottleneck}
          </p>
        </div>
      </div>

      {/* Demand status */}
      <div className="mt-2">
        {meta.meetsDemand ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Cumple demanda
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600">
            <AlertTriangle className="h-3 w-3" />
            No cumple demanda
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-primary"
          onClick={onBaseline}
        >
          <Flag className="h-3 w-3" />
          {snapshot.isBaseline ? "Quitar baseline" : "Baseline"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-primary"
          onClick={onRestore}
        >
          <RotateCcw className="h-3 w-3" />
          Restaurar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1 text-[11px] hover:text-primary",
            isSelected ? "text-primary" : "text-muted-foreground"
          )}
          onClick={onToggleSelect}
        >
          <GitCompare className="h-3 w-3" />
          {isSelected ? "Seleccionado" : "Comparar"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 gap-1 text-[11px] text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
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
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function HistorialPage() {
  const hydrated = useHydrated()
  const scenarios = useTaktStore((s) => s.scenarios)
  const activeScenarioId = useTaktStore((s) => s.activeScenarioId)
  const snapshots = useTaktStore((s) => s.snapshots)
  const saveSnapshot = useTaktStore((s) => s.saveSnapshot)
  const removeSnapshot = useTaktStore((s) => s.removeSnapshot)
  const setBaselineSnapshot = useTaktStore((s) => s.setBaselineSnapshot)
  const restoreSnapshotAsScenario = useTaktStore((s) => s.restoreSnapshotAsScenario)
  const setCompareFromSnapshots = useTaktStore((s) => s.setCompareFromSnapshots)
  const setActiveScenario = useTaktStore((s) => s.setActiveScenario)

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null)
  const [snapshotName, setSnapshotName] = useState("")

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

  const baselineSnapshot = activeSnapshots.find((s) => s.isBaseline)

  if (!hydrated) return <HistorialSkeleton />

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <ConsultingBackground />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pt-2 pb-8">
        <div className="page-header-rule pb-4 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Historial de escenarios</h1>
          <p className="text-sm text-muted-foreground">
            Guarda snapshots, establece referencias base y restaura versiones anteriores.
          </p>
        </div>

      {/* Active scenario + save */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Escenario activo</label>
              <div className="flex items-center gap-2">
                <select
                  value={activeScenarioId}
                  onChange={(e) => setActiveScenario(e.target.value)}
                  className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <Link
                  href="/simulador"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Ir al simulador
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {activeScenario && activeScenario.stations.length > 0 && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Input
                  placeholder="Nombre del snapshot (opcional)"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  className="h-9 text-sm sm:w-64"
                />
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    if (!activeScenario) return
                    saveSnapshot(
                      activeScenario.id,
                      snapshotName.trim() || undefined
                    )
                    setSnapshotName("")
                  }}
                >
                  <Camera className="h-4 w-4" />
                  Guardar snapshot
                </Button>
              </div>
            )}
          </div>

          {(!activeScenario || activeScenario.stations.length === 0) && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-200/60 bg-amber-50/40 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-xs text-amber-800/80">
                El escenario activo no tiene estaciones definidas. Ve al simulador para configurar la línea antes de guardar snapshots.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compare bar */}
      {selectedSnapshotId && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Snapshot seleccionado para comparar
            </span>
            <Badge variant="outline" className="text-[10px]">
              {snapshots.find((s) => s.id === selectedSnapshotId)?.name}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setSelectedSnapshotId(null)}
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Baseline highlight */}
      {baselineSnapshot && (
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <Flag className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Baseline de referencia</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{baselineSnapshot.name}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(baselineSnapshot.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => restoreSnapshotAsScenario(baselineSnapshot.id)}
                >
                  <RotateCcw className="h-3 w-3" />
                  Restaurar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Snapshots list */}
      {activeSnapshots.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border bg-muted/20 text-center">
          <History className="h-10 w-10 text-muted-foreground/30" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sin snapshots</p>
            <p className="text-xs text-muted-foreground/70">
              Guarda un snapshot del escenario activo para empezar a construir el historial.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeSnapshots.map((snapshot) => (
            <SnapshotCard
              key={snapshot.id}
              snapshot={snapshot}
              isSelected={selectedSnapshotId === snapshot.id}
              onToggleSelect={() => {
                if (selectedSnapshotId === snapshot.id) {
                  setSelectedSnapshotId(null)
                } else if (selectedSnapshotId) {
                  // Compare the two
                  setCompareFromSnapshots(selectedSnapshotId, snapshot.id)
                  setSelectedSnapshotId(null)
                } else {
                  setSelectedSnapshotId(snapshot.id)
                }
              }}
              onBaseline={() => setBaselineSnapshot(snapshot.id)}
              onRestore={() => restoreSnapshotAsScenario(snapshot.id)}
              onDelete={() => {
                if (confirm(`¿Eliminar el snapshot "${snapshot.name}"?`)) {
                  removeSnapshot(snapshot.id)
                  if (selectedSnapshotId === snapshot.id) setSelectedSnapshotId(null)
                }
              }}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
