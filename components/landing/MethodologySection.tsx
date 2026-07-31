import { useTranslations } from "next-intl"

export default function MethodologySection() {
  const t = useTranslations("landing.methodology")

  return (
<section className="reveal relative z-10 bg-grid-pattern-light px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-calm" />
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        {t("heading")}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-foreground/70">
        {t("textA")}{" "}
        <span className="font-medium text-foreground">{t("boldA")}</span>{" "}
        {t("textB")}{" "}
        <span className="font-medium text-foreground">
          {t("boldB")}
        </span>{" "}
        {t("textC")}
      </p>
    </div>
  </section>
  )
}
