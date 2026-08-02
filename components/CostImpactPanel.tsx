"use client"

import { useMemo } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs, calculateEconomicKPIs, normalizeEconomics } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Euro, TrendingUp, TrendingDown, AlertTriangle, Wallet, Briefcase } from "lucide-react"
import type { EconomicInputs } from "@/types"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CostImpactSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Economic input row ───────────────────────────────────────────────────────

function EconInput({
  label,
  value,
  onChange,
  suffix,
  min = 0,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
  min?: number
  step?: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v) && v >= min) onChange(v)
          }}
          className="pr-8 text-sm"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Primary metric card ──────────────────────────────────────────────────────

function PrimaryMetric({
  icon: Icon,
  label,
  value,
  unit,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  unit: string
  tone?: "positive" | "negative" | "neutral"
}) {
  const toneClass =
    tone === "positive"
      ? "border-green-200/60 bg-green-50/40"
      : tone === "negative"
        ? "border-red-200/60 bg-red-50/40"
        : "border-border bg-muted/20"

  const iconColor =
    tone === "positive" ? "text-green-600" : tone === "negative" ? "text-red-600" : "text-primary"

  return (
    <div className={cn("flex flex-col rounded-lg border p-3", toneClass)}>
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold tabular-nums">{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

// ─── Secondary row ────────────────────────────────────────────────────────────

function SecondaryRow({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold tabular-nums">{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CostImpactPanel() {
  const t = useTranslations("simulator.costs")
  const locale = useLocale()
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const updateScenario = useTaktStore((s) => s.updateScenario)

  const kpis = useMemo(
    () => (scenario && scenario.stations.length > 0 ? calculateAllKPIs(scenario) : null),
    [scenario]
  )

  const econKpis = useMemo(() => {
    if (!scenario || !kpis) return null
    return calculateEconomicKPIs(scenario, kpis)
  }, [scenario, kpis])

  if (!hydrated) return <CostImpactSkeleton />

  if (!scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Euro className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[100px] flex-col items-center justify-center gap-2 text-center">
          <AlertTriangle className="h-7 w-7 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {t("empty")}
          </p>
        </CardContent>
      </Card>
    )
  }

  const economics = normalizeEconomics(scenario.economics)
  const scenarioId = scenario.id

  function updateEcon(partial: Partial<EconomicInputs>) {
    updateScenario(scenarioId, {
      economics: { ...economics, ...partial },
    })
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n)

  const profitTone: "positive" | "negative" | "neutral" =
    (econKpis?.profitProxyPerDay ?? 0) > 0 ? "positive" : "negative"

  // Executive summary
  let summary = ""
  if (econKpis) {
    if (econKpis.demandShortfallUnitsPerDay > 0) {
      summary = t("summaryGap", { value: fmt(econKpis.opportunityGapValuePerDay) })
    } else if (econKpis.profitProxyPerDay > 0) {
      summary = t("summaryProfit", { value: fmt(econKpis.profitProxyPerDay) })
    } else {
      summary = t("summaryLoss")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <Euro className="h-5 w-5 text-primary" aria-hidden />
        <div>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <CardDescription className="text-xs">
            {t("description")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* ── Supuestos económicos ────────────────────────────────────────── */}
        <div>
          <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            {t("assumptions")}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <EconInput
              label={t("laborCostHour")}
              value={economics.laborCostPerHour}
              onChange={(v) => updateEcon({ laborCostPerHour: v })}
              suffix="€"
              step={0.5}
            />
            <EconInput
              label={t("marginUnit")}
              value={economics.contributionMarginPerUnit}
              onChange={(v) => updateEcon({ contributionMarginPerUnit: v })}
              suffix="€"
            />
            <EconInput
              label={t("reworkCostUnit")}
              value={economics.reworkCostPerUnit}
              onChange={(v) => updateEcon({ reworkCostPerUnit: v })}
              suffix="€"
            />
            <EconInput
              label={t("shiftFixedCost")}
              value={economics.shiftFixedCostPerDay}
              onChange={(v) => updateEcon({ shiftFixedCostPerDay: v })}
              suffix="€"
            />
            <EconInput
              label={t("methodInvestment")}
              value={economics.methodImprovementOneOffCost}
              onChange={(v) => updateEcon({ methodImprovementOneOffCost: v })}
              suffix="€"
            />
            <EconInput
              label={t("qualityInvestment")}
              value={economics.qualityImprovementOneOffCost}
              onChange={(v) => updateEcon({ qualityImprovementOneOffCost: v })}
              suffix="€"
            />
            <EconInput
              label={t("workingDays")}
              value={economics.workingDaysPerMonth}
              onChange={(v) => updateEcon({ workingDaysPerMonth: v })}
              suffix="d"
              step={1}
            />
          </div>
        </div>

        {/* ── KPIs económicos principales ─────────────────────────────────── */}
        {econKpis && (
          <>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <PrimaryMetric
                icon={Wallet}
                label={t("profitProxyDay")}
                value={fmt(econKpis.profitProxyPerDay)}
                unit="€"
                tone={profitTone}
              />
              <PrimaryMetric
                icon={TrendingUp}
                label={t("servedContribution")}
                value={fmt(econKpis.fulfilledContributionPerDay)}
                unit="€"
                tone="neutral"
              />
              <PrimaryMetric
                icon={Briefcase}
                label={t("totalOpCost")}
                value={fmt(econKpis.totalOperatingCostPerDay)}
                unit="€"
                tone="neutral"
              />
            </div>

            {/* ── Métricas secundarias ────────────────────────────────────── */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t("breakdown")}
              </span>
              <SecondaryRow
                label={t("laborCostDay")}
                value={fmt(econKpis.laborCostPerDay)}
                unit="€"
              />
              <SecondaryRow
                label={t("reworkCostDay")}
                value={fmt(econKpis.reworkCostPerDay)}
                unit="€"
              />
              <SecondaryRow
                label={t("shiftCostDay")}
                value={fmt(econKpis.shiftCostPerDay)}
                unit="€"
              />
              <SecondaryRow
                label={t("lostOpportunity")}
                value={fmt(econKpis.opportunityGapValuePerDay)}
                unit="€"
              />
              <SecondaryRow
                label={t("profitProxyMonth")}
                value={fmt(econKpis.profitProxyPerDay * economics.workingDaysPerMonth)}
                unit="€"
              />
            </div>

            {/* ── Lectura ejecutiva ───────────────────────────────────────── */}
            <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
              <div className="flex items-start gap-2">
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-xs font-medium leading-snug text-foreground/80">{summary}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
