import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ConsultingBackground from "@/components/ConsultingBackground"
import {
  Settings2,
  LayoutList,
  AlertTriangle,
  Activity,
  GitCompare,
  FileText,
  BookOpen,
  Lightbulb,
  MousePointerClick
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
  { id: "s1", icon: Settings2, color: "bg-blue-100/50 text-blue-600", borderColor: "border-blue-200" },
  { id: "s2", icon: LayoutList, color: "bg-indigo-100/50 text-indigo-600", borderColor: "border-indigo-200" },
  { id: "s3", icon: AlertTriangle, color: "bg-rose-100/50 text-rose-600", borderColor: "border-rose-200" },
  { id: "s4", icon: Activity, color: "bg-emerald-100/50 text-emerald-600", borderColor: "border-emerald-200" },
  { id: "s5", icon: GitCompare, color: "bg-amber-100/50 text-amber-600", borderColor: "border-amber-200" },
  { id: "s6", icon: FileText, color: "bg-slate-200/50 text-slate-700", borderColor: "border-slate-300" },
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
      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-12 px-4 pt-4 pb-24 md:pb-12">
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
              <Card className={`flex-1 overflow-hidden border-border/60 bg-background/95 backdrop-blur-md shadow-sm transition-all hover:shadow-md ${step.borderColor}`}>
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
                <CardContent className="space-y-6 pt-6">
                  {/* Desc */}
                  <p className="text-base leading-relaxed text-foreground/90 font-medium">
                    {t(`steps.${step.id}.desc`)}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Theory */}
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-indigo-700">
                        <BookOpen className="h-4 w-4" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">{t("labels.theory")}</h4>
                      </div>
                      <p className="text-sm text-indigo-900/80 leading-relaxed">
                        {t(`steps.${step.id}.theory`)}
                      </p>
                    </div>

                    {/* Tip */}
                    <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-amber-700">
                        <Lightbulb className="h-4 w-4" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">{t("labels.tip")}</h4>
                      </div>
                      <p className="text-sm text-amber-900/80 leading-relaxed">
                        {t(`steps.${step.id}.tip`)}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-emerald-700">
                      <MousePointerClick className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">{t("labels.action")}</h4>
                    </div>
                    <p className="text-sm text-emerald-900/80 leading-relaxed font-medium">
                      {t(`steps.${step.id}.action`)}
                    </p>
                  </div>
                  
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
