"use client"

import { useState } from "react"
import "katex/dist/katex.min.css"
import { BlockMath } from "react-katex"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sliders, Clock, Users, ArrowRight } from "lucide-react"

export interface PlaygroundLabels {
  title: string
  subtitle: string
  shiftHours: string
  shiftsPerDay: string
  demand: string
  availableTime: string
  taktResult: string
  paceAggressive: string
  paceStandard: string
  paceRelaxed: string
}

export default function TaktPlayground({ labels }: { labels: PlaygroundLabels }) {
  const [shiftHours, setShiftHours] = useState<number>(8)
  const [shiftsPerDay, setShiftsPerDay] = useState<number>(1)
  const [demand, setDemand] = useState<number>(480)

  const availableMinutes = shiftHours * 60 * shiftsPerDay
  const taktMin = demand > 0 ? availableMinutes / demand : 0
  const taktSec = taktMin * 60

  let paceBadge = labels.paceStandard
  let badgeColor = "bg-blue-50 text-blue-700 border-blue-200 shadow-2xs"

  if (taktSec < 30) {
    paceBadge = labels.paceAggressive
    badgeColor = "bg-amber-50 text-amber-800 border-amber-300 shadow-2xs"
  } else if (taktSec > 120) {
    paceBadge = labels.paceRelaxed
    badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
  }

  // Live KaTeX formula
  const latexFormula = `T_{takt} = \\frac{${shiftHours}\\text{h} \\times 60 \\times ${shiftsPerDay}}{${demand}\\text{ uds}} = ${taktMin.toFixed(2)}\\text{ min/ud } (${taktSec.toFixed(1)}\\text{ s/ud})`

  return (
    <Card className="border-blue-200/80 bg-gradient-to-br from-blue-50/40 via-background to-slate-50/50 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-100/80 p-2 text-blue-700">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">{labels.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{labels.subtitle}</p>
            </div>
          </div>
          <Badge className={`w-fit border ${badgeColor} text-xs font-semibold px-2.5 py-1`}>
            {paceBadge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sliders Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Shift Hours */}
          <div className="space-y-2 rounded-lg border bg-background/80 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                {labels.shiftHours}
              </span>
              <span className="font-bold text-foreground">{shiftHours} h</span>
            </div>
            <input
              type="range"
              min={4}
              max={12}
              step={0.5}
              value={shiftHours}
              onChange={(e) => setShiftHours(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>4 h</span>
              <span>12 h</span>
            </div>
          </div>

          {/* Shifts per Day */}
          <div className="space-y-2 rounded-lg border bg-background/80 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                {labels.shiftsPerDay}
              </span>
              <span className="font-bold text-foreground">{shiftsPerDay}</span>
            </div>
            <div className="flex gap-1 pt-1">
              {[1, 2, 3].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setShiftsPerDay(val)}
                  className={`flex-1 rounded py-1 text-xs font-semibold transition-all ${
                    shiftsPerDay === val
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {val} {val === 1 ? "turno" : "turnos"}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Demand */}
          <div className="space-y-2 rounded-lg border bg-background/80 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                {labels.demand}
              </span>
              <span className="font-bold text-foreground">{demand} uds</span>
            </div>
            <input
              type="range"
              min={50}
              max={2000}
              step={10}
              value={demand}
              onChange={(e) => setDemand(parseInt(e.target.value, 10))}
              className="h-1.5 w-full cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>50 uds</span>
              <span>2.000 uds</span>
            </div>
          </div>
        </div>

        {/* Dynamic Formula Display */}
        <div className="rounded-lg border bg-background p-3 shadow-2xs">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Fórmula dinámica evaluada:</span>
            <span className="font-medium text-blue-700">
              {labels.availableTime}: {availableMinutes} min ({availableMinutes * 60}s)
            </span>
          </div>
          <div className="overflow-x-auto rounded bg-muted/40 px-3 py-1.5 text-foreground">
            <BlockMath math={latexFormula} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
