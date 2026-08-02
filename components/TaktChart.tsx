"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { useTaktStore, useHydrated } from "@/lib/store"
import { getStationsWithEffective, calculateTaktTime } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { StationWithEffective } from "@/types"

const COLOR_EXCEEDS = "#dc2626"
const COLOR_BOTTLENECK = "#f59e0b"
const COLOR_NORMAL = "#2563eb"

function getBarColor(station: StationWithEffective): string {
  if (station.exceedsTakt) return COLOR_EXCEEDS
  if (station.isBottleneck) return COLOR_BOTTLENECK
  return COLOR_NORMAL
}

function truncate(str: string, max = 15): string {
  return str.length > max ? `${str.substring(0, max)}…` : str
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: StationWithEffective }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  const t = useTranslations("simulator.chart")
  if (!active || !payload?.length) return null
  const s = payload[0]?.payload
  if (!s) return null

  return (
    <div className="rounded-md border bg-background p-3 text-xs shadow-md">
      <p className="mb-2 font-semibold">{s.name}</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>
          {t("tooltipCycle")}{" "}
          <span className="font-medium text-foreground">
            {s.cycleTimeMin} {t("minUnit")}
          </span>
        </p>
        <p>
          {t("tooltipOperators")}{" "}
          <span className="font-medium text-foreground">{s.operators}</span>
        </p>
        <p>
          {t("tooltipEffective")}{" "}
          <span className="font-medium text-foreground">
            {s.effectiveCycleMin.toFixed(1)} {t("minUnit")}
          </span>
        </p>
        <p>
          {t("tooltipFailure")}{" "}
          <span className="font-medium text-foreground">
            {(s.failureRate * 100).toFixed(0)}%
          </span>
        </p>
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function TaktChartSkeleton({ height }: { height: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-5 w-52 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="animate-pulse rounded bg-muted" style={{ height }} />
      </CardContent>
    </Card>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface TaktChartProps {
  scenarioId?: string
  height?: number
}

export default function TaktChart({ scenarioId, height = 350 }: TaktChartProps) {
  const t = useTranslations("simulator.chart")
  const hydrated = useHydrated()
  const scenario = useTaktStore((state) =>
    state.scenarios.find((sc) => sc.id === (scenarioId ?? state.activeScenarioId))
  )

  const taktTimeMin = useMemo(
    () => (scenario ? calculateTaktTime(scenario) : 0),
    [scenario]
  )

  const chartData = useMemo(
    () => (scenario ? getStationsWithEffective(scenario.stations, taktTimeMin) : []),
    [scenario, taktTimeMin]
  )

  if (!hydrated) return <TaktChartSkeleton height={height} />

  if (!scenario || scenario.stations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent
          className="flex flex-col items-center justify-center gap-3 text-center"
          style={{ height }}
        >
          <BarChart3 className="h-10 w-10 text-muted-foreground/25" />
          <p className="text-sm text-muted-foreground">
            {t("empty")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="pr-2">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 70, left: 0, bottom: 65 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

            <XAxis
              dataKey="name"
              tickFormatter={(v: string) => truncate(v)}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={70}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              label={{
                value: t("axisMinPerUnit"),
                angle: -90,
                position: "insideLeft",
                offset: 15,
                style: { fontSize: 11, fill: "#6b7280" },
              }}
              width={60}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />

            {taktTimeMin > 0 && (
              <ReferenceLine
                y={taktTimeMin}
                stroke="#374151"
                strokeDasharray="8 4"
                strokeWidth={2}
                label={{
                  value: t("taktLine", { value: taktTimeMin.toFixed(1) }),
                  position: "right",
                  fill: "#374151",
                  fontSize: 11,
                }}
              />
            )}

            <Bar dataKey="effectiveCycleMin" radius={[4, 4, 0, 0]} maxBarSize={56}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
