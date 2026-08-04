import { useTranslations } from "next-intl"
import {
  Gauge,
  GitCompare,
  Layers,
  BarChart3,
  FileDown,
  Zap,
} from "lucide-react"

// ─── Capability pill ───────────────────────────────────────────────────────────

function CapabilityItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-background p-4 transition-all duration-200 hover:shadow-md hover:border-primary">
      <div className="mt-0.5 shrink-0 rounded-md border bg-muted/50 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs leading-relaxed text-foreground/65">{description}</p>
      </div>
    </div>
  )
}

const CAPABILITY_ICONS = [Layers, GitCompare, BarChart3, FileDown, Zap, Gauge]

export default function CapabilitiesSection() {
  const t = useTranslations("landing.capabilities")
  const items = t.raw("items") as { title: string; description: string }[]

  return (
<section className="reveal relative z-10 px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-structure" />
    <div className="mx-auto max-w-4xl">
      <div className="mb-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("heading")}</h2>
        <p className="mt-2 text-sm text-foreground/60">
          {t("sub")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <CapabilityItem
            key={i}
            icon={CAPABILITY_ICONS[i]}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </div>
  </section>
  )
}
