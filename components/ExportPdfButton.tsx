"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaktStore, useHydrated } from "@/lib/store"
import { generatePdf } from "@/lib/pdf-generator"

export default function ExportPdfButton() {
  const t = useTranslations("simulator.pdf")
  const tInsights = useTranslations("simulator.insights")
  const tImprovements = useTranslations("simulator.improvements")
  const locale = useLocale()
  const hydrated = useHydrated()
  const scenarioId = useTaktStore((s) => s.activeScenarioId)
  const hasStations = useTaktStore(
    (s) => (s.scenarios.find((sc) => sc.id === s.activeScenarioId)?.stations.length ?? 0) > 0
  )
  const [loading, setLoading] = useState(false)

  if (!hydrated) return null

  async function handleClick() {
    if (!scenarioId || loading) return
    setLoading(true)
    try {
      await generatePdf(scenarioId, { t, tInsights, tImprovements, locale })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading || !hasStations}
      className="transition-all hover:border-primary hover:text-primary"
    >
      <FileDown className="mr-2 h-4 w-4" />
      {loading ? t("generating") : t("button")}
    </Button>
  )
}
