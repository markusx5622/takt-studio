import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

// ─── Shift selector (refined) ──────────────────────────────────────────────────

export default function ShiftSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const t = useTranslations("simulator.lab")
  return (
    <div className="rounded-lg border bg-muted/10 p-3">
      <span className="text-xs font-medium text-foreground/80">{t("shiftsPerDay")}</span>
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "flex-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-all",
              value === n
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
