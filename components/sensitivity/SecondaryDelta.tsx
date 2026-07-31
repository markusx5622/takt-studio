import { cn } from "@/lib/utils"

// ─── Secondary delta row ───────────────────────────────────────────────────────

export default function SecondaryDelta({
  label,
  current,
  projected,
  unit,
  invert,
  decimals = 1,
}: {
  label: string
  current: number
  projected: number
  unit?: string
  invert?: boolean
  decimals?: number
}) {
  const delta = projected - current
  const isBetter = invert ? delta < 0 : delta > 0
  const isWorse = invert ? delta > 0 : delta < 0
  const hasChange = Math.abs(delta) >= 0.01

  const fmt = (v: number) =>
    decimals === 0 ? String(Math.round(v)) : v.toFixed(decimals)

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground/70">{fmt(current)}</span>
        <span className="text-[10px] text-muted-foreground/40">→</span>
        <span className="text-xs font-semibold">{fmt(projected)}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        {hasChange && (
          <span
            className={cn(
              "text-[10px] font-semibold",
              isBetter ? "text-green-600" : isWorse ? "text-red-600" : "text-muted-foreground"
            )}
          >
            {delta > 0 ? "+" : ""}
            {fmt(delta)}
          </span>
        )}
      </div>
    </div>
  )
}
