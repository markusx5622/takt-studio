import { cn } from "@/lib/utils"
import type { Station } from "@/types"

// ─── Station selector ──────────────────────────────────────────────────────────

export default function StationSelector({
  stations,
  value,
  onChange,
  baseBottleneckId,
  onSelectBaseBottleneck,
  isBaseBottleneckSelected,
}: {
  stations: Station[]
  value: string
  onChange: (id: string) => void
  baseBottleneckId?: string
  onSelectBaseBottleneck?: () => void
  isBaseBottleneckSelected?: boolean
}) {
  return (
    <div className="rounded-lg border bg-muted/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-foreground/80">Estación objetivo</label>
        {onSelectBaseBottleneck && (
          <button
            type="button"
            onClick={onSelectBaseBottleneck}
            disabled={isBaseBottleneckSelected}
            className={cn(
              "text-[10px] font-medium transition-colors",
              isBaseBottleneckSelected
                ? "cursor-default text-muted-foreground/30"
                : "text-primary hover:text-primary/80 hover:underline"
            )}
          >
            Usar cuello de botella
          </button>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border bg-background px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {stations.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}{s.id === baseBottleneckId ? " (cuello de botella)" : ""}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[10px] text-muted-foreground/60">
        {isBaseBottleneckSelected
          ? "Estás trabajando sobre la estación crítica recomendada."
          : "Puedes cambiar la estación manualmente o volver a la recomendada."}
      </p>
    </div>
  )
}
