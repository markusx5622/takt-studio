"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useHydrated } from "@/lib/store"
import { generateComparativePdf } from "@/lib/pdf-comparator"

export default function ExportComparePdfButton({
  scenarioAId,
  scenarioBId,
}: {
  scenarioAId: string
  scenarioBId: string
}) {
  const tCompare = useTranslations("compare")
  const tPdf = useTranslations("simulator.pdf")
  const locale = useLocale()
  const hydrated = useHydrated()
  const [loading, setLoading] = useState(false)

  if (!hydrated) return null

  async function handleClick() {
    if (!scenarioAId || !scenarioBId || loading) return
    setLoading(true)
    try {
      await generateComparativePdf(scenarioAId, scenarioBId, { tCompare, tPdf, locale })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading || scenarioAId === scenarioBId}
      className="transition-all hover:border-primary hover:text-primary"
    >
      <FileDown className="mr-2 h-4 w-4" />
      {loading ? tCompare("pdfGenerating") : tCompare("pdfButton")}
    </Button>
  )
}
