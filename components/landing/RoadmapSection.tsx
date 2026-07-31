import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Cpu,
  Rocket,
  FlaskConical,
  Sparkles,
} from "lucide-react"

const PHASE_META = [
  { icon: Cpu, color: "bg-emerald-500", shadow: "shadow-emerald-500/20", done: true, active: false },
  { icon: FlaskConical, color: "bg-emerald-500", shadow: "shadow-emerald-500/20", done: true, active: false },
  { icon: Rocket, color: "bg-slate-400", shadow: "shadow-slate-400/10", done: false, active: false },
  { icon: Sparkles, color: "bg-slate-400", shadow: "shadow-slate-400/10", done: false, active: false },
]

export default function RoadmapSection() {
  const t = useTranslations("landing.roadmap")
  const phases = t.raw("phases") as { phase: string; status: string; title: string; desc: string }[]

  return (
<section className="reveal relative z-10 border-t border-border/50 bg-grid-pattern-light px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-product opacity-30" />
    <div className="mx-auto max-w-5xl">
      <div className="mb-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("heading")}</h2>
        <p className="mt-2 text-sm text-foreground/60">
          {t("sub")}
        </p>
      </div>

      <div className="relative grid gap-8 md:grid-cols-4">
        {phases.map((item, i) => {
          const meta = PHASE_META[i]
          const Icon = meta.icon
          return (
            <div
              key={i}
              className={cn(
                "relative group rounded-2xl border bg-background/60 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30",
                meta.active && "border-primary/40 ring-1 ring-primary/20 bg-background/80"
              )}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className={cn(
                  "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white",
                  meta.color,
                  meta.shadow
                )}>
                  {item.phase}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{item.status}</span>
              </div>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 transition-colors group-hover:bg-primary/10 group-hover:border-primary/20">
                <Icon className={cn("h-6 w-6 transition-transform duration-500 group-hover:scale-110", meta.done ? "text-emerald-500" : "text-primary")} />
              </div>

              <h3 className="mb-2 text-sm font-bold tracking-tight">{item.title}</h3>
              <p className="text-xs leading-relaxed text-foreground/60">{item.desc}</p>

              {meta.active && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3 animate-shimmer" />
                  </div>
                  <span className="text-[8px] font-bold text-primary">65%</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-16 flex flex-col items-center justify-center space-y-6">
        <div className="flex items-center gap-4 text-xs font-bold text-foreground/40 uppercase tracking-[0.2em]">
          <div className="h-px w-8 bg-border" />
          {t("tagline")}
          <div className="h-px w-8 bg-border" />
        </div>
        <Button
          size="lg"
          className="group h-14 px-8 rounded-2xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-2xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
        >
          <Link href="/simulador" className="flex items-center gap-3">
            {t("cta")}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
  )
}
