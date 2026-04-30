"use client"

import { useState } from "react"
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
  critical: { wrap: "border-red-200 bg-red-50",    icon: "text-red-600" },
  warning:  { wrap: "border-amber-200 bg-amber-50", icon: "text-amber-600" },
  success:  { wrap: "border-green-200 bg-green-50", icon: "text-green-600" },
  info:     { wrap: "border-blue-200 bg-blue-50",   icon: "text-blue-600" },
}

// ─── Single insight block ─────────────────────────────────────────────────────

function InsightBlock({ insight }: { insight: Insight }) {
  const Icon = ICON_MAP[insight.type]
  const styles = STYLE_MAP[insight.type]
  return (
    <div className={cn("flex gap-3 rounded-lg border p-3", styles.wrap)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.icon)} />
      <div>
        <p className="text-sm font-semibold leading-tight">{insight.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{insight.message}</p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const MAX_VISIBLE = 5

export default function InsightsPanel() {
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === state.activeScenarioId)
  )
  const [expanded, setExpanded] = useState(false)

  if (!hydrated || !scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4 space-y-0">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Análisis automático</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[120px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Añade estaciones para obtener análisis.
          </p>
        </CardContent>
      </Card>
    )
  }

  const kpis = calculateAllKPIs(scenario)
  const insights = generateInsights(scenario, kpis)
  const visible = expanded ? insights : insights.slice(0, MAX_VISIBLE)
  const hiddenCount = insights.length - MAX_VISIBLE

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">Análisis automático</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((insight, i) => (
          <InsightBlock key={i} insight={insight} />
        ))}

        {hiddenCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
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
