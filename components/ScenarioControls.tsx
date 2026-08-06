"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { encodeScenarioToHash } from "@/lib/share"
import { useTaktStore, useHydrated } from "@/lib/store"
import { createPresetFromSector, INDUSTRY_PRESETS_DATA, type IndustrySectorKey } from "@/lib/presets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Plus, Trash2, Share2, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import ExportPdfButton from "@/components/ExportPdfButton"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ScenarioControlsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="h-6 w-56 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ScenarioControls() {
  const t = useTranslations("simulator.controls")
  const tStations = useTranslations("simulator.stations")
  const locale = useLocale()
  const hydrated = useHydrated()
  const scenarios = useTaktStore((s) => s.scenarios)
  const activeScenarioId = useTaktStore((s) => s.activeScenarioId)
  const scenario = useTaktStore((s) =>
    s.scenarios.find((sc) => sc.id === s.activeScenarioId)
  )
  const updateScenario = useTaktStore((s) => s.updateScenario)
  const setActiveScenario = useTaktStore((s) => s.setActiveScenario)
  const duplicateScenario = useTaktStore((s) => s.duplicateScenario)
  const addScenario = useTaktStore((s) => s.addScenario)
  const removeScenario = useTaktStore((s) => s.removeScenario)

  const [copied, setCopied] = useState(false)

  function handleLoadPreset(sector: IndustrySectorKey) {
    if (!scenario) return
    const presetData = INDUSTRY_PRESETS_DATA[sector]
    if (!presetData) return

    const isEn = locale.toLowerCase().startsWith("en")
    const confirmName = isEn ? presetData.nameEn : presetData.nameEs
    if (confirm(tStations("presetConfirm", { name: confirmName }))) {
      const newStations = createPresetFromSector(sector, locale)
      updateScenario(scenario.id, {
        stations: newStations,
        demandPerDay: presetData.demandPerDay,
        shiftHours: presetData.shiftHours,
        shiftsPerDay: presetData.shiftsPerDay,
      })
    }
  }

  async function handleShare() {
    if (!scenario) return
    const hash = encodeScenarioToHash(scenario)
    const url = `${window.location.origin}${window.location.pathname}#${hash}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  if (!hydrated) return <ScenarioControlsSkeleton />
  if (!scenario) return null

  function handleDemandChange(value: string) {
    const n = parseInt(value, 10)
    if (!isNaN(n) && n >= 1) updateScenario(scenario!.id, { demandPerDay: n })
  }

  function handleShiftHoursChange(value: string) {
    const n = parseFloat(value)
    if (!isNaN(n) && n >= 1 && n <= 12) updateScenario(scenario!.id, { shiftHours: n })
  }

  function handleDelete() {
    if (confirm(t("deleteConfirm", { name: scenario!.name }))) {
      removeScenario(scenario!.id)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">{t("title")}</CardTitle>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            {tStations("presetLabel")}
          </span>
          <select
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value as IndustrySectorKey
              if (val) {
                handleLoadPreset(val)
                e.target.value = ""
              }
            }}
            className="h-8 rounded-md border border-slate-200/80 bg-background px-2.5 text-xs font-medium text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="" disabled>
              {tStations("presetSelectPlaceholder")}
            </option>
            <option value="monobath">{tStations("presetMonobath")}</option>
            <option value="ceramics">{tStations("presetCeramics")}</option>
            <option value="automotive">{tStations("presetAutomotive")}</option>
            <option value="electronics">{tStations("presetElectronics")}</option>
            <option value="logistics">{tStations("presetLogistics")}</option>
            <option value="food_pharma">{tStations("presetFoodPharma")}</option>
            <option value="machinery">{tStations("presetMachinery")}</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Parameter grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label htmlFor="sc-name" className="text-sm font-medium">{t("nameLabel")}</label>
            <Input
              id="sc-name"
              value={scenario.name}
              placeholder={t("namePlaceholder")}
              onChange={(e) => updateScenario(scenario.id, { name: e.target.value })}
            />
          </div>

          {/* Demanda */}
          <div className="space-y-1.5">
            <label htmlFor="sc-demand" className="text-sm font-medium">{t("demandLabel")}</label>
            <Input
              id="sc-demand"
              type="number"
              min={1}
              step={1}
              value={scenario.demandPerDay}
              onChange={(e) => handleDemandChange(e.target.value)}
            />
          </div>

          {/* Horas por turno */}
          <div className="space-y-1.5">
            <label htmlFor="sc-hours" className="text-sm font-medium">{t("hoursLabel")}</label>
            <Input
              id="sc-hours"
              type="number"
              min={1}
              max={12}
              step={0.5}
              value={scenario.shiftHours}
              onChange={(e) => handleShiftHoursChange(e.target.value)}
            />
          </div>

          {/* Turnos por día — segmented control */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" id="sc-shifts-label">{t("shiftsLabel")}</label>
            <div className="flex gap-2" role="group" aria-labelledby="sc-shifts-label">
              {([1, 2, 3] as const).map((n) => (
                <Button
                  key={n}
                  variant={scenario.shiftsPerDay === n ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateScenario(scenario.id, { shiftsPerDay: n })}
                  aria-pressed={scenario.shiftsPerDay === n}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario management row */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          {/* Scenario selector */}
          <select
            value={activeScenarioId}
            onChange={(e) => setActiveScenario(e.target.value)}
            className={cn(
              "h-9 max-w-xs flex-1 rounded-md border border-input bg-background px-3 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateScenario(scenario.id, `${scenario.name} ${t("copySuffix")}`)}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t("duplicate")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => addScenario(t("newScenarioName"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("new")}
          </Button>

          {scenarios.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
              {copied ? t("copied") : t("share")}
            </Button>
            <ExportPdfButton />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
