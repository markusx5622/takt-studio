import { cn } from "@/lib/utils"

// ─── LabControl (refined) ──────────────────────────────────────────────────────

export default function LabControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
  disabled?: boolean
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0

  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/10 p-3 transition-opacity",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-foreground/80">{label}</span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
            }}
            className="h-7 w-14 rounded-md border bg-background px-1.5 text-right text-xs font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <div className="relative mt-2 h-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent focus:outline-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-sm"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%, hsl(var(--muted)) 100%)`,
            borderRadius: "9999px",
            height: "5px",
            marginTop: "5px",
          }}
        />
      </div>
    </div>
  )
}
