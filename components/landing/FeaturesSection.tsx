import { useTranslations } from "next-intl"
import {
  Gauge,
  AlertTriangle,
  GitCompare,
} from "lucide-react"

// ─── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay: string
}) {
  return (
    <div
      className="animate-fade-up group rounded-xl border bg-background p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20"
      style={{ animationDelay: delay }}
    >
      <div className="mb-4 inline-flex rounded-lg border bg-muted/50 p-2.5 transition-colors group-hover:bg-primary/10 group-hover:border-primary/20">
        <Icon className="h-5 w-5 text-primary transition-colors" />
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-foreground/70">{description}</p>
    </div>
  )
}

const FEATURE_ICONS = [Gauge, AlertTriangle, GitCompare]
const FEATURE_DELAYS = ["0ms", "100ms", "200ms"]

export default function FeaturesSection() {
  const t = useTranslations("landing.features")
  const items = t.raw("items") as { title: string; description: string }[]

  return (
<section className="reveal relative z-10 px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-product" />
    <div className="mx-auto max-w-5xl">
      <div className="mb-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("heading")}
        </h2>
        <p className="mt-2 text-sm text-foreground/60">
          {t("sub")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item, i) => (
          <FeatureCard
            key={i}
            icon={FEATURE_ICONS[i]}
            title={item.title}
            description={item.description}
            delay={FEATURE_DELAYS[i]}
          />
        ))}
      </div>
    </div>
  </section>
  )
}
