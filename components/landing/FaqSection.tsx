import { useTranslations } from "next-intl"
import {
  HelpCircle,
} from "lucide-react"

export default function FaqSection() {
  const t = useTranslations("landing.faq")
  const items = t.raw("items") as { q: string; a: string }[]

  return (
<section className="reveal relative z-10 px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-structure opacity-50" />
    <div className="mx-auto max-w-4xl">
      <div className="mb-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("heading")}</h2>
        <p className="mt-2 text-sm text-foreground/60">
          {t("sub")}
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((faq, i) => (
          <div
            key={i}
            className="group rounded-2xl border bg-background/40 p-6 backdrop-blur-xl transition-all hover:bg-background/60 hover:shadow-md"
          >
            <div className="flex gap-4">
              <div className="mt-1 shrink-0">
                <HelpCircle className="h-5 w-5 text-primary/60" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold tracking-tight text-foreground/90">{faq.q}</h3>
                <p className="text-xs leading-relaxed text-foreground/60">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}
