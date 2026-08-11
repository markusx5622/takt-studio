"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { encodeScenarioToHash } from "@/lib/share"
import { useTaktStore, useHydrated } from "@/lib/store"
import { createPresetFromSector, INDUSTRY_PRESETS_DATA, type IndustrySectorKey } from "@/lib/presets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Plus, Trash2, Share2, Check, Sparkles, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import ExportPdfButton from "@/components/ExportPdfButton"
import NewScenarioModal from "@/components/NewScenarioModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [showOnboarding, setShowOnboarding] = useState(false)

  function handleLoadPreset(sector: IndustrySectorKey) {
    if (!scenario) return
    const presetData = INDUSTRY_PRESETS_DATA[sector]
    if (!presetData) return

    const isEn = locale.toLowerCase().startsWith("en")
    const presetName = isEn ? presetData.nameEn : presetData.nameEs
    if (confirm(tStations("presetConfirm", { name: presetName }))) {
      const newStations = createPresetFromSector(sector, locale)
      updateScenario(scenario.id, {
        name: presetName,
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

  function handleCreateNewScenario() {
    addScenario(t("newScenarioName"))
    setShowOnboarding(true)
  }

  function handleDirectPresetLoad(sector: IndustrySectorKey) {
    if (!scenario) return
    const presetData = INDUSTRY_PRESETS_DATA[sector]
    if (!presetData) return

    const isEn = locale.toLowerCase().startsWith("en")
    const presetName = isEn ? presetData.nameEn : presetData.nameEs

    const newStations = createPresetFromSector(sector, locale)
    updateScenario(scenario.id, {
      name: presetName,
      stations: newStations,
      demandPerDay: presetData.demandPerDay,
      shiftHours: presetData.shiftHours,
      shiftsPerDay: presetData.shiftsPerDay,
    })
  }

  if (!hydrated) return <ScenarioControlsSkeleton />
  if (!scenario) {
    return (
      <Card className="border-dashed border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/40 via-background to-slate-50/50 p-8 sm:p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100/80 text-blue-600 mb-4 shadow-2xs">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("emptyStateTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          {t("emptyStateSubtitle")}
        </p>
        <div className="mt-6 flex items-center justify-center">
          <Button
            size="lg"
            onClick={handleCreateNewScenario}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-md cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>{t("createFirstScenario")}</span>
          </Button>
        </div>

        <NewScenarioModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onSelectPreset={handleDirectPresetLoad}
          locale={locale}
        />
      </Card>
    )
  }

  function handleDemandChange(value: string) {
    const n = parseInt(value, 10)
    if (!isNaN(n) && n >= 1) updateScenario(scenario!.id, { demandPerDay: n })
  }

  function handleShiftHoursChange(value: string) {
    const n = parseFloat(value)
    if (!isNaN(n) && n >= 1 && n <= 12) updateScenario(scenario!.id, { shiftHours: n })
  }

  function handleAllocationChange(value: string) {
    const n = parseInt(value, 10)
    if (!isNaN(n) && n >= 1 && n <= 100) updateScenario(scenario!.id, { allocationPercent: n })
  }

  function handleChangeoversPerDayChange(value: string) {
    const n = parseInt(value, 10)
    if (!isNaN(n) && n >= 0) updateScenario(scenario!.id, { changeoversPerDay: n })
  }

  function handleChangeoverTimeMinChange(value: string) {
    const n = parseFloat(value)
    if (!isNaN(n) && n >= 0) updateScenario(scenario!.id, { changeoverTimeMin: n })
  }

  function handleDelete() {
    if (confirm(t("deleteConfirm", { name: scenario!.name }))) {
      removeScenario(scenario!.id)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <Badge variant="outline" className="bg-blue-50/60 border-blue-200/80 text-blue-700 text-xs font-semibold px-2.5 py-0.5 shadow-2xs">
            <Clock className="mr-1 h-3 w-3 inline text-blue-600 shrink-0" />
            {t("availableTimeBadge", {
              hours: (scenario.shiftHours * scenario.shiftsPerDay).toFixed(0),
              minutes: (scenario.shiftHours * 60 * scenario.shiftsPerDay).toFixed(0),
            })}
          </Badge>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            {tStations("presetLabel")}
          </span>
          <Select
            value=""
            onValueChange={(val) => {
              if (val) {
                handleLoadPreset(val as IndustrySectorKey)
              }
            }}
          >
            <SelectTrigger className="h-8 w-[210px] text-xs font-medium">
              <SelectValue placeholder={tStations("presetSelectPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monobath">{tStations("presetMonobath")}</SelectItem>
              <SelectItem value="ceramics">{tStations("presetCeramics")}</SelectItem>
              <SelectItem value="automotive">{tStations("presetAutomotive")}</SelectItem>
              <SelectItem value="electronics">{tStations("presetElectronics")}</SelectItem>
              <SelectItem value="logistics">{tStations("presetLogistics")}</SelectItem>
              <SelectItem value="food_pharma">{tStations("presetFoodPharma")}</SelectItem>
              <SelectItem value="machinery">{tStations("presetMachinery")}</SelectItem>
            </SelectContent>
          </Select>
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

          {/* Allocation % (Shared Loading) */}
          <div className="space-y-1.5">
            <label htmlFor="sc-allocation" className="text-sm font-medium">{t("allocationLabel") ?? "Asignación (%)"}</label>
            <div className="flex items-center gap-2">
              <Input
                id="sc-allocation"
                type="number"
                min={1}
                max={100}
                step={1}
                value={scenario.allocationPercent ?? 100}
                onChange={(e) => handleAllocationChange(e.target.value)}
              />
            </div>
          </div>

          {/* Changeovers per Day */}
          <div className="space-y-1.5">
            <label htmlFor="sc-changeovers" className="text-sm font-medium">{t("changeoversPerDayLabel") ?? "Cambios/Día (SMED)"}</label>
            <Input
              id="sc-changeovers"
              type="number"
              min={0}
              step={1}
              value={scenario.changeoversPerDay ?? 0}
              onChange={(e) => handleChangeoversPerDayChange(e.target.value)}
            />
          </div>

          {/* Changeover Time */}
          <div className="space-y-1.5">
            <label htmlFor="sc-changeover-time" className="text-sm font-medium">{t("changeoverTimeMinLabel") ?? "Min/Cambio (SMED)"}</label>
            <Input
              id="sc-changeover-time"
              type="number"
              min={0}
              step={5}
              value={scenario.changeoverTimeMin ?? 0}
              onChange={(e) => handleChangeoverTimeMinChange(e.target.value)}
            />
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
            onClick={handleCreateNewScenario}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("new")}
          </Button>

          {scenarios.length >= 1 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive cursor-pointer"
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

      <NewScenarioModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSelectPreset={handleDirectPresetLoad}
        locale={locale}
      />
    </Card>
  )
}
