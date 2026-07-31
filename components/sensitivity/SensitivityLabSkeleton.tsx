import { Card, CardContent, CardHeader } from "@/components/ui/card"

// ─── Skeleton ──────────────────────────────────────────────────────────────────

export default function SensitivityLabSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <div className="h-5 w-5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          <div className="space-y-3 md:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="space-y-2 md:col-span-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
