"use client"

import { useMemo, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs } from "@/lib/calculations"
import { CheckCircle2, AlertTriangle, Gauge, Activity, HardDrive, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ExecutiveHeaderBanner() {
  const t = useTranslations("simulator.executiveBanner")
  const locale = useLocale()
  const hydrated = useHydrated()
  const [copied, setCopied] = useState(false)

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

  function handleCopySummary() {
    if (!scenario || !kpis) return

    const isEn = locale.toLowerCase().startsWith("en")
    const dateStr = new Date().toLocaleDateString(isEn ? "en-US" : "es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    const summaryText = [
      `${t("summaryHeader")}`,
      `• ${t("summaryScenario")}: ${scenario.name}`,
      `• ${t("summaryStatus")}: ${meetsDemand ? t("statusPass") : t("statusFail")}`,
      `• ${t("summaryCapacity")}: ${kpis.throughputPerDay} ${isEn ? "units/day" : "uds/día"} (${isEn ? "Target Demand" : "Demanda"}: ${scenario.demandPerDay} ${isEn ? "units/day" : "uds/día"})`,
      `• ${t("summaryBottleneck")}: ${kpis.bottleneckStationName || "—"} (${kpis.bottleneckCycleMin.toFixed(1)} ${isEn ? "min/unit" : "min/ud"})`,
      `• ${t("summaryEfficiency")}: ${effPct}%`,
      `• ${t("summaryTaktTime")}: ${kpis.taktTimeMin.toFixed(1)} ${isEn ? "min/unit" : "min/ud"}`,
      `• ${t("summaryDate")}: ${dateStr}`,
    ].join("\n")

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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
                {meetsDemand
                  ? t("lineBalanced")
                  : t("lineDeficit", { delta: deltaAbs })}
              </span>
              <span className="text-xs font-semibold text-foreground/80">
                {scenario.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-2xs">
                <HardDrive className="h-3 w-3 text-blue-500" />
                {t("autoSave")}
              </span>
            </div>

            <p className="mt-1 text-xs text-foreground/75 leading-relaxed">
              {meetsDemand
                ? t("meetsText", {
                    capacity: kpis.throughputPerDay,
                    demand: scenario.demandPerDay,
                    delta: deltaAbs,
                  })
                : t("deficitText", {
                    capacity: kpis.throughputPerDay,
                    demand: scenario.demandPerDay,
                    delta: deltaAbs,
                  })}
            </p>
          </div>
        </div>

        {/* Right Badges & Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4 border-slate-200/80">
          {/* Bottleneck Badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-background/90 px-3 py-1.5 text-xs shadow-2xs">
            <Activity className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none">
                {t("bottleneckLabel")}
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
                {t("efficiencyLabel")}
              </span>
              <span className="font-bold text-foreground text-[11px]">
                {effPct}%
              </span>
            </div>
          </div>

          {/* Copy Summary Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="h-8 rounded-lg border-slate-200 bg-background/90 text-xs font-semibold shadow-2xs transition-all hover:bg-slate-100 hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-400">{t("copied")}</span>
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>{t("copySummary")}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
