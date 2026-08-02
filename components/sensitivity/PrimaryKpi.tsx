import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

// ─── Primary KPI card ──────────────────────────────────────────────────────────

export default function PrimaryKpi({
  icon: Icon,
  label,
  current,
  projected,
  unit,
  format,
  better,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  current: number
  projected: number
  unit?: string
  format: (v: number) => string
  better: "higher" | "lower" | "none"
}) {
  const t = useTranslations("simulator.lab")
  const delta = projected - current
  const hasChange = Math.abs(delta) >= 0.01
  const isBetter =
    better === "higher" ? delta > 0 : better === "lower" ? delta < 0 : false
  const isWorse =
    better === "higher" ? delta < 0 : better === "lower" ? delta > 0 : false

  return (
    <div className="flex flex-col rounded-lg border bg-background p-3">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tabular-nums">{format(projected)}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">
          {format(current)} {t("currentSuffix")}
        </span>
        {hasChange && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-bold",
              isBetter ? "text-green-600" : isWorse ? "text-red-600" : "text-muted-foreground"
            )}
          >
            {isBetter ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : isWorse ? (
              <ArrowDownRight className="h-2.5 w-2.5" />
            ) : null}
            {delta > 0 ? "+" : ""}
            {format(delta)}
          </span>
        )}
      </div>
    </div>
  )
}
