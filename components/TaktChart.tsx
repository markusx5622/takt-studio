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

// ─── Custom XAxis tick with multiline word-wrap ──────────────────────────────

interface CustomTickProps {
  x?: number
  y?: number
  payload?: { value: string }
}

function CustomXAxisTick({ x = 0, y = 0, payload }: CustomTickProps) {
  if (!payload?.value) return null
  const text = payload.value

  const words = text.split(" ")
  let line1 = text
  let line2 = ""

  if (text.length > 13 && words.length > 1) {
    const mid = Math.ceil(words.length / 2)
    line1 = words.slice(0, mid).join(" ")
    line2 = words.slice(mid).join(" ")
    if (line1.length > 15) line1 = `${line1.substring(0, 14)}…`
    if (line2.length > 15) line2 = `${line2.substring(0, 14)}…`
  } else if (text.length > 16) {
    line1 = `${text.substring(0, 15)}…`
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="end"
        fill="#6b7280"
        fontSize={10}
        fontWeight={500}
        transform="rotate(-25)"
      >
        <tspan x={0} dy="8">{line1}</tspan>
        {line2 && <tspan x={0} dy="11">{line2}</tspan>}
      </text>
    </g>
  )
}

export default function TaktChart({ scenarioId, height = 380 }: TaktChartProps) {
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
      <CardContent className="pr-4 pl-1 pb-4">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 95, left: 5, bottom: 75 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

            <XAxis
              dataKey="name"
              tick={<CustomXAxisTick />}
              interval={0}
              height={75}
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
                  fontWeight: 600,
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
