import { useTranslations } from "next-intl"
import {
  Cpu,
  Box,
  Database,
} from "lucide-react"

const CARD_ICONS = [Cpu, Box, Database]
const CARD_TAGS = [
  ["Next.js 16", "TypeScript"],
  ["Tailwind v4", "Lucide Icons"],
  ["Local Storage", "Zustand"],
]

export default function TechStackSection() {
  const t = useTranslations("landing.tech")
  const cards = t.raw("cards") as { title: string; description: string }[]

  return (
<section className="reveal relative z-10 bg-grid-pattern-light px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-product opacity-40" />
    <div className="mx-auto max-w-5xl">
      <div className="mb-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("heading")}</h2>
        <p className="mt-2 text-sm text-foreground/60">
          {t("sub")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = CARD_ICONS[i]
          return (
            <div key={i} className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-bold">{card.title}</h3>
              <p className="text-sm leading-relaxed text-foreground/70 mb-6">
                {card.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {CARD_TAGS[i].map((tag) => (
                  <span key={tag} className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">{tag}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </section>
  )
}
