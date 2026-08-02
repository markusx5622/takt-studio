"use client"

import { useMemo } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs, generateRecommendations, simulateScenario, calculateRecommendationEconomicImpact } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Wrench,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Euro,
} from "lucide-react"
import type { ImprovementRecommendation, ImprovementPriority } from "@/types"

// ─── Priority styles ───────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<
  ImprovementPriority,
  { badge: string; labelKey: string; border: string }
> = {
  high: {
    badge: "bg-red-100 text-red-800",
    labelKey: "priorityHigh",
    border: "border-red-200/60",
  },
  medium: {
    badge: "bg-amber-100 text-amber-800",
    labelKey: "priorityMedium",
    border: "border-amber-200/60",
  },
  low: {
    badge: "bg-blue-100 text-blue-800",
    labelKey: "priorityLow",
    border: "border-border",
  },
}

// ─── Compact recommendation card ───────────────────────────────────────────────

function RecommendationCard({
  rec,
  scenario,
  onApply,
}: {
  rec: ImprovementRecommendation
  scenario: import("@/types").Scenario
  onApply: (rec: ImprovementRecommendation) => void
}) {
  const t = useTranslations("simulator.improvements")
  const locale = useLocale()
  const styles = PRIORITY_STYLES[rec.priority]
  const recTitle = t(`recs.${rec.titleKey}.title`, rec.titleValues)

  // Mini ROI
  const projectedScenario = useMemo(() => {
    const stationChanges = rec.stationChanges?.map((c) => ({
      stationId: c.originalStationId,
      updates: c.updates,
    }))
    const { scenario: proj } = simulateScenario(scenario, stationChanges, rec.scenarioChanges)
    return proj
  }, [rec, scenario])

  const economicImpact = useMemo(() => {
    return calculateRecommendationEconomicImpact(scenario, projectedScenario, rec.type)
  }, [scenario, projectedScenario, rec.type])

  const throughputPositive = rec.throughputDelta > 0
  const balancingPositive = rec.balancingDelta > 0
  const leadTimePositive = rec.leadTimeDelta < 0

  const throughputDeltaText = throughputPositive
    ? `+${rec.throughputDelta} ${t("unitsUds")}`
    : rec.throughputDelta < 0
      ? `${rec.throughputDelta} ${t("unitsUds")}`
      : t("noChange")

  const balancingDeltaText =
    Math.abs(rec.balancingDelta) >= 0.1
      ? `${rec.balancingDelta > 0 ? "+" : ""}${rec.balancingDelta.toFixed(1)} pp`
      : t("noChange")

  const leadTimeDeltaText =
    Math.abs(rec.leadTimeDelta) >= 0.1
      ? `${rec.leadTimeDelta > 0 ? "+" : ""}${rec.leadTimeDelta.toFixed(1)} min`
      : t("noChange")

  return (
    <div
      className={cn(
        "flex w-[320px] shrink-0 flex-col rounded-lg border bg-background p-3.5 transition-all duration-200 hover:shadow-sm sm:w-[340px]",
        styles.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Wrench className="h-3.5 w-3.5 shrink-0 text-primary" />
          <h4 className="text-sm font-semibold leading-tight">{recTitle}</h4>
        </div>
        <div className="flex shrink-0 gap-1">
          <Badge variant="outline" className={cn("text-[10px]", styles.badge)}>
            {t(styles.labelKey)}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="mt-1.5 text-xs leading-relaxed text-foreground/70 line-clamp-2">
        {t(`recs.${rec.descriptionKey}.description`)}
      </p>

      {/* Impact grid */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-md border bg-muted/20 p-2">
        <div className="flex flex-col">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {t("throughput")}
          </span>
          <span className="text-sm font-semibold">{rec.projectedKpis.throughputPerDay}</span>
          <span
            className={cn(
              "text-[10px] font-medium",
              throughputPositive ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {throughputDeltaText}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {t("demand")}
          </span>
          <span className="text-sm font-semibold">
            {rec.meetsDemandAfter ? t("meets") : t("notMeets")}
          </span>
          {rec.meetsDemandAfter && !rec.baseKpis.meetsDemand && (
            <span className="text-[10px] font-medium text-green-600">{t("passesToMeet")}</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {t("balancing")}
          </span>
          <span className="text-sm font-semibold">
            {(rec.projectedKpis.balancingEfficiency * 100).toFixed(0)}%
          </span>
          <span
            className={cn(
              "text-[10px] font-medium",
              balancingPositive ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {balancingDeltaText}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {t("leadTime")}
          </span>
          <span className="text-sm font-semibold">
            {rec.projectedKpis.leadTimeMin.toFixed(1)} min
          </span>
          <span
            className={cn(
              "text-[10px] font-medium",
              leadTimePositive ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {leadTimeDeltaText}
          </span>
        </div>
      </div>

      {/* Mini ROI */}
      <div className="mt-2 flex items-center justify-between rounded-md border bg-muted/20 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <Euro className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-medium text-muted-foreground">{t("netImpact")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[11px] font-bold",
              economicImpact.netImpactPerDay > 0
                ? "text-green-600"
                : economicImpact.netImpactPerDay < 0
                  ? "text-red-600"
                  : "text-muted-foreground"
            )}
          >
            {economicImpact.netImpactPerDay > 0 ? "+" : ""}
            {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(economicImpact.netImpactPerDay)} {t("perDay")}
          </span>
          {economicImpact.oneOffCost > 0 && economicImpact.paybackDays !== null && (
            <Badge variant="outline" className="text-[9px]">
              {t("paybackDays", { days: economicImpact.paybackDays.toFixed(1) })}
            </Badge>
          )}
          {economicImpact.oneOffCost > 0 && economicImpact.paybackDays === null && (
            <Badge variant="outline" className="text-[9px] text-muted-foreground">
              {t("paybackNA")}
            </Badge>
          )}
          {economicImpact.oneOffCost === 0 && (
            <Badge variant="outline" className="text-[9px] text-muted-foreground">
              {t("noInvestment")}
            </Badge>
          )}
        </div>
      </div>

      {/* Badge + Action */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
        {rec.badgeKey && (
          <Badge variant="outline" className="text-[10px]">
            {t(`badges.${rec.badgeKey}`)}
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "ml-auto gap-1.5 text-[11px] transition-all duration-200 hover:bg-muted hover:border-foreground/20",
            !rec.badgeKey && "w-full"
          )}
          onClick={() => onApply(rec)}
        >
          <ArrowRight className="h-3 w-3" />
          {t("apply")}
        </Button>
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function ImprovementPlanSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <div className="h-5 w-5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-52 w-[320px] shrink-0 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ImprovementPlan() {
  const t = useTranslations("simulator.improvements")
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const createScenarioVariant = useTaktStore((s) => s.createScenarioVariant)

  const kpis = useMemo(
    () => (scenario && scenario.stations.length > 0 ? calculateAllKPIs(scenario) : null),
    [scenario]
  )

  const recommendations = useMemo(() => {
    if (!scenario || !kpis) return []
    return generateRecommendations(scenario, kpis)
  }, [scenario, kpis])

  if (!hydrated) return <ImprovementPlanSkeleton />

  if (!scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {t("empty")}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-center">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {t("wellConfigured")}
          </p>
        </CardContent>
      </Card>
    )
  }

  function handleApply(rec: ImprovementRecommendation) {
    if (!scenario) return
    createScenarioVariant(
      scenario.id,
      `${scenario.name} — ${t(`recs.${rec.titleKey}.title`, rec.titleValues)}`,
      rec.stationChanges,
      rec.scenarioChanges
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <Lightbulb className="h-5 w-5 text-primary" aria-hidden />
        <div>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <CardDescription className="text-xs">
            {t("description")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} scenario={scenario} onApply={handleApply} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
