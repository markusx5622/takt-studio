"use client"

import { useRef } from "react"

import { useTranslations } from "next-intl"
import { useTaktStore, useHydrated } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown, Trash2, Plus, AlertTriangle, Download, Upload, Wand2 } from "lucide-react"
import { findBottleneck } from "@/lib/calculations"
import { cn } from "@/lib/utils"
import type { Station } from "@/types"

// ─── Skeleton ────────────────────────────────────────────────────────────────

function StationEditorSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="h-8 w-6 animate-pulse rounded bg-muted" />
            <div className="h-8 flex-1 animate-pulse rounded bg-muted" />
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Shared types ─────────────────────────────────────────────────────────────

interface RowActions {
  onNameChange: (id: string, value: string) => void
  onCycleChange: (id: string, value: string) => void
  onUnitsChange: (id: string, value: string) => void
  onOperatorsChange: (id: string, value: string) => void
  onFailureChange: (id: string, value: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

interface RowProps extends RowActions {
  station: Station
  index: number
  isFirst: boolean
  isLast: boolean
  isBottleneck: boolean
}

// ─── Cell input class ─────────────────────────────────────────────────────────

const cellInputCls =
  "h-8 border-transparent bg-transparent px-2 text-sm hover:border-input"

// ─── Desktop table row ────────────────────────────────────────────────────────

function StationRow({
  station,
  index,
  isFirst,
  isLast,
  isBottleneck,
  onNameChange,
  onCycleChange,
  onUnitsChange,
  onOperatorsChange,
  onFailureChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: RowProps) {
  const t = useTranslations("simulator.stations")
  return (
    <tr
      className={cn(
        "border-b transition-colors",
        isBottleneck
          ? "bg-red-50/70 hover:bg-red-50/90 dark:bg-red-950/30 border-l-4 border-l-red-500 shadow-2xs"
          : "hover:bg-blue-50/60"
      )}
    >
      <td className="py-1 pl-4 text-sm font-medium text-foreground/60">{index + 1}</td>
      <td className="py-1 pl-2">
        <div className="flex items-center gap-2">
          <Input
            className={cellInputCls}
            value={station.name}
            placeholder={t("namePlaceholder")}
            aria-label={t("colName")}
            onChange={(e) => onNameChange(station.id, e.target.value)}
          />
          {isBottleneck && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-300 bg-red-100/90 px-2.5 py-0.5 text-[10px] font-bold text-red-800 shadow-2xs animate-pulse"
              title={t("bottleneckTooltip")}
            >
              <AlertTriangle className="h-3 w-3 text-red-600 shrink-0" />
              <span>{t("bottleneckBadge")}</span>
            </span>
          )}
        </div>
      </td>
      <td className="py-1 pl-2">
        <Input
          className={cn(cellInputCls, "w-24")}
          type="number"
          min={1}
          step={1}
          value={station.cycleTimeMin}
          aria-label={t("colCycle")}
          onChange={(e) => onCycleChange(station.id, e.target.value)}
        />
      </td>
      <td className="py-1 pl-2">
        <Input
          className={cn(cellInputCls, "w-20")}
          type="number"
          min={1}
          step={1}
          value={station.unitsPerCycle ?? 1}
          aria-label={t("colUnits")}
          onChange={(e) => onUnitsChange(station.id, e.target.value)}
        />
      </td>
      <td className="py-1 pl-2">
        <Input
          className={cn(cellInputCls, "w-20")}
          type="number"
          min={1}
          max={20}
          step={1}
          value={station.operators}
          aria-label={t("colOperators")}
          onChange={(e) => onOperatorsChange(station.id, e.target.value)}
        />
      </td>
      <td className="py-1 pl-2">
        <Input
          className={cn(cellInputCls, "w-20")}
          type="number"
          min={0}
          max={100}
          step={1}
          value={Math.round(station.failureRate * 100)}
          aria-label={t("colFailure")}
          onChange={(e) => onFailureChange(station.id, e.target.value)}
        />
      </td>
      <td className="py-1 pl-2 pr-4">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isFirst}
            onClick={onMoveUp}
            aria-label={t("moveUp")}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isLast}
            onClick={onMoveDown}
            aria-label={t("moveDown")}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label={t("deleteStation")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function StationCard({
  station,
  index,
  isFirst,
  isLast,
  isBottleneck,
  onNameChange,
  onCycleChange,
  onUnitsChange,
  onOperatorsChange,
  onFailureChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: RowProps) {
  const t = useTranslations("simulator.stations")
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all",
        isBottleneck
          ? "border-red-400/80 bg-red-50/40 border-l-4 border-l-red-500 shadow-2xs dark:bg-red-950/20"
          : "hover:border-blue-300/60"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
          {isBottleneck && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100/90 px-2 py-0.5 text-[10px] font-bold text-red-800 shadow-2xs animate-pulse"
              title={t("bottleneckTooltip")}
            >
              <AlertTriangle className="h-3 w-3 text-red-600 shrink-0" />
              <span>{t("bottleneckBadge")}</span>
            </span>
          )}
        </div>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isFirst}
            onClick={onMoveUp}
            aria-label={t("moveUp")}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isLast}
            onClick={onMoveDown}
            aria-label={t("moveDown")}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label={t("deleteStation")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <Input
          className="h-8 text-sm font-medium"
          value={station.name}
          placeholder={t("namePlaceholder")}
          aria-label={t("colName")}
          onChange={(e) => onNameChange(station.id, e.target.value)}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">{t("cycleMin")}</p>
          <Input
            className="h-8 text-sm"
            type="number"
            min={1}
            step={1}
            value={station.cycleTimeMin}
            aria-label={t("cycleMin")}
            onChange={(e) => onCycleChange(station.id, e.target.value)}
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">{t("units")}</p>
          <Input
            className="h-8 text-sm"
            type="number"
            min={1}
            step={1}
            value={station.unitsPerCycle ?? 1}
            aria-label={t("units")}
            onChange={(e) => onUnitsChange(station.id, e.target.value)}
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">{t("operators")}</p>
          <Input
            className="h-8 text-sm"
            type="number"
            min={1}
            max={20}
            step={1}
            value={station.operators}
            aria-label={t("operators")}
            onChange={(e) => onOperatorsChange(station.id, e.target.value)}
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">{t("failurePct")}</p>
          <Input
            className="h-8 text-sm"
            type="number"
            min={0}
            max={100}
            step={1}
            value={Math.round(station.failureRate * 100)}
            aria-label={t("failurePct")}
            onChange={(e) => onFailureChange(station.id, e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StationEditor() {
  const t = useTranslations("simulator.stations")
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const updateStation = useTaktStore((state) => state.updateStation)
  const removeStation = useTaktStore((state) => state.removeStation)
  const moveStation = useTaktStore((state) => state.moveStation)
  const addStation = useTaktStore((state) => state.addStation)
  const updateScenario = useTaktStore((state) => state.updateScenario)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!hydrated) return <StationEditorSkeleton />

  const stations = scenario?.stations ?? []

  function handleAddStation() {
    addStation({ name: t("newStationName"), cycleTimeMin: 30, operators: 1, failureRate: 0, unitsPerCycle: 1 })
  }

  function handleDelete(stationId: string) {
    if (confirm(t("deleteConfirm"))) {
      removeStation(stationId)
    }
  }

  function handleNameChange(id: string, value: string) {
    updateStation(id, { name: value })
  }

  function handleCycleChange(id: string, value: string) {
    const n = parseInt(value, 10)
    if (isNaN(n) || n < 1) return
    updateStation(id, { cycleTimeMin: n })
  }

  function handleUnitsChange(id: string, value: string) {
    const n = parseInt(value, 10)
    if (isNaN(n) || n < 1) return
    updateStation(id, { unitsPerCycle: n })
  }

  function handleOperatorsChange(id: string, value: string) {
    const n = parseInt(value, 10)
    if (isNaN(n) || n < 1 || n > 20) return
    updateStation(id, { operators: n })
  }

  function handleFailureChange(id: string, value: string) {
    const pct = parseFloat(value)
    if (isNaN(pct) || pct < 0 || pct > 100) return
    updateStation(id, { failureRate: pct / 100 })
  }

  const rowActions = (station: Station): RowActions => ({
    onNameChange: handleNameChange,
    onCycleChange: handleCycleChange,
    onUnitsChange: handleUnitsChange,
    onOperatorsChange: handleOperatorsChange,
    onFailureChange: handleFailureChange,
    onMoveUp: () => moveStation(station.id, "up"),
    onMoveDown: () => moveStation(station.id, "down"),
    onDelete: () => handleDelete(station.id),
  })

  function handleExportCSV() {
    if (stations.length === 0) return

    const headers = [
      t("colName"),
      t("colCycle"),
      t("colUnits"),
      t("colOperators"),
      t("colFailure"),
      t("colEffective")
    ]

    const rows = stations.map((st) => {
      const units = st.unitsPerCycle ?? 1
      const effectiveTime = (st.cycleTimeMin / units) / (st.operators * (1 - st.failureRate))
      return [
        `"${st.name.replace(/"/g, '""')}"`,
        st.cycleTimeMin,
        units,
        st.operators,
        `${(st.failureRate * 100).toFixed(1)}%`,
        effectiveTime.toFixed(2)
      ].join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `estaciones_${scenario?.name || "export"}_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function parseCSVLine(text: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !scenario) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0)
        if (lines.length <= 1) throw new Error("Empty or invalid CSV")

        const newStations: Station[] = []
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i])
          if (cols.length < 5) continue // basic validation
          
          const name = cols[0].replace(/^"|"$/g, '').replace(/""/g, '"').trim()
          const cycleTimeMin = parseFloat(cols[1])
          const unitsPerCycle = parseInt(cols[2], 10)
          const operators = parseInt(cols[3], 10)
          const failureStr = cols[4].replace('%', '').trim()
          
          let failureRate = 0
          if (cols[3].includes('%')) {
            failureRate = parseFloat(cols[3].replace('%', '')) / 100
          } else {
            failureRate = parseFloat(cols[3])
          }

          if (!name || isNaN(cycleTimeMin) || isNaN(operators) || isNaN(failureRate)) continue

          newStations.push({
            id: crypto.randomUUID(),
            name,
            cycleTimeMin,
            operators,
            failureRate,
          })
        }

        if (newStations.length === 0) throw new Error("No valid stations found")
        
        if (confirm(t("importConfirm", { current: stations.length, new: newStations.length }))) {
          updateScenario(scenario.id, { stations: newStations })
        }
      } catch (err) {
        alert(t("importError"))
        console.error(err)
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsText(file)
  }

  function handleAutoBalance() {
    if (!scenario || stations.length === 0) return
    if (!confirm(t("autoBalanceConfirm"))) return
    
    const taktTime = (scenario.shiftHours * 60 * scenario.shiftsPerDay) / scenario.demandPerDay
    
    const newStations = stations.map(st => {
      const requiredOperators = Math.max(1, Math.ceil((st.cycleTimeMin * (1 + st.failureRate)) / taktTime))
      return { ...st, operators: requiredOperators }
    })
    
    updateScenario(scenario.id, { stations: newStations })
  }

  const bottleneckId = stations.length > 0 ? findBottleneck(stations).stationId : ""

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <Badge variant="secondary">{t("countBadge", { count: stations.length })}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoBalance}
            disabled={stations.length === 0}
            className="hidden gap-2 sm:flex border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
          >
            <Wand2 className="h-4 w-4" />
            {t("autoBalance")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="hidden gap-2 sm:flex"
          >
            <Upload className="h-4 w-4" />
            {t("importCSV")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={stations.length === 0}
            className="hidden gap-2 sm:flex"
          >
            <Download className="h-4 w-4" />
            {t("exportCSV")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {stations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="rounded-full border-2 border-dashed border-muted-foreground/20 p-4">
              <Plus className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium">{t("emptyTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("emptyText")}
              </p>
            </div>
            <Button size="sm" onClick={handleAddStation}>
              <Plus className="mr-2 h-4 w-4" />
              {t("add")}
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th scope="col" className="w-8 py-2 pl-4 text-left text-xs font-medium text-muted-foreground">
                      #
                    </th>
                    <th scope="col" className="py-2 pl-2 text-left text-xs font-medium text-muted-foreground">
                      {t("colName")}
                    </th>
                    <th scope="col" className="w-32 py-2 pl-2 text-left text-xs font-medium text-muted-foreground">
                      {t("colCycle")}
                    </th>
                    <th scope="col" className="w-24 py-2 pl-2 text-left text-xs font-medium text-muted-foreground">
                      {t("colUnits")}
                    </th>
                    <th scope="col" className="w-24 py-2 pl-2 text-left text-xs font-medium text-muted-foreground">
                      {t("colOperators")}
                    </th>
                    <th scope="col" className="w-24 py-2 pl-2 text-left text-xs font-medium text-muted-foreground">
                      {t("colFailure")}
                    </th>
                    <th scope="col" className="w-28 py-2 pl-2 pr-4 text-left text-xs font-medium text-muted-foreground">
                      {t("colActions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((station, index) => (
                    <StationRow
                      key={station.id}
                      station={station}
                      index={index}
                      isFirst={index === 0}
                      isLast={index === stations.length - 1}
                      isBottleneck={station.id === bottleneckId}
                      {...rowActions(station)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 md:hidden">
              {stations.map((station, index) => (
                <StationCard
                  key={station.id}
                  station={station}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === stations.length - 1}
                  isBottleneck={station.id === bottleneckId}
                  {...rowActions(station)}
                />
              ))}
            </div>

            <div className="border-t px-4 py-3">
              <Button variant="outline" size="sm" onClick={handleAddStation}>
                <Plus className="mr-2 h-4 w-4" />
                {t("add")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
