import { useTranslations } from "next-intl"
import {
  GitCompare,
  Settings2,
  ScanSearch,
} from "lucide-react"

// ─── Step card ─────────────────────────────────────────────────────────────────

function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border bg-background font-bold text-sm text-primary shadow-sm">
        {step}
      </div>
      <div className="mb-3 inline-flex rounded-lg border bg-muted/50 p-2.5">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="max-w-[16rem] text-xs leading-relaxed text-foreground/70">{description}</p>
    </div>
  )
}

const STEP_ICONS = [Settings2, ScanSearch, GitCompare]

export default function HowItWorks() {
  const t = useTranslations("landing.howItWorks")
  const steps = t.raw("steps") as { title: string; description: string }[]

  return (
<section className="reveal relative z-10 bg-grid-pattern-light px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-product" />
    <div className="mx-auto max-w-4xl">
      <div className="mb-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("heading")}</h2>
        <p className="mt-2 text-sm text-foreground/60">
          {t("sub")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
        {steps.map((s, i) => (
          <StepCard
            key={i}
            step={`${i + 1}`}
            icon={STEP_ICONS[i]}
            title={s.title}
            description={s.description}
          />
        ))}
      </div>
    </div>
  </section>
  )
}
