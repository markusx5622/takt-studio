"use client"

import { useTaktStore, useHydrated } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ScenarioControlsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="h-6 w-56 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ScenarioControls() {
  const hydrated = useHydrated()
  const scenarios = useTaktStore((s) => s.scenarios)
  const activeScenarioId = useTaktStore((s) => s.activeScenarioId)
  const scenario = useTaktStore((s) => s.getActiveScenario())
  const updateScenario = useTaktStore((s) => s.updateScenario)
  const setActiveScenario = useTaktStore((s) => s.setActiveScenario)
  const duplicateScenario = useTaktStore((s) => s.duplicateScenario)
  const addScenario = useTaktStore((s) => s.addScenario)
  const removeScenario = useTaktStore((s) => s.removeScenario)

  if (!hydrated) return <ScenarioControlsSkeleton />
  if (!scenario) return null

  function handleDemandChange(value: string) {
    const n = parseInt(value, 10)
    if (!isNaN(n) && n >= 1) updateScenario(scenario!.id, { demandPerDay: n })
  }

  function handleShiftHoursChange(value: string) {
    const n = parseFloat(value)
    if (!isNaN(n) && n >= 1 && n <= 12) updateScenario(scenario!.id, { shiftHours: n })
  }

  function handleDelete() {
    if (confirm(`¿Eliminar el escenario "${scenario!.name}"? Esta acción no se puede deshacer.`)) {
      removeScenario(scenario!.id)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Parámetros del escenario</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Parameter grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre del escenario</label>
            <Input
              value={scenario.name}
              placeholder="Nombre del escenario"
              onChange={(e) => updateScenario(scenario.id, { name: e.target.value })}
            />
          </div>

          {/* Demanda */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Demanda diaria (uds/día)</label>
            <Input
              type="number"
              min={1}
              step={1}
              value={scenario.demandPerDay}
              onChange={(e) => handleDemandChange(e.target.value)}
            />
          </div>

          {/* Horas por turno */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Horas por turno</label>
            <Input
              type="number"
              min={1}
              max={12}
              step={0.5}
              value={scenario.shiftHours}
              onChange={(e) => handleShiftHoursChange(e.target.value)}
            />
          </div>

          {/* Turnos por día — segmented control */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Turnos por día</label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((n) => (
                <Button
                  key={n}
                  variant={scenario.shiftsPerDay === n ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateScenario(scenario.id, { shiftsPerDay: n })}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario management row */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          {/* Scenario selector */}
          <select
            value={activeScenarioId}
            onChange={(e) => setActiveScenario(e.target.value)}
            className={cn(
              "h-9 max-w-xs flex-1 rounded-md border border-input bg-background px-3 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateScenario(scenario.id, `${scenario.name} (copia)`)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => addScenario("Nuevo escenario")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo escenario
          </Button>

          {scenarios.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
