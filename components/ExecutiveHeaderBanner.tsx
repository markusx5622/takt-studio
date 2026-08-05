"use client"

import { useMemo } from "react"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs } from "@/lib/calculations"
import { CheckCircle2, AlertTriangle, Gauge, Activity, HardDrive } from "lucide-react"

export default function ExecutiveHeaderBanner() {
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )

  const kpis = useMemo(
    () => (scenario && scenario.stations.length > 0 ? calculateAllKPIs(scenario) : null),
    [scenario]
  )

  if (!hydrated || !scenario || !kpis) return null

  const meetsDemand = kpis.meetsDemand
  const deltaAbs = Math.abs(kpis.demandDelta)
  const effPct = Math.round(kpis.balancingEfficiency * 100)

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 backdrop-blur-xl ${
        meetsDemand
          ? "border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-background to-teal-50/40 shadow-sm"
          : "border-red-200/80 bg-gradient-to-r from-red-50/70 via-background to-amber-50/40 shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Status & Summary */}
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
              meetsDemand
                ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                : "border-red-300 bg-red-100 text-red-700"
            }`}
          >
            {meetsDemand ? (
              <CheckCircle2 className="h-5 w-5 animate-pulse-soft" />
            ) : (
              <AlertTriangle className="h-5 w-5 animate-bounce-subtle" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  meetsDemand
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {meetsDemand ? "Línea en Equilibrio" : `Déficit de ${deltaAbs} Uds/Día`}
              </span>
              <span className="text-xs font-semibold text-foreground/80">
                {scenario.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-2xs">
                <HardDrive className="h-3 w-3 text-blue-500" />
                Auto-guardado en LocalStorage
              </span>
            </div>

            <p className="mt-1 text-xs text-foreground/75 leading-relaxed">
              {meetsDemand ? (
                <>
                  La capacidad proyectada de <strong>{kpis.throughputPerDay} uds/día</strong> supera la demanda objetivo de <strong>{scenario.demandPerDay} uds/día</strong> (+{deltaAbs} uds de margen).
                </>
              ) : (
                <>
                  La capacidad actual es de <strong>{kpis.throughputPerDay} uds/día</strong>, generando un déficit diario de <strong>{deltaAbs} uds</strong> frente al objetivo de <strong>{scenario.demandPerDay} uds/día</strong>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Badges */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4 border-slate-200/80">
          {/* Bottleneck Badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-background/90 px-3 py-1.5 text-xs shadow-2xs">
            <Activity className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none">
                Restricción / Cuello
              </span>
              <span className="font-bold text-foreground text-[11px] truncate max-w-[130px]" title={kpis.bottleneckStationName}>
                {kpis.bottleneckStationName || "—"}
              </span>
            </div>
          </div>

          {/* Efficiency Badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-background/90 px-3 py-1.5 text-xs shadow-2xs">
            <Gauge className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none">
                Eficiencia Balanceo
              </span>
              <span className="font-bold text-foreground text-[11px]">
                {effPct}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
