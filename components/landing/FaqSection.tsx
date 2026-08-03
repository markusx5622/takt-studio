import { useTranslations } from "next-intl"
import {
  HelpCircle,
  ChevronDown,
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
          <details
            key={i}
            className="group rounded-2xl border bg-background/40 p-6 backdrop-blur-xl transition-all open:bg-background/60 open:shadow-md hover:bg-background/60"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              <div className="shrink-0">
                <HelpCircle className="h-5 w-5 text-primary/60" />
              </div>
              <h3 className="flex-1 text-sm font-bold tracking-tight text-foreground/90">{faq.q}</h3>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-3 pl-9 text-xs leading-relaxed text-foreground/60">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
  )
}
