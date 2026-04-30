"use client"

import { useTaktStore, useHydrated } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react"
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
  onNameChange,
  onCycleChange,
  onOperatorsChange,
  onFailureChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: RowProps) {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="py-1 pl-4 text-sm text-muted-foreground">{index + 1}</td>
      <td className="py-1 pl-2">
        <Input
          className={cellInputCls}
          value={station.name}
          placeholder="Nombre de estación"
          onChange={(e) => onNameChange(station.id, e.target.value)}
        />
      </td>
      <td className="py-1 pl-2">
        <Input
          className={cn(cellInputCls, "w-24")}
          type="number"
          min={1}
          step={1}
          value={station.cycleTimeMin}
          onChange={(e) => onCycleChange(station.id, e.target.value)}
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
            aria-label="Mover arriba"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isLast}
            onClick={onMoveDown}
            aria-label="Mover abajo"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label="Eliminar estación"
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
  onNameChange,
  onCycleChange,
  onOperatorsChange,
  onFailureChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: RowProps) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isFirst}
            onClick={onMoveUp}
            aria-label="Mover arriba"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isLast}
            onClick={onMoveDown}
            aria-label="Mover abajo"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label="Eliminar estación"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <Input
          className="h-8 text-sm font-medium"
          value={station.name}
          placeholder="Nombre de estación"
          onChange={(e) => onNameChange(station.id, e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Ciclo (min)</p>
          <Input
            className="h-8 text-sm"
            type="number"
            min={1}
            step={1}
            value={station.cycleTimeMin}
            onChange={(e) => onCycleChange(station.id, e.target.value)}
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Operarios</p>
          <Input
            className="h-8 text-sm"
            type="number"
            min={1}
            max={20}
            step={1}
            value={station.operators}
            onChange={(e) => onOperatorsChange(station.id, e.target.value)}
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Fallo (%)</p>
          <Input
            className="h-8 text-sm"
            type="number"
            min={0}
            max={100}
            step={1}
            value={Math.round(station.failureRate * 100)}
            onChange={(e) => onFailureChange(station.id, e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StationEditor() {
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const updateStation = useTaktStore((state) => state.updateStation)
  const removeStation = useTaktStore((state) => state.removeStation)
  const moveStation = useTaktStore((state) => state.moveStation)
  const addStation = useTaktStore((state) => state.addStation)

  if (!hydrated) return <StationEditorSkeleton />

  const stations = scenario?.stations ?? []

  function handleAddStation() {
    addStation({ name: "Nueva estación", cycleTimeMin: 30, operators: 1, failureRate: 0 })
  }

  function handleDelete(stationId: string) {
    if (confirm("¿Eliminar esta estación?")) {
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
    onOperatorsChange: handleOperatorsChange,
    onFailureChange: handleFailureChange,
    onMoveUp: () => moveStation(station.id, "up"),
    onMoveDown: () => moveStation(station.id, "down"),
    onDelete: () => handleDelete(station.id),
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
        <CardTitle className="text-lg">Estaciones de la línea</CardTitle>
        <Badge variant="secondary">{stations.length} estaciones</Badge>
      </CardHeader>

      <CardContent className="p-0">
        {stations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="rounded-full border-2 border-dashed border-muted-foreground/20 p-4">
              <Plus className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium">Define tu primera estación</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cada estación representa una operación de la línea: nombre, tiempo de ciclo, operarios y tasa de fallo.
              </p>
            </div>
            <Button size="sm" onClick={handleAddStation}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir estación
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="w-8 py-2 pl-4 text-left text-xs font-medium text-muted-foreground">
                      #
                    </th>
                    <th className="py-2 pl-2 text-left text-xs font-medium text-muted-foreground">
                      Nombre
                    </th>
                    <th className="w-32 py-2 pl-2 text-left text-xs font-medium text-muted-foreground">
                      Tiempo ciclo (min)
                    </th>
                    <th className="w-24 py-2 pl-2 text-left text-xs font-medium text-muted-foreground">
                      Operarios
                    </th>
                    <th className="w-24 py-2 pl-2 text-left text-xs font-medium text-muted-foreground">
                      Fallo (%)
                    </th>
                    <th className="w-28 py-2 pl-2 pr-4 text-left text-xs font-medium text-muted-foreground">
                      Acciones
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
                  {...rowActions(station)}
                />
              ))}
            </div>

            <div className="border-t px-4 py-3">
              <Button variant="outline" size="sm" onClick={handleAddStation}>
                <Plus className="mr-2 h-4 w-4" />
                Añadir estación
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
