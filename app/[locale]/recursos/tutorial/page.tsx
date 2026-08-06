import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ConsultingBackground from "@/components/ConsultingBackground"
import {
  Settings2,
  LayoutList,
  AlertTriangle,
  Activity,
  GitCompare,
  FileText
} from "lucide-react"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "resources.tutorial" })
  return {
    title: `${t("title")} | Takt Studio`,
    description: t("subtitle"),
  }
}

const STEPS = [
  { id: "s1", icon: Settings2, color: "bg-blue-100/50 text-blue-600" },
  { id: "s2", icon: LayoutList, color: "bg-indigo-100/50 text-indigo-600" },
  { id: "s3", icon: AlertTriangle, color: "bg-rose-100/50 text-rose-600" },
  { id: "s4", icon: Activity, color: "bg-emerald-100/50 text-emerald-600" },
  { id: "s5", icon: GitCompare, color: "bg-amber-100/50 text-amber-600" },
  { id: "s6", icon: FileText, color: "bg-slate-200/50 text-slate-700" },
]

export default async function TutorialPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("resources.tutorial")

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/50">
      <ConsultingBackground />
      
      {/* ── Encabezado ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-8 pt-4 text-center md:pt-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* ── Vertical Timeline ────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-3xl space-y-8 px-4 pt-4 pb-24 md:pb-12">
        <div className="absolute left-[39px] top-4 bottom-24 hidden w-px bg-border/60 md:block" />
        
        {STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.id} className="relative flex flex-col gap-6 md:flex-row md:items-start">
              {/* Timeline Node */}
              <div className="hidden shrink-0 items-center justify-center pt-1 md:flex">
                <div className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-50/50 ${step.color} bg-background shadow-sm ring-1 ring-border/50`}>
                  <span className="text-lg font-bold">{index + 1}</span>
                </div>
              </div>
              
              {/* Card Content */}
              <Card className="flex-1 overflow-hidden border-border/60 bg-background/95 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-border">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b border-border/40 bg-muted/30 pb-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.color} md:hidden`}>
                    <span className="text-lg font-bold">{index + 1}</span>
                  </div>
                  <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg ${step.color} md:flex`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Paso {index + 1}
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                      {t(`steps.${step.id}.title`)}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {t(`steps.${step.id}.desc`)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
