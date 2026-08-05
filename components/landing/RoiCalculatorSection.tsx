"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calculator, TrendingUp } from "lucide-react"

export default function RoiCalculatorSection() {
  const t = useTranslations("landing.roiCalculator")

  const [hoursPerDay, setHoursPerDay] = useState<number>(2.5)
  const [hourlyCost, setHourlyCost] = useState<number>(65)
  const workingDays = 220

  // Calculations
  const dailyLoss = hoursPerDay * hourlyCost
  const annualLoss = Math.round(dailyLoss * workingDays)
  const estimatedSavings = Math.round(annualLoss * 0.45) // ~45% potential improvement

  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-16">
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/60 via-background to-indigo-50/50 p-8 shadow-md backdrop-blur-xl md:p-12">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/70 px-3.5 py-1 text-xs font-semibold text-blue-800">
            <Calculator className="h-3.5 w-3.5" />
            {t("badge")}
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground sm:text-sm">
            {t("sub")}
          </p>
        </div>

        {/* Sliders & Results Grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Sliders Column */}
          <div className="space-y-6 lg:col-span-7">
            {/* Slider 1: Lost Hours */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>{t("bottleneckHours")}</span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">{hoursPerDay} h/día</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-200 accent-blue-600"
              />
            </div>

            {/* Slider 2: Hourly Downtime Cost */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>{t("hourlyCost")}</span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">{hourlyCost} €/h</span>
              </div>
              <input
                type="range"
                min="25"
                max="200"
                step="5"
                value={hourlyCost}
                onChange={(e) => setHourlyCost(parseInt(e.target.value, 10))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-200 accent-blue-600"
              />
            </div>

            {/* Working days preset indicator */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Días lectivos al año estimados:</span>
              <span className="font-medium text-foreground">{workingDays} días/año</span>
            </div>
          </div>

          {/* Results Column */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-background/90 p-6 shadow-sm lg:col-span-5">
            <div>
              <span className="text-xs font-medium text-muted-foreground">{t("annualLossLabel")}</span>
              <div className="mt-1 flex items-baseline gap-1 text-2xl font-bold text-red-600 sm:text-3xl">
                <span>{annualLoss.toLocaleString("es-ES")}</span>
                <span className="text-sm font-semibold">€/año</span>
              </div>
            </div>

            <hr className="border-border/60" />

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <TrendingUp className="h-4 w-4" />
                <span>{t("potentialSavingsLabel")}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1 text-3xl font-extrabold text-emerald-600 sm:text-4xl">
                <span>+{estimatedSavings.toLocaleString("es-ES")}</span>
                <span className="text-sm font-bold">€/año</span>
              </div>
            </div>

            <Button asChild size="default" className="mt-2 w-full gap-2 shadow-sm">
              <Link href="/simulador">
                {t("cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
