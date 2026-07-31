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
        <a
          href="https://www.porcelanosa.com/trendbook/banos-prefabricados/"
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
        >
          {t("boldA")}
        </a>{" "}
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
