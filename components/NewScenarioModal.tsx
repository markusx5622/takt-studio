"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import { useHydrated } from "@/lib/store"
import { type IndustrySectorKey, INDUSTRY_PRESETS_DATA } from "@/lib/presets"
import { Button } from "@/components/ui/button"
import { Sparkles, Factory, Layers, Car, Cpu, Package, Droplet, Settings, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NewScenarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPreset: (sector: IndustrySectorKey) => void
  locale: string
}

const SECTOR_ICONS: Record<IndustrySectorKey, React.ComponentType<{ className?: string }>> = {
  monobath: Layers,
  automotive: Car,
  electronics: Cpu,
  logistics: Package,
  ceramics: Factory,
  food_pharma: Droplet,
  machinery: Settings,
}

export default function NewScenarioModal({
  isOpen,
  onClose,
  onSelectPreset,
  locale,
}: NewScenarioModalProps) {
  const t = useTranslations("simulator.onboarding")
  const [selectedSector, setSelectedSector] = useState<IndustrySectorKey>("monobath")
  const hydrated = useHydrated()

  if (!isOpen || !hydrated) return null

  const isEn = locale.toLowerCase().startsWith("en")
  const sectors = Object.entries(INDUSTRY_PRESETS_DATA) as [IndustrySectorKey, typeof INDUSTRY_PRESETS_DATA[IndustrySectorKey]][]

  function handleConfirmLoad() {
    onSelectPreset(selectedSector)
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-2xl border bg-background p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-blue-50 border border-blue-200/80 p-3.5 text-blue-600 shrink-0 shadow-2xs">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("title")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Preset Selector Grid */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("presetHeading")}
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {sectors.map(([key, data]) => {
              const Icon = SECTOR_ICONS[key] || Factory
              const name = isEn ? data.nameEn : data.nameEs
              const isSelected = selectedSector === key

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedSector(key)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-150 cursor-pointer",
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 text-foreground shadow-2xs"
                      : "border-border/60 bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn("rounded-lg p-2 shrink-0 transition-colors", isSelected ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-foreground">{name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {data.stations.length} estaciones · {data.demandPerDay} uds/día
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground"
          >
            {t("manualBtn")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirmLoad}
            className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 shadow-xs"
          >
            <span>{t("loadPresetBtn")}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Tip */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-xs text-amber-900/80">
          {t("tip")}
        </div>
      </div>
    </div>,
    document.body
  )
}
