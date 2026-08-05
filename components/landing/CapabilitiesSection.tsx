import { useTranslations } from "next-intl"
import {
  Gauge,
  GitCompare,
  Layers,
  BarChart3,
  FileDown,
  Zap,
} from "lucide-react"

const CAPABILITY_ICONS = [Layers, GitCompare, BarChart3, FileDown, Zap, Gauge]

export default function CapabilitiesSection() {
  const t = useTranslations("landing.capabilities")
  const items = t.raw("items") as { title: string; description: string }[]

  return (
    <section className="reveal relative z-10 px-4 py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 section-ambient-structure" />
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 backdrop-blur-sm">
            Bento Grid Architecture
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("sub")}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = CAPABILITY_ICONS[i]
            // Make card 1 (i=0), card 4 (i=3), and card 5 (i=4) span 2 cols for a balanced 3-row bento grid
            const isFeatured = i === 0 || i === 3 || i === 4
            return (
              <div
                key={i}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-background/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md ${
                  isFeatured ? "sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-background via-background to-blue-50/40" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    0{i + 1}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
