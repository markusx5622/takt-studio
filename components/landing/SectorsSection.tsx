import { useTranslations } from "next-intl"
import { Car, Building2, Cpu, PackageCheck } from "lucide-react"

export default function SectorsSection() {
  const t = useTranslations("landing.sectors")

  const sectors = [
    {
      icon: Car,
      title: t("automotive.title"),
      desc: t("automotive.desc"),
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      icon: Building2,
      title: t("modular.title"),
      desc: t("modular.desc"),
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      icon: Cpu,
      title: t("electronics.title"),
      desc: t("electronics.desc"),
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      icon: PackageCheck,
      title: t("logistics.title"),
      desc: t("logistics.desc"),
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
  ]

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 backdrop-blur-sm">
        {t("badge")}
      </div>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t("heading")}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {t("sub")}
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sectors.map((sec, idx) => {
          const Icon = sec.icon
          return (
            <div
              key={idx}
              className="group relative flex flex-col rounded-xl border border-slate-200/70 bg-background/70 p-6 text-left shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg border ${sec.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {sec.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {sec.desc}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
