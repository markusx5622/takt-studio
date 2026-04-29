"use client"

import { Fragment } from "react"
import {
  ArrowRight,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  PackageCheck,
} from "lucide-react"
import { useTaktStore, useHydrated } from "@/lib/store"
import { getStationsWithEffective, calculateTaktTime } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { StationWithEffective } from "@/types"

// ─── ENTRADA ──────────────────────────────────────────────────────────────────

function EntradaIndicator() {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/40 px-4 py-4">
      <Package className="h-5 w-5 text-muted-foreground" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Entrada
      </span>
    </div>
  )
}

// ─── SALIDA ───────────────────────────────────────────────────────────────────

function SalidaIndicator() {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-green-400 px-4 py-4">
      <PackageCheck className="h-5 w-5 text-green-600" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">
        Salida
      </span>
    </div>
  )
}

// ─── Arrow ────────────────────────────────────────────────────────────────────

function ArrowConnector() {
  return (
    <div className="flex shrink-0 items-center justify-center p-1.5 text-muted-foreground/40">
      {/* rotate-90 = pointing down on mobile; rotate-0 = pointing right on desktop */}
      <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
    </div>
  )
}

// ─── Station card ─────────────────────────────────────────────────────────────

function StationCard({ station, index }: { station: StationWithEffective; index: number }) {
  return (
    <div
      className={cn(
        "w-40 shrink-0 overflow-hidden rounded-lg border-2 transition-shadow hover:shadow-lg",
        station.isBottleneck && "border-red-500",
        !station.isBottleneck && station.exceedsTakt && "border-amber-500 bg-amber-50",
        !station.isBottleneck && !station.exceedsTakt && "border-green-300 bg-white"
      )}
    >
      {/* Bottleneck banner */}
      {station.isBottleneck && (
        <div className="bg-red-500 px-1 py-0.5 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wide text-white">
            Cuello de botella
          </span>
        </div>
      )}

      <div className="p-3">
        {/* Header */}
        <div className="mb-2 flex items-start gap-1">
          <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
            #{index + 1}
          </span>
          <span
            className="line-clamp-2 text-[11px] font-semibold leading-tight"
            title={station.name}
          >
            {station.name}
          </span>
        </div>

        {/* Effective cycle time */}
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="font-medium">{station.effectiveCycleMin.toFixed(1)} min</span>
        </div>

        {/* Operators */}
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3 shrink-0" />
          <span>×{station.operators}</span>
        </div>

        {/* Failure rate */}
        {station.failureRate > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>Fallo: {(station.failureRate * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* Status icon */}
        <div className="mt-2 flex justify-end">
          {station.exceedsTakt ? (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LineDiagram() {
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )

  if (!hydrated || !scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Diagrama de línea</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Añade estaciones para visualizar la línea
          </p>
        </CardContent>
      </Card>
    )
  }

  const taktTimeMin = calculateTaktTime(scenario)
  const stations = getStationsWithEffective(scenario.stations, taktTimeMin)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Diagrama de línea</CardTitle>
      </CardHeader>
      <CardContent>
        {/* overflow-x-auto enables horizontal scroll on desktop when stations don't fit */}
        <div className="overflow-x-auto pb-3 pt-1">
          <div className="flex flex-col items-center md:flex-row md:min-w-max md:items-center">
            <EntradaIndicator />
            <ArrowConnector />

            {stations.map((station, index) => (
              <Fragment key={station.id}>
                <StationCard station={station} index={index} />
                {index < stations.length - 1 && <ArrowConnector />}
              </Fragment>
            ))}

            <ArrowConnector />
            <SalidaIndicator />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
