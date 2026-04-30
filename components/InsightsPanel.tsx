"use client"

import { useMemo, useState } from "react"
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs } from "@/lib/calculations"
import { generateInsights } from "@/lib/insights"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { InsightType, Insight } from "@/lib/insights"

// ─── Insight styles ───────────────────────────────────────────────────────────

const ICON_MAP: Record<InsightType, React.ComponentType<{ className?: string }>> = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
}

const STYLE_MAP: Record<InsightType, { wrap: string; icon: string }> = {
  critical: { wrap: "border-red-200 bg-red-50", icon: "text-red-600" },
  warning:  { wrap: "border-amber-200 bg-amber-50", icon: "text-amber-600" },
  success:  { wrap: "border-green-200 bg-green-50", icon: "text-green-600" },
  info:     { wrap: "border-blue-200 bg-blue-50", icon: "text-blue-600" },
}

// ─── Single insight block ─────────────────────────────────────────────────────

function InsightBlock({ insight }: { insight: Insight }) {
  const Icon = ICON_MAP[insight.type]
  const styles = STYLE_MAP[insight.type]
  return (
    <div className={cn("flex gap-3 rounded-lg border p-3", styles.wrap)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.icon)} aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{insight.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{insight.message}</p>
      </div>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function InsightsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <div className="h-5 w-5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const MAX_VISIBLE = 6

export default function InsightsPanel() {
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const [expanded, setExpanded] = useState(false)

  const insights = useMemo(() => {
    if (!scenario || scenario.stations.length === 0) return []
    const kpis = calculateAllKPIs(scenario)
    return generateInsights(scenario, kpis)
  }, [scenario])

  if (!hydrated) return <InsightsSkeleton />

  if (!scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Análisis automático</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            Los insights aparecerán cuando definas la línea.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Detectamos cuellos de botella, desbalances y oportunidades de mejora automáticamente.
          </p>
        </CardContent>
      </Card>
    )
  }

  const visible = expanded ? insights : insights.slice(0, MAX_VISIBLE)
  const hiddenCount = insights.length - MAX_VISIBLE

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <Lightbulb className="h-5 w-5 text-primary" aria-hidden />
        <CardTitle className="text-lg">Análisis automático</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visible.map((insight, i) => (
            <InsightBlock key={i} insight={insight} />
          ))}
        </div>

        {hiddenCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full text-xs text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-3.5 w-3.5" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
                Ver {hiddenCount} más
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
