import { useTranslations } from "next-intl"

export default function MetricsSection() {
  const t = useTranslations("landing.metrics")

  const stats = [
    { val: t("kpi1Val"), label: t("kpi1Label") },
    { val: t("kpi2Val"), label: t("kpi2Label") },
    { val: t("kpi3Val"), label: t("kpi3Label") },
    { val: t("kpi4Val"), label: t("kpi4Label") },
  ]

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200/80 bg-background/80 p-8 shadow-sm backdrop-blur-xl md:p-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
                {stat.val}
              </span>
              <span className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
