import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import type { KPIs } from "@/types"

// ─── Impact summary (refined) ──────────────────────────────────────────────────

export default function ImpactSummary({ baseKpis, labKpis }: { baseKpis: KPIs; labKpis: KPIs }) {
  const t = useTranslations("simulator.lab.impact")
  const throughputDelta = labKpis.throughputPerDay - baseKpis.throughputPerDay
  const passedToMeet = !baseKpis.meetsDemand && labKpis.meetsDemand
  const lostMeeting = baseKpis.meetsDemand && !labKpis.meetsDemand
  const bnChanged = labKpis.bottleneckStationId !== baseKpis.bottleneckStationId
  const leadDelta = labKpis.leadTimeMin - baseKpis.leadTimeMin
  const balDelta = (labKpis.balancingEfficiency - baseKpis.balancingEfficiency) * 100

  let tone: "positive" | "negative" | "neutral" = "neutral"
  if (passedToMeet || throughputDelta >= 5) tone = "positive"
  else if (lostMeeting || throughputDelta <= -5) tone = "negative"

  const bgClass =
    tone === "positive"
      ? "border-green-200/60 bg-green-50/50"
      : tone === "negative"
        ? "border-red-200/60 bg-red-50/50"
        : "border-border bg-muted/20"

  const iconColor =
    tone === "positive" ? "text-green-600" : tone === "negative" ? "text-red-600" : "text-muted-foreground"

  const textColor =
    tone === "positive"
      ? "text-green-800"
      : tone === "negative"
        ? "text-red-800"
        : "text-foreground/80"

  const parts: string[] = []

  if (Math.abs(throughputDelta) >= 1) {
    parts.push(
      throughputDelta > 0
        ? t("throughputUp", { delta: throughputDelta })
        : t("throughputDown", { delta: throughputDelta })
    )
  }

  if (passedToMeet) parts.push(t("passesToMeet"))
  if (lostMeeting) parts.push(t("lostMeeting"))

  if (!passedToMeet && !lostMeeting && Math.abs(leadDelta) >= 2) {
    parts.push(
      leadDelta < 0
        ? t("leadDown", { value: Math.abs(leadDelta).toFixed(1) })
        : t("leadUp", { value: leadDelta.toFixed(1) })
    )
  }

  if (!passedToMeet && !lostMeeting && Math.abs(balDelta) >= 3) {
    parts.push(
      balDelta > 0
        ? t("balUp", { value: balDelta.toFixed(1) })
        : t("balDown", { value: Math.abs(balDelta).toFixed(1) })
    )
  }

  if (bnChanged) {
    parts.push(t("bnChanges", { name: labKpis.bottleneckStationName }))
  }

  const sentence = parts.length > 0 ? `${t("prefix")} ${parts.join(", ")}.` : t("noChange")

  return (
    <div className={cn("mb-3 rounded-lg border px-3 py-2.5", bgClass)}>
      <div className="flex items-start gap-2">
        {tone === "positive" ? (
          <TrendingUp className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
        ) : tone === "negative" ? (
          <TrendingDown className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
        ) : (
          <Minus className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
        )}
        <p className={cn("text-xs font-medium leading-snug", textColor)}>{sentence}</p>
      </div>
    </div>
  )
}
