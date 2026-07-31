import { cn } from "@/lib/utils"

// ─── Detail row (for accordion) ────────────────────────────────────────────────

export default function DetailRow({
  label,
  current,
  projected,
  unit,
  invert,
  decimals = 1,
  formatCustom,
}: {
  label: string
  current: number
  projected: number
  unit?: string
  invert?: boolean
  decimals?: number
  formatCustom?: (v: number) => string
}) {
  const delta = projected - current
  const isBetter = invert ? delta < 0 : delta > 0
  const isWorse = invert ? delta > 0 : delta < 0
  const hasChange = Math.abs(delta) >= 0.01

  const fmt =
    formatCustom ??
    ((v: number) => (decimals === 0 ? String(Math.round(v)) : v.toFixed(decimals)))

  return (
    <div className="flex items-center justify-between border-b border-border/40 px-2 py-1 last:border-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] tabular-nums text-muted-foreground/70">{fmt(current)}</span>
        <span className="text-[10px] text-muted-foreground/30">→</span>
        <span className="text-[11px] font-semibold tabular-nums">{fmt(projected)}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        {hasChange && (
          <span
            className={cn(
              "text-[10px] font-medium",
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
